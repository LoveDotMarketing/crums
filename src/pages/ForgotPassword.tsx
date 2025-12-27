import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { trackFormSubmission } from "@/lib/analytics";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        trackFormSubmission('forgot_password', false);
      } else {
        setEmailSent(true);
        toast.success("Password reset link sent to your email");
        trackFormSubmission('forgot_password', true);
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
        title="Forgot Password"
        description="Reset your CRUMS Leasing account password."
        canonical="https://crumsleasing.com/forgot-password"
        noindex
      />
      <Navigation />

      <section className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>

            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {emailSent ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Mail className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {emailSent ? "Check Your Email" : "Forgot Password?"}
                </CardTitle>
                <CardDescription>
                  {emailSent 
                    ? "We've sent a password reset link to your email address."
                    : "Enter your email and we'll send you a link to reset your password."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailSent ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setEmailSent(false)}
                    >
                      Try Again
                    </Button>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full">
                        Return to Login
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
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
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
