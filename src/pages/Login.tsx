import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, signupSchema } from "@/lib/validations";
import { z } from "zod";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin" | "mechanic">("customer");
  const navigate = useNavigate();
  const { signIn, signUp, user, userRole } = useAuth();

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
        const { error } = await signUp(email, password, selectedRole);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message || "Failed to create account");
          }
        } else {
          // Navigate based on role
          if (selectedRole === "admin") {
            navigate("/dashboard/admin");
          } else if (selectedRole === "mechanic") {
            navigate("/dashboard/mechanic");
          } else {
            navigate("/dashboard/customer");
          }
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
      />
      <Navigation />

      <section className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground">
                Access your CRUMS Leasing customer portal
              </p>
            </div>

            <Tabs 
              defaultValue="customer" 
              className="w-full"
              onValueChange={(value) => setSelectedRole(value as "customer" | "admin" | "mechanic")}
            >
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="mechanic">Mechanic</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
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
                      {!isSignUp && (
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-muted-foreground">Remember me</span>
                          </label>
                          <a href="#" className="text-primary hover:underline">
                            Forgot password?
                          </a>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Please wait..." : isSignUp ? "Create Admin Account" : "Sign In"}
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
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <a href="/contact" className="text-primary hover:underline">
                        Contact us
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mechanic">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{isSignUp ? "Create Mechanic Account" : "Mechanic Portal"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="mechanic-email">Email</Label>
                        <Input
                          id="mechanic-email"
                          type="email"
                          placeholder="mechanic@crumsleasing.com"
                          required
                          className="mt-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mechanic-password">Password</Label>
                        <Input
                          id="mechanic-password"
                          type="password"
                          required
                          className="mt-2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      {!isSignUp && (
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-muted-foreground">Remember me</span>
                          </label>
                          <a href="#" className="text-primary hover:underline">
                            Forgot password?
                          </a>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Please wait..." : isSignUp ? "Create Mechanic Account" : "Sign In"}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{isSignUp ? "Create Admin Account" : "Admin Portal"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@crumsleasing.com"
                          required
                          className="mt-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          required
                          className="mt-2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      {!isSignUp && (
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-muted-foreground">Remember me</span>
                          </label>
                          <a href="#" className="text-primary hover:underline">
                            Forgot password?
                          </a>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Please wait..." : isSignUp ? "Create Admin Account" : "Sign In"}
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
