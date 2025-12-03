import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, signupSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [activeTab, setActiveTab] = useState<"customer" | "staff">("customer");
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
        const validationResult = signupSchema.safeParse({ 
          email, 
          password,
          firstName: "",
          lastName: "",
          phone: ""
        });
        
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
            try {
              // Validate and get the referral code
              const { data: codeData } = await supabase
                .from("referral_codes")
                .select("id")
                .eq("code", referralCode.trim().toUpperCase())
                .eq("is_active", true)
                .maybeSingle();

              if (codeData) {
                // Create referral record
                await supabase.from("referrals").insert({
                  referrer_code_id: codeData.id,
                  referred_email: email,
                  status: "pending"
                });
                toast.success("Referral code applied! You'll receive $250 off after lease approval.");
              }
            } catch {
              // Non-critical, don't block signup flow
            }
          }

          navigate("/dashboard/customer");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Invalid email or password");
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

            <Tabs 
              defaultValue="customer" 
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value as "customer" | "staff");
                // Staff can only sign in, not sign up
                if (value === "staff") {
                  setIsSignUp(false);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{isSignUp ? "Create Customer Account" : "Customer Portal"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="customer-email">Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="your.email@company.com"
                          required
                          className="mt-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-password">Password</Label>
                        <Input
                          id="customer-password"
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
                          <Input
                            id="referral-code"
                            type="text"
                            placeholder="e.g. CRUMS-ABC123"
                            className="mt-2"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Have a referral code? Enter it to save $250 on your lease!
                          </p>
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
                        disabled={isLoading}
                      >
                        {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                      </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      {isSignUp ? "Already have an account? " : "Don't have an account? "}
                      <button 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary hover:underline"
                      >
                        {isSignUp ? "Sign in" : "Create account"}
                      </button>
                    </div>
                    {!isSignUp && (
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Need help?{" "}
                        <a href="/contact" className="text-primary hover:underline">
                          Contact us
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="staff">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Staff Portal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="staff-email">Email</Label>
                        <Input
                          id="staff-email"
                          type="email"
                          placeholder="staff@crumsleasing.com"
                          required
                          className="mt-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="staff-password">Password</Label>
                        <Input
                          id="staff-password"
                          type="password"
                          required
                          className="mt-2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-muted-foreground">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Please wait..." : "Sign In"}
                      </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      Staff accounts are created by administrators.
                      <br />
                      Contact your manager if you need access.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                For security purposes, all login attempts are monitored and logged.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
