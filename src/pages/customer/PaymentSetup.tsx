import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Building2, CheckCircle2, AlertCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  bankName: string;
  last4: string;
  accountType: string;
  accountHolderType: string;
}

interface PaymentStatus {
  hasPaymentMethod: boolean;
  applicationStatus: string | null;
  paymentSetupStatus: string | null;
  paymentMethod?: PaymentMethod;
}

export default function PaymentSetup() {
  const { user, isLoading: authLoading } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    if (user) {
      checkPaymentStatus();
    }
  }, [user]);

  const checkPaymentStatus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("check-payment-status");
      
      if (error) throw error;
      setPaymentStatus(data);
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Failed to check payment status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPayment = async () => {
    try {
      setIsSettingUp(true);
      
      // Create SetupIntent
      const { data, error } = await supabase.functions.invoke("create-ach-setup");
      
      if (error) throw error;
      
      if (!data?.clientSecret) {
        throw new Error("Failed to create setup session");
      }

      // Load Stripe.js dynamically
      // Publishable key is safe to include in frontend code
      const stripePublishableKey = "pk_test_51Sa3rWPtmYCiZhW22r6qr9yOYgo6tLZPWtlebm2BRdoX08weKgT6zFrr2sCIZIbwZY6OyCuKspBzOSnUYNktjkkg00GkEw1CPJ";

      // Load Stripe.js
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(stripePublishableKey);
      
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Confirm the SetupIntent with Financial Connections
      // The Financial Connections modal will open automatically
      // For Financial Connections, we pass an empty object - the modal collects bank details
      // @ts-ignore - Stripe types don't match runtime behavior for Financial Connections
      const result = await stripe.confirmUsBankAccountSetup(data.clientSecret);
      
      const { error: confirmError, setupIntent } = result;

      if (confirmError) {
        console.error("Stripe confirmError:", confirmError);
        if (confirmError.type === "validation_error") {
          toast.error(confirmError.message || "Validation error");
        } else {
          throw confirmError;
        }
        return;
      }

      if (setupIntent?.status === "succeeded") {
        // Confirm the setup on our backend
        await supabase.functions.invoke("confirm-ach-setup", {
          body: {
            setupIntentId: setupIntent.id,
            paymentMethodId: setupIntent.payment_method,
          },
        });

        toast.success("Bank account linked successfully!");
        checkPaymentStatus();
      } else if (setupIntent?.status === "requires_action") {
        // Bank account requires verification (microdeposits)
        toast.info("Bank account requires verification. Check your email for next steps.");
        checkPaymentStatus();
      } else {
        toast.info(`Setup status: ${setupIntent?.status}. Please try again or contact support.`);
      }
    } catch (error) {
      console.error("Error setting up payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to set up payment method");
    } finally {
      setIsSettingUp(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <CustomerNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isApproved = paymentStatus?.applicationStatus === "approved";
  const hasPaymentMethod = paymentStatus?.hasPaymentMethod;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <CustomerNav />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Payment Setup</h1>
          <p className="text-muted-foreground mt-2">
            Link your bank account for secure ACH payments
          </p>
        </div>

        {/* Status Alert */}
        {!isApproved && (
          <Alert variant="default" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Required</AlertTitle>
            <AlertDescription>
              Your application must be approved before you can set up payment. 
              Please complete your application first.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Payment Method */}
        {hasPaymentMethod && paymentStatus?.paymentMethod && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-700 dark:text-green-400">
                    Payment Method Active
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-lg border">
                <Building2 className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {paymentStatus.paymentMethod.bankName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paymentStatus.paymentMethod.accountType.charAt(0).toUpperCase() + 
                     paymentStatus.paymentMethod.accountType.slice(1)} ••••{paymentStatus.paymentMethod.last4}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Your bank account is linked and ready for payments. To update your payment method, 
                please contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Setup Card */}
        {!hasPaymentMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Link Your Bank Account
              </CardTitle>
              <CardDescription>
                Connect your bank account securely for ACH direct debit payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Secure Bank Verification</p>
                  <p className="text-muted-foreground mt-1">
                    We use Stripe's secure bank verification to link your account. Your credentials 
                    are never stored on our servers. Most banks verify instantly.
                  </p>
                </div>
              </div>

              {/* How it Works */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">How it works:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                    <span>Click "Link Bank Account" to open secure verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                    <span>Select your bank and log in with your online banking credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                    <span>Choose which account to use for payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">4</span>
                    <span>Your account will be instantly verified and ready for billing</span>
                  </li>
                </ol>
              </div>

              {/* Action Button */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleSetupPayment}
                disabled={!isApproved || isSettingUp}
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Link Bank Account
                  </>
                )}
              </Button>

              {!isApproved && (
                <p className="text-sm text-center text-muted-foreground">
                  Button disabled until your application is approved
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
                Is my bank information secure?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-4">
                Yes. We partner with Stripe, a PCI Level 1 certified payment processor. Your bank 
                credentials are never stored on our servers. The connection uses bank-level encryption.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
                What if my bank isn't supported for instant verification?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-4">
                If instant verification isn't available for your bank, we'll verify your account using 
                micro-deposits. Two small deposits will appear in your account within 1-2 business days, 
                which you'll confirm to complete verification.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
                Can I change my payment method later?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-4">
                Yes. Contact our support team to update your payment method. We'll help you link a 
                new bank account.
              </p>
            </details>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
