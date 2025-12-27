import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MailX, CheckCircle, AlertCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error">("confirm");
  const [processing, setProcessing] = useState(false);

  const handleUnsubscribe = async () => {
    if (!email) {
      toast.error("No email provided");
      setStatus("error");
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("update-outreach-status", {
        body: { action: "unsubscribe", email },
      });

      if (error) throw error;

      setStatus("success");
      toast.success("You have been unsubscribed from marketing emails");
      trackEvent('email_unsubscribe', { action: 'unsubscribe' });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      toast.error("Failed to unsubscribe. Please try again or contact support.");
    } finally {
      setProcessing(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;

    setProcessing(true);

    try {
      const { error } = await supabase.functions.invoke("update-outreach-status", {
        body: { action: "resubscribe", email },
      });

      if (error) throw error;

      setStatus("confirm");
      toast.success("You have been resubscribed to marketing emails");
      trackEvent('email_unsubscribe', { action: 'resubscribe' });
    } catch (error) {
      console.error("Resubscribe error:", error);
      toast.error("Failed to resubscribe. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Unsubscribe"
        description="Manage your email preferences for CRUMS Leasing communications."
        canonical="https://crumsleasing.com/unsubscribe"
        noindex
      />
      <Navigation />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4 max-w-md">
          {status === "confirm" && (
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <MailX className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>Unsubscribe from Emails</CardTitle>
                <CardDescription>
                  {email ? (
                    <>
                      You are about to unsubscribe <strong>{email}</strong> from CRUMS Leasing marketing emails.
                    </>
                  ) : (
                    "No email address provided."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {email ? (
                  <>
                    <p className="text-sm text-muted-foreground text-center">
                      You will no longer receive promotional emails, reminders, or newsletters. 
                      Important account-related emails may still be sent.
                    </p>
                    <Button
                      onClick={handleUnsubscribe}
                      disabled={processing}
                      variant="destructive"
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Unsubscribe"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = "/"}
                  >
                    Go to Homepage
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {status === "success" && (
            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">Successfully Unsubscribed</CardTitle>
                <CardDescription>
                  <strong>{email}</strong> has been removed from our marketing email list.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Changed your mind? You can resubscribe at any time.
                </p>
                <Button
                  onClick={handleResubscribe}
                  disabled={processing}
                  variant="outline"
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Resubscribe"
                  )}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => window.location.href = "/"}
                >
                  Go to Homepage
                </Button>
              </CardContent>
            </Card>
          )}

          {status === "error" && (
            <Card className="border-2 border-destructive/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Something Went Wrong</CardTitle>
                <CardDescription>
                  We couldn't process your request. Please try again or contact support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setStatus("confirm")}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  className="w-full"
                  onClick={() => window.location.href = "/contact"}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
