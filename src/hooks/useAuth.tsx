import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LoginAttemptResult {
  allowed: boolean;
  locked?: boolean;
  locked_until?: string;
  minutes_remaining?: number;
  attempts_remaining?: number;
}

interface FailedLoginResult {
  locked: boolean;
  attempts: number;
  attempts_remaining?: number;
  minutes_remaining?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: "admin" | "customer" | "mechanic" | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; locked?: boolean; minutesRemaining?: number }>;
  signUp: (email: string, password: string, role: "admin" | "customer" | "mechanic") => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkLoginAllowed: (email: string) => Promise<LoginAttemptResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "customer" | "mechanic" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const sessionStartTime = useState<Date | null>(null);

  // Track login event
  const trackLoginEvent = async (userId: string, email: string, role: string | null) => {
    try {
      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        email: email,
        role: role,
        event_type: 'login',
        user_agent: navigator.userAgent,
      });
    } catch (err) {
      console.error("Error tracking login:", err);
    }
  };

  // Track logout event
  const trackLogoutEvent = async (userId: string, email: string, role: string | null) => {
    try {
      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        email: email,
        role: role,
        event_type: 'logout',
        user_agent: navigator.userAgent,
      });
    } catch (err) {
      console.error("Error tracking logout:", err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role when session changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } else {
        setUserRole(data?.role as "admin" | "customer" | "mechanic");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginAllowed = async (email: string): Promise<LoginAttemptResult> => {
    try {
      const { data, error } = await supabase.rpc('check_login_attempt', { p_email: email });
      if (error) {
        console.error("Error checking login attempts:", error);
        return { allowed: true, attempts_remaining: 5 }; // Fail open on error
      }
      return data as unknown as LoginAttemptResult;
    } catch (err) {
      console.error("Error in checkLoginAllowed:", err);
      return { allowed: true, attempts_remaining: 5 };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if login is allowed (rate limiting)
    const attemptCheck = await checkLoginAllowed(email);
    
    if (!attemptCheck.allowed) {
      return { 
        error: new Error(`Account temporarily locked. Please try again in ${attemptCheck.minutes_remaining} minutes.`),
        locked: true,
        minutesRemaining: attemptCheck.minutes_remaining
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Record failed login attempt
      try {
        const { data: failedResult } = await supabase.rpc('record_failed_login', { p_email: email });
        const result = failedResult as unknown as FailedLoginResult;
        
        if (result?.locked) {
          return { 
            error: new Error(`Too many failed attempts. Account locked for ${result.minutes_remaining} minutes.`),
            locked: true,
            minutesRemaining: result.minutes_remaining
          };
        } else if (result?.attempts_remaining) {
          toast.error(`Invalid credentials. ${result.attempts_remaining} attempts remaining.`);
        }
      } catch (err) {
        console.error("Error recording failed login:", err);
      }
      
      return { error };
    }

    // Successful login - reset attempts and track login
    try {
      await supabase.rpc('reset_login_attempts', { p_email: email });
    } catch (err) {
      console.error("Error resetting login attempts:", err);
    }

    // Track login event after successful auth (will be tracked when we know the role)
    const { data: { user: loggedInUser } } = await supabase.auth.getUser();
    if (loggedInUser) {
      // Get user role for logging
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", loggedInUser.id)
        .single();
      
      trackLoginEvent(loggedInUser.id, email, roleData?.role || null);
    }

    toast.success("Welcome back!");
    return { error: null };
  };

  const signUp = async (email: string, password: string, role: "admin" | "customer" | "mechanic") => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error && data.user) {
      // Call secure database function to set user role
      const { error: roleError } = await supabase.rpc('set_user_role', {
        _role: role
      });

      if (roleError) {
        console.error("Error creating user role:", roleError);
        return { error: roleError };
      }

      toast.success("Account created successfully!");
    }

    return { error };
  };

  const signOut = async () => {
    // Track logout before signing out
    if (user && user.email) {
      await trackLogoutEvent(user.id, user.email, userRole);
    }
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserRole(null);
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, isLoading, signIn, signUp, signOut, checkLoginAllowed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
