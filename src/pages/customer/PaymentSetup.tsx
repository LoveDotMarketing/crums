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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Loader2, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  Calendar,
  FileText,
  DollarSign,
  Mail,
  CreditCard,
  ChevronDown,
  Clock,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
  const [billingAnchorDay, setBillingAnchorDay] = useState<1 | 15>(1);
  const [isAchInfoOpen, setIsAchInfoOpen] = useState(false);

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

  const [setupError, setSetupError] = useState<{ message: string; canRetry: boolean } | null>(null);

  const handleSetupPayment = async () => {
    try {
      setIsSettingUp(true);
      setSetupError(null);
      
      // Create SetupIntent
      const { data, error } = await supabase.functions.invoke("create-ach-setup");
      
      if (error) throw error;
      
      if (!data?.clientSecret) {
        throw new Error("Failed to create setup session");
      }

      if (!data?.publishableKey) {
        throw new Error("Stripe publishable key not available");
      }

      // Load Stripe.js dynamically
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(data.publishableKey);
      
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // STEP 1: Collect bank account via Financial Connections
      const { setupIntent: collectedSetupIntent, error: collectError } = 
        await stripe.collectBankAccountForSetup({
          clientSecret: data.clientSecret,
          params: {
            payment_method_type: 'us_bank_account',
            payment_method_data: {
              billing_details: {
                name: user?.user_metadata?.first_name 
                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
                  : user?.email || 'Customer',
                email: user?.email,
              },
            },
          },
          expand: ['payment_method'],
        });

      if (collectError) {
        console.error("Error collecting bank account:", collectError);
        if (collectError.type === 'validation_error') {
          setSetupError({ message: "Please check your information and try again.", canRetry: true });
        } else {
          setSetupError({ message: collectError.message || "Failed to connect to your bank. Please try again.", canRetry: true });
        }
        return;
      }

      // Check if user cancelled or closed the modal
      if (!collectedSetupIntent || collectedSetupIntent.status === 'requires_payment_method') {
        toast.info("Bank account linking was cancelled. You can try again when you're ready.");
        return;
      }

      // STEP 2: If the bank requires additional confirmation (e.g., mandate acceptance)
      if (collectedSetupIntent.status === 'requires_confirmation') {
        const { setupIntent: confirmedSetupIntent, error: confirmError } = 
          await stripe.confirmUsBankAccountSetup(data.clientSecret);

        if (confirmError) {
          console.error("Error confirming setup:", confirmError);
          setSetupError({ 
            message: "Bank verification failed. This can happen if your bank session timed out. Please try again.", 
            canRetry: true 
          });
          return;
        }

        // Handle the final status
        if (confirmedSetupIntent?.status === 'succeeded') {
          await supabase.functions.invoke("confirm-ach-setup", {
            body: {
              setupIntentId: confirmedSetupIntent.id,
              paymentMethodId: confirmedSetupIntent.payment_method,
              billingAnchorDay: billingAnchorDay,
            },
          });
          toast.success("Bank account linked successfully!");
          checkPaymentStatus();
        } else if (confirmedSetupIntent?.status === 'requires_action') {
          toast.info("Bank account requires verification. Check your email for next steps.");
          checkPaymentStatus();
        }
      } else if (collectedSetupIntent.status === 'succeeded') {
        // Direct success (instant verification completed)
        await supabase.functions.invoke("confirm-ach-setup", {
          body: {
            setupIntentId: collectedSetupIntent.id,
            paymentMethodId: collectedSetupIntent.payment_method,
            billingAnchorDay: billingAnchorDay,
          },
        });
        toast.success("Bank account linked successfully!");
        checkPaymentStatus();
      } else if (collectedSetupIntent.status === 'requires_action') {
        // Microdeposit verification required
        toast.info("Bank account requires verification. Check your email for next steps.");
        checkPaymentStatus();
      }
    } catch (error) {
      console.error("Error setting up payment:", error);
      const message = error instanceof Error ? error.message : "Failed to set up payment method";
      
      // Detect network errors
      if (message.includes('fetch') || message.includes('network') || message.includes('NetworkError')) {
        setSetupError({ 
          message: "Connection lost during setup. Your bank was not charged. Please check your internet and try again.", 
          canRetry: true 
        });
      } else {
        setSetupError({ message, canRetry: true });
      }
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

  const hasPaymentMethod = paymentStatus?.hasPaymentMethod;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <CustomerNav />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Payment Setup</h1>
          <p className="text-muted-foreground mt-2">
            Link your bank account for future billing
          </p>
        </div>

        {/* Application Status Banner — only show before payment is complete */}
        {paymentStatus && !hasPaymentMethod && paymentStatus.applicationStatus && (
          <Card className="mb-6">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Your Onboarding Progress</p>

              {/* Step Tracker */}
              <div className="relative flex items-start justify-between">
                {/* Progress connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />

                {/* Step 1: Application Submitted */}
                {(() => {
                  const appStatus = paymentStatus.applicationStatus;
                  const step1Complete = ["pending_review", "approved", "rejected"].includes(appStatus!);
                  const step1Active = appStatus === "new";
                  const step2Complete = ["approved", "rejected"].includes(appStatus!);
                  const step2Active = appStatus === "pending_review";
                  const step3Complete = appStatus === "approved";
                  const step3Active = false;
                  const isRejected = appStatus === "rejected";

                  return (
                    <>
                      <div className="relative flex flex-col items-center text-center z-10 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background ${step1Complete ? "border-primary bg-primary text-primary-foreground" : step1Active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                          {step1Complete ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${step1Complete || step1Active ? "text-foreground" : "text-muted-foreground"}`}>Application Submitted</span>
                      </div>

                      <div className="relative flex flex-col items-center text-center z-10 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background ${step2Complete ? "border-primary bg-primary text-primary-foreground" : step2Active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                          {step2Complete ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${step2Complete || step2Active ? "text-foreground" : "text-muted-foreground"}`}>Under Review</span>
                      </div>

                      <div className="relative flex flex-col items-center text-center z-10 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background ${isRejected ? "border-destructive bg-destructive text-destructive-foreground" : step3Complete ? "border-primary bg-primary text-primary-foreground" : step3Active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                          {isRejected ? <AlertCircle className="h-4 w-4" /> : step3Complete ? <CheckCircle2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${isRejected ? "text-destructive" : step3Complete ? "text-foreground" : "text-muted-foreground"}`}>
                          {isRejected ? "Rejected" : "Approved"}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Contextual Message */}
              <div className="mt-5 pt-4 border-t border-border">
                {paymentStatus.applicationStatus === "new" && (
                  <p className="text-sm text-muted-foreground">Your application is still being prepared. Our team will begin reviewing it shortly.</p>
                )}
                {paymentStatus.applicationStatus === "pending_review" && (
                  <p className="text-sm text-muted-foreground">Our team is reviewing your application. This typically takes 1–2 business days. You can complete payment setup now — <span className="font-medium text-foreground">no charges will occur until a trailer is assigned.</span></p>
                )}
                {paymentStatus.applicationStatus === "approved" && (
                  <p className="text-sm text-muted-foreground">Your application is approved! Complete bank linking below to finish onboarding.</p>
                )}
                {paymentStatus.applicationStatus === "rejected" && (
                  <p className="text-sm text-destructive">Your application was not approved. Please call <span className="font-medium">(888) 570-4564</span> for details.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Current Payment Method - Already Connected */}
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

        {/* Main Setup Flow - Only show if no payment method */}
        {!hasPaymentMethod && (
          <div className="space-y-6">
            {/* SECTION 1: Hero Alert - No Charges Today */}
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
                      You Won't Be Charged Today
                    </h2>
                    <p className="text-green-700/80 dark:text-green-300/80">
                      You're simply linking your bank account for future billing. 
                      No money will be withdrawn until:
                    </p>
                    <ul className="space-y-1 text-green-700/80 dark:text-green-300/80">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        We assign a trailer to your account
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        You receive notification of your first charge
                      </li>
                    </ul>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 pt-1">
                      This is just an authorization — not a payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: What You're Doing Today */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You're Doing Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Authorizing CRUMS Leasing to collect future payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Selecting your preferred payment due date (1st or 15th)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">That's it — no charges, no commitments today</span>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: Billing Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When Will I Be Charged?</CardTitle>
                <CardDescription>Here's exactly when billing happens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                {/* Timeline Item 1: Today */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center border-2 border-green-500">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="w-0.5 h-full bg-border flex-1 min-h-[40px]" />
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">Today</span>
                      <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                        NO CHARGE
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Link your bank account securely. This is just an authorization.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 2: Trailer Assignment */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/30">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="w-0.5 h-full bg-border flex-1 min-h-[40px]" />
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">When We Assign Your Trailer</span>
                    </div>
                    <p className="text-muted-foreground">
                      $1,000 security deposit charged via ACH
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      You'll receive email notification before this charge
                    </p>
                  </div>
                </div>

                {/* Timeline Item 3: Recurring Monthly */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/30">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">Recurring Monthly</span>
                    </div>
                    <p className="text-muted-foreground">
                      Monthly rent charged automatically on your selected date (1st or 15th)
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      No action needed from you — fully automatic
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 4: Payment Date Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Select Your Payment Due Date</CardTitle>
                </div>
                <CardDescription>
                  Choose when you'd like your monthly payments to be due
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={billingAnchorDay.toString()}
                  onValueChange={(val) => setBillingAnchorDay(val === "1" ? 1 : 15)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="1"
                      id="anchor-1"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="anchor-1"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl font-bold">1st</span>
                      <span className="text-sm text-muted-foreground">of the month</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="15"
                      id="anchor-15"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="anchor-15"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl font-bold">15th</span>
                      <span className="text-sm text-muted-foreground">of the month</span>
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  This selection is final and cannot be changed after setup. Choose carefully.
                </p>
              </CardContent>
            </Card>

            {/* SECTION 5: Link Bank Account Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleSetupPayment}
                  disabled={isSettingUp}
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

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secured by Stripe • Bank-level encryption</span>
                </div>

                {setupError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Setup Issue</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>{setupError.message}</p>
                      {setupError.canRetry && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSetupError(null); handleSetupPayment(); }}
                          disabled={isSettingUp}
                        >
                          Try Again
                        </Button>
                      )}
                      <p className="text-xs mt-2">
                        Still having trouble? Call us at{" "}
                        <a href="tel:+12103909498" className="underline font-medium">(210) 390-9498</a>
                        {" "}and we'll help you get set up.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* SECTION 6: What is ACH? (Collapsible) */}
            <Collapsible open={isAchInfoOpen} onOpenChange={setIsAchInfoOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">What is ACH?</CardTitle>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isAchInfoOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-muted-foreground">
                      ACH (Automated Clearing House) is the same secure electronic payment system used for:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Direct deposit of paychecks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Utility and mortgage payments
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Government benefit payments
                      </li>
                    </ul>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Why we use ACH instead of credit cards:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Lower fees = lower costs for you
                        </li>
                        <li className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          Direct bank connection = no expired cards or declined payments
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Reliable = helps avoid payment failures and service interruptions
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* SECTION 7: Billing Terms from Lease Agreement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Billing Terms (From Your Lease Agreement)</CardTitle>
                </div>
                <CardDescription>
                  These terms are outlined in your Trailer Leasing Agreement which you will sign via DocuSign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ach-authorization">
                    <AccordionTrigger>ACH Authorization</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>
                        By signing the Trailer Leasing Agreement, you authorize CRUMS Leasing to initiate 
                        ACH withdrawals for all amounts owed, including:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Monthly lease payments</li>
                        <li>Security deposit ($1,000 per trailer)</li>
                        <li>Late fees</li>
                        <li>Toll charges</li>
                        <li>Damage invoices</li>
                        <li>Any outstanding balances</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-failure">
                    <AccordionTrigger>ACH Payment Failure</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>If any ACH payment is declined or returned for any reason:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>A <strong>$100.00 ACH decline fee</strong> will be applied</li>
                        <li>CRUMS Leasing will contact you requesting updated payment information</li>
                        <li>All outstanding balances remain immediately due until resolved</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="grace-period">
                    <AccordionTrigger>Grace Period & Late Fees</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>
                        You have <strong>seven (7) calendar days</strong> after your selected payment due date 
                        to submit payment manually through the Customer Portal.
                      </p>
                      <p>If payment is not received by the end of Day 7:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>A <strong>$150.00 late fee</strong> will be assessed</li>
                        <li>CRUMS Leasing will automatically deduct the outstanding balance via ACH</li>
                      </ul>
                      <p className="text-sm pt-2">
                        <strong>Note:</strong> You will receive email notifications at Day 0, 3, and 5 to help 
                        you avoid late fees.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="default">
                    <AccordionTrigger>Default Conditions</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>You are in default if you:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Fail to make any payment when due</li>
                        <li>Fail to maintain required insurance</li>
                        <li>Violate any term of the Agreement</li>
                        <li>Provide false or misleading information</li>
                      </ul>
                      <p className="pt-2">
                        Upon default, CRUMS Leasing may recover or repossess the Trailer, terminate the 
                        Agreement, and pursue all available remedies.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="security-deposit">
                    <AccordionTrigger>Security Deposit</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>
                        The <strong>$1,000.00 security deposit</strong> (per trailer) may be applied toward:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Damages to the trailer</li>
                        <li>Unpaid tolls</li>
                        <li>Outstanding balances</li>
                        <li>Excessive wear</li>
                      </ul>
                      <p className="pt-2">
                        If no charges are owed at the end of your lease, the deposit will be returned via 
                        ACH within fourteen (14) days after inspection completion.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tolls">
                    <AccordionTrigger>Tolls & Administrative Fees</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p>
                        You are solely responsible for all tolls, toll invoices, administrative charges, 
                        penalties, and violations incurred during use or possession of the Trailer(s).
                      </p>
                      <p>If CRUMS Leasing receives a toll notice:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You will receive an email invoice detailing the charge</li>
                        <li>The toll amount will be deducted via ACH</li>
                      </ul>
                      <p className="pt-2">
                        <strong>Unpaid Toll Charges:</strong> You have twenty (20) calendar days from 
                        invoice date to resolve the toll. If unpaid after 20 days, a <strong>$20.00 per 
                        day administrative late fee</strong> will accrue until paid.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* SECTION 8: FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Will I be charged when I link my account?</AccordionTrigger>
                    <AccordionContent>
                      No. Linking your account is just an authorization. No charges are made until we 
                      assign a trailer to your account. You'll receive email notification before your 
                      first charge.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>When does billing actually start?</AccordionTrigger>
                    <AccordionContent>
                      Billing starts when we assign a trailer to your account. Your $1,000 security 
                      deposit is charged first, then monthly rent begins on your selected date 
                      (1st or 15th of the month).
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What happens if a payment fails?</AccordionTrigger>
                    <AccordionContent>
                      Per your lease agreement, you'll receive email notifications at Day 0, 3, and 5. 
                      A 7-day grace period applies to resolve the issue. ACH helps avoid these issues 
                      by providing a reliable direct bank connection — no expired cards or declined 
                      transactions.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Can I use a credit card instead?</AccordionTrigger>
                    <AccordionContent>
                      CRUMS Leasing only accepts ACH bank payments. This keeps processing fees low 
                      (saving you money) and ensures reliable, consistent payments. Credit cards often 
                      decline due to limits, fraud alerts, or expiration, which can interrupt your service.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Is my bank information secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes. We partner with Stripe, a PCI Level 1 certified payment processor — the 
                      highest level of security certification. Your bank credentials are never stored 
                      on our servers. The connection uses bank-level encryption.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>What if my bank isn't supported for instant verification?</AccordionTrigger>
                    <AccordionContent>
                      If instant verification isn't available for your bank, we'll verify your account 
                      using micro-deposits. Two small deposits (usually a few cents each) will appear 
                      in your account within 1-2 business days, which you'll confirm to complete verification.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>Can I change my payment method later?</AccordionTrigger>
                    <AccordionContent>
                      Yes. Contact our support team to update your payment method. We'll help you 
                      link a new bank account if needed.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
