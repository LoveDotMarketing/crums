import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasValidSession(!!session);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
        
        // Update outreach status to mark password as set
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await supabase.functions.invoke("update-outreach-status", {
            body: { action: "password_set", email: user.email },
          });
        }

        // Redirect after a short delay
        setTimeout(() => navigate("/login"), 3000);
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
        title="Reset Password"
        description="Set a new password for your CRUMS Leasing account."
        canonical="https://crumsleasing.com/reset-password"
        noindex
      />
      <Navigation />

      <section className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {isSuccess ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : hasValidSession === false ? (
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  ) : (
                    <Lock className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {isSuccess 
                    ? "Password Updated!" 
                    : hasValidSession === false 
                      ? "Invalid or Expired Link"
                      : "Set New Password"
                  }
                </CardTitle>
                <CardDescription>
                  {isSuccess 
                    ? "Your password has been successfully updated. Redirecting to login..."
                    : hasValidSession === false
                      ? "This password reset link is invalid or has expired."
                      : "Enter your new password below."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to the login page shortly.
                    </p>
                    <Link to="/login">
                      <Button className="w-full">Go to Login</Button>
                    </Link>
                  </div>
                ) : hasValidSession === false ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Please request a new password reset link.
                    </p>
                    <Link to="/forgot-password">
                      <Button className="w-full">Request New Link</Button>
                    </Link>
                  </div>
                ) : hasValidSession === null ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="mt-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 8 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="mt-2"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
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

export default ResetPassword;
