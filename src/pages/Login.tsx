import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, quickSignupSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Lock, Check, AlertCircle, Clipboard } from "lucide-react";
import { trackLogin, trackSignup, trackSignupStarted, trackSignupFailed } from "@/lib/analytics";
import { processReferralCode, validateReferralCode } from "@/lib/referral";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, userRole } = useAuth();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Clear lockout when email changes (user might be trying a different account)
  useEffect(() => {
    setLockoutMinutes(null);
  }, [email]);

  useEffect(() => {
    if (user && userRole) {
      if (userRole === "admin") {
        navigate("/dashboard/admin");
      } else if (userRole === "mechanic") {
        navigate("/dashboard/mechanic");
      } else {
        navigate("/dashboard/customer");
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      if (isSignUp) {
        const validationResult = quickSignupSchema.safeParse({ email, password });
        
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          toast.error(firstError.message);
          setIsLoading(false);
          return;
        }
      } else {
        const validationResult = loginSchema.safeParse({ email, password });
        
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          toast.error(firstError.message);
          setIsLoading(false);
          return;
        }
      }

      if (isSignUp) {
        // Only customers can self-register - admin/mechanic accounts must be created by an admin
        const { error } = await signUp(email, password, "customer");
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else if (error.message.includes("Only customer role")) {
            toast.error("Please contact an administrator to create staff accounts.");
          } else {
            toast.error(error.message || "Failed to create account");
            trackSignupFailed(error.message || 'unknown_error');
          }
        } else {
          // Track that this customer has set their password (for outreach tracking)
          try {
            await supabase.functions.invoke("update-outreach-status", {
              body: { action: "password_set", email },
            });
          } catch {
            // Non-critical, don't block signup flow
          }

          // Track referral if a code was provided
          if (referralCode.trim()) {
            const referralResult = await processReferralCode(referralCode, email);
            if (referralResult) {
              if (referralResult.success) {
                toast.success(referralResult.message);
              } else if (referralResult.variant === "destructive") {
                toast.error(referralResult.message);
              } else {
                toast.info(referralResult.message);
              }
            }
          }

          // Track successful signup
          trackSignup('email');
          navigate("/dashboard/customer");
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          if (result.locked) {
            setLockoutMinutes(result.minutesRemaining || 15);
            toast.error(`Account locked. Please try again in ${result.minutesRemaining} minutes.`);
          } else {
            toast.error(result.error.message || "Invalid email or password");
          }
        } else {
          setLockoutMinutes(null);
          // Track successful login
          trackLogin('email');
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Login"
        description="Access your CRUMS Leasing customer portal. Sign in to manage your trailer rentals, view your account, and request support."
        canonical="https://crumsleasing.com/login"
        noindex
      />
      <Navigation />

      <section className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground">
                Access your CRUMS Leasing portal
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
              </CardHeader>
              <CardContent>
                {lockoutMinutes && !isSignUp && (
                  <Alert variant="destructive" className="mb-4">
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Account temporarily locked due to too many failed attempts. 
                      Please try again in {lockoutMinutes} minutes.
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@company.com"
                      required
                      className="mt-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="mt-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {isSignUp && (
                    <div>
                      <Label htmlFor="referral-code" className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        Referral Code (optional)
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <Input
                            id="referral-code"
                            type="text"
                            placeholder="e.g. CRUMS-ABC123"
                            className={`pr-10 ${
                              referralCode.trim() 
                                ? validateReferralCode(referralCode).valid 
                                  ? "border-green-500 focus-visible:ring-green-500" 
                                  : "border-destructive focus-visible:ring-destructive"
                                : ""
                            }`}
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                setShowPasteHint(true);
                                setTimeout(() => setShowPasteHint(false), 2000);
                              }
                            }}
                            onFocus={() => setShowPasteHint(false)}
                          />
                          {referralCode.trim() && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {validateReferralCode(referralCode).valid ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              setReferralCode(text.toUpperCase().trim());
                            } catch {
                              toast.error("Unable to access clipboard");
                            }
                          }}
                          title="Paste from clipboard"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                      {referralCode.trim() && !validateReferralCode(referralCode).valid ? (
                        <p className="text-xs text-destructive mt-1">
                          {validateReferralCode(referralCode).error}
                        </p>
                      ) : showPasteHint ? (
                        <p className="text-xs text-primary mt-1 animate-pulse">
                          Pasting... or click the clipboard button
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Have a referral code? Enter it to save $250 on your lease!
                        </p>
                      )}
                    </div>
                  )}
                  {!isSignUp && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    disabled={isLoading || (!isSignUp && !!lockoutMinutes)}
                  >
                    {isLoading ? "Please wait..." : isSignUp ? "Create Account" : lockoutMinutes ? "Account Locked" : "Sign In"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button 
                    onClick={() => {
                      if (!isSignUp) trackSignupStarted('login_page');
                      setIsSignUp(!isSignUp);
                    }}
                    className="text-primary hover:underline"
                  >
                    {isSignUp ? "Sign in" : "Create account"}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Need help?{" "}
                    <Link to="/contact" className="text-primary hover:underline">
                      Contact us
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
