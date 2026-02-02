import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  CreditCard, 
  FileText, 
  IdCard, 
  Truck, 
  Loader2,
  ExternalLink,
  Shield,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface CustomerCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trailer: {
    id: string;
    trailer_number: string;
    vin: string | null;
    license_plate: string | null;
    type: string;
  };
  customerId: string;
  mechanicId: string;
  releaseRequestId?: string;
  onCheckoutComplete: () => void;
}

interface CustomerEligibility {
  isEligible: boolean;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    company_name: string | null;
  } | null;
  profile: {
    first_name: string;
    last_name: string;
    drivers_license_url: string | null;
    drivers_license_back_url: string | null;
  } | null;
  application: {
    status: string;
    drivers_license_url: string | null;
    drivers_license_back_url: string | null;
  } | null;
  subscription: {
    status: string;
    stripe_customer_id: string | null;
  } | null;
  issues: string[];
}

interface CheckoutAgreement {
  id: string;
  pre_pickup_signed: boolean;
  final_release_signed: boolean;
  id_verified: boolean;
  status: string;
}

export function CustomerCheckoutDialog({
  open,
  onOpenChange,
  trailer,
  customerId,
  mechanicId,
  releaseRequestId,
  onCheckoutComplete
}: CustomerCheckoutDialogProps) {
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<CustomerEligibility | null>(null);
  const [agreement, setAgreement] = useState<CheckoutAgreement | null>(null);
  const [step, setStep] = useState<"eligibility" | "id_verify" | "pre_pickup" | "final_release" | "complete">("eligibility");
  const [idVerified, setIdVerified] = useState(false);
  const [idNotes, setIdNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      checkEligibility();
    }
  }, [open, customerId]);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const issues: string[] = [];
      
      // Fetch customer record
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, company_name")
        .eq("id", customerId)
        .single();

      if (customerError || !customer) {
        setEligibility({ isEligible: false, customer: null, profile: null, application: null, subscription: null, issues: ["Customer not found"] });
        setLoading(false);
        return;
      }

      // Fetch profile with ID photos
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("email", customer.email)
        .single();

      // Fetch application
      const { data: applications } = await supabase
        .from("customer_applications")
        .select("status, drivers_license_url, drivers_license_back_url, payment_setup_status")
        .eq("user_id", (await supabase.from("profiles").select("id").eq("email", customer.email).single()).data?.id || "");
      
      const application = applications?.[0] || null;

      if (!application || application.status !== "approved") {
        issues.push("Application not approved");
      }

      if (!application?.drivers_license_url) {
        issues.push("Driver's license (front) not uploaded");
      }

      if (!application?.drivers_license_back_url) {
        issues.push("Driver's license (back) not uploaded");
      }

      // Fetch subscription status
      const { data: subscription } = await supabase
        .from("customer_subscriptions")
        .select("status, stripe_customer_id")
        .eq("customer_id", customerId)
        .single();

      if (!subscription?.stripe_customer_id) {
        issues.push("ACH bank account not linked");
      }

      if (subscription && subscription.status !== "active" && subscription.status !== "pending") {
        issues.push("Subscription not active");
      }

      // Check for existing agreement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingAgreement } = await (supabase as any)
        .from("trailer_checkout_agreements")
        .select("id, pre_pickup_signed, final_release_signed, id_verified, status")
        .eq("trailer_id", trailer.id)
        .eq("customer_id", customerId)
        .neq("status", "completed")
        .neq("status", "cancelled")
        .maybeSingle();

      if (existingAgreement) {
        setAgreement(existingAgreement);
        // Determine current step based on agreement status
        if (!existingAgreement.pre_pickup_signed) {
          setStep("pre_pickup");
        } else if (!existingAgreement.id_verified) {
          setStep("id_verify");
        } else if (!existingAgreement.final_release_signed) {
          setStep("final_release");
        } else {
          setStep("complete");
        }
      }

      setEligibility({
        isEligible: issues.length === 0,
        customer,
        profile: profile ? { ...profile, drivers_license_url: application?.drivers_license_url || null, drivers_license_back_url: application?.drivers_license_back_url || null } : null,
        application,
        subscription,
        issues
      });
    } catch (error) {
      console.error("Error checking eligibility:", error);
      toast.error("Failed to check customer eligibility");
    } finally {
      setLoading(false);
    }
  };

  const createAgreement = async () => {
    setProcessing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("trailer_checkout_agreements")
        .insert({
          trailer_id: trailer.id,
          customer_id: customerId,
          release_request_id: releaseRequestId || null,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      setAgreement(data);
      setStep("pre_pickup");
      toast.success("Checkout process started");
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrePickupSign = async () => {
    if (!agreement) return;
    setProcessing(true);
    try {
      // Mock DocuSign - in production this would redirect to DocuSign
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("trailer_checkout_agreements")
        .update({
          pre_pickup_signed: true,
          pre_pickup_signed_at: new Date().toISOString(),
          pre_pickup_signer_name: eligibility?.customer?.full_name,
          status: "pre_pickup_complete"
        })
        .eq("id", agreement.id);

      if (error) throw error;
      
      setAgreement({ ...agreement, pre_pickup_signed: true, status: "pre_pickup_complete" });
      setStep("id_verify");
      toast.success("Pre-pickup agreement signed successfully");
    } catch (error) {
      console.error("Error signing pre-pickup agreement:", error);
      toast.error("Failed to record signature");
    } finally {
      setProcessing(false);
    }
  };

  const handleIdVerification = async () => {
    if (!agreement || !idVerified) return;
    setProcessing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("trailer_checkout_agreements")
        .update({
          id_verified: true,
          id_verified_at: new Date().toISOString(),
          id_verified_by: mechanicId,
          id_verification_notes: idNotes,
          status: "ready_for_pickup"
        })
        .eq("id", agreement.id);

      if (error) throw error;
      
      setAgreement({ ...agreement, id_verified: true, status: "ready_for_pickup" });
      setStep("final_release");
      toast.success("ID verified successfully");
    } catch (error) {
      console.error("Error verifying ID:", error);
      toast.error("Failed to record ID verification");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalRelease = async () => {
    if (!agreement) return;
    setProcessing(true);
    try {
      // Mock DocuSign final release
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: agreementError } = await (supabase as any)
        .from("trailer_checkout_agreements")
        .update({
          final_release_signed: true,
          final_release_signed_at: new Date().toISOString(),
          final_release_signer_name: eligibility?.customer?.full_name,
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: mechanicId
        })
        .eq("id", agreement.id);

      if (agreementError) throw agreementError;

      // Update trailer to rented status
      const { error: trailerError } = await supabase
        .from("trailers")
        .update({
          status: "rented",
          is_rented: true,
          customer_id: customerId
        })
        .eq("id", trailer.id);

      if (trailerError) throw trailerError;

      // Log fleet activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("fleet_activity_logs").insert({
        trailer_id: trailer.id,
        performed_by: mechanicId,
        action_type: "customer_checkout",
        previous_status: "available",
        new_status: "rented",
        notes: `Checked out to ${eligibility?.customer?.full_name} (${eligibility?.customer?.company_name || "Individual"})`,
        new_customer_id: customerId,
        metadata: { 
          trailer_number: trailer.trailer_number, 
          vin: trailer.vin,
          customer_name: eligibility?.customer?.full_name
        }
      });

      toast.success("Trailer successfully released to customer!");
      setStep("complete");
      onCheckoutComplete();
    } catch (error) {
      console.error("Error completing checkout:", error);
      toast.error("Failed to complete checkout");
    } finally {
      setProcessing(false);
    }
  };

  const renderEligibilityStep = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Trailer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Number:</span> {trailer.trailer_number}</div>
          <div><span className="text-muted-foreground">Type:</span> {trailer.type}</div>
          <div className="col-span-2"><span className="text-muted-foreground">VIN:</span> <code className="text-xs">{trailer.vin || "N/A"}</code></div>
        </CardContent>
      </Card>

      {eligibility?.customer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {eligibility.customer.full_name}</div>
            <div><span className="text-muted-foreground">Company:</span> {eligibility.customer.company_name || "Individual"}</div>
            <div><span className="text-muted-foreground">Phone:</span> {eligibility.customer.phone}</div>
            <div><span className="text-muted-foreground">Email:</span> {eligibility.customer.email}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Checkout Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {eligibility?.application?.status === "approved" ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span>Application Approved</span>
          </div>
          <div className="flex items-center gap-2">
            {eligibility?.application?.drivers_license_url ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span>Driver's License (Front) Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            {eligibility?.application?.drivers_license_back_url ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span>Driver's License (Back) Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            {eligibility?.subscription?.stripe_customer_id ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span>ACH Bank Account Linked</span>
          </div>

          {eligibility && !eligibility.isEligible && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cannot Proceed</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {eligibility.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderIdVerifyStep = () => (
    <div className="space-y-4">
      <Alert>
        <IdCard className="h-4 w-4" />
        <AlertTitle>ID Verification Required</AlertTitle>
        <AlertDescription>
          Compare the customer's physical ID with their uploaded documents before proceeding.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uploaded ID Documents</CardTitle>
          <CardDescription>Review these documents and compare with physical ID</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Driver's License (Front)</Label>
            {eligibility?.profile?.drivers_license_url ? (
              <a 
                href={eligibility.profile.drivers_license_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Document
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">Not uploaded</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Driver's License (Back)</Label>
            {eligibility?.profile?.drivers_license_back_url ? (
              <a 
                href={eligibility.profile.drivers_license_back_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Document
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">Not uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="idVerified"
              checked={idVerified}
              onCheckedChange={(checked) => setIdVerified(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="idVerified" className="font-medium">
                I have verified the customer's physical ID matches the uploaded documents
              </Label>
              <p className="text-sm text-muted-foreground">
                Confirm name, photo, and expiration date match
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNotes">Verification Notes (Optional)</Label>
            <Textarea
              id="idNotes"
              placeholder="Any notes about the ID verification..."
              value={idNotes}
              onChange={(e) => setIdNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrePickupStep = () => (
    <div className="space-y-4">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Pre-Pickup Agreement</AlertTitle>
        <AlertDescription>
          The customer must sign this agreement before arriving for trailer pickup. This can be done remotely.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pre-Pickup Lease Agreement</CardTitle>
          <CardDescription>
            This agreement covers terms and conditions, insurance requirements, and payment authorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p><strong>Agreement Terms Include:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Monthly lease rate and payment schedule</li>
              <li>Insurance coverage requirements</li>
              <li>Maintenance responsibilities</li>
              <li>Return condition expectations</li>
              <li>Liability and indemnification</li>
            </ul>
          </div>

          {agreement?.pre_pickup_signed ? (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span>Pre-pickup agreement signed</span>
            </div>
          ) : (
            <Button onClick={handlePrePickupSign} disabled={processing} className="w-full">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Send DocuSign for Pre-Pickup Agreement
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFinalReleaseStep = () => (
    <div className="space-y-4">
      <Alert className="border-primary bg-primary/10">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertTitle>Ready for Final Release</AlertTitle>
        <AlertDescription>
          ID verified. Complete the final release agreement before the customer hooks up and drives away.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Release Agreement</CardTitle>
          <CardDescription>
            On-site signing confirming trailer condition acceptance and pickup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p><strong>Final Release Confirms:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Customer accepts trailer in current condition</li>
              <li>Pre-trip inspection completed</li>
              <li>Customer assumes responsibility for trailer</li>
              <li>Contact information for roadside assistance provided</li>
            </ul>
          </div>

          <Button onClick={handleFinalRelease} disabled={processing} className="w-full">
            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Complete Final Release & Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-4 py-8">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">Checkout Complete!</h3>
        <p className="text-muted-foreground mt-2">
          Trailer {trailer.trailer_number} has been released to {eligibility?.customer?.full_name}.
        </p>
      </div>
      <Button onClick={() => onOpenChange(false)}>
        Close
      </Button>
    </div>
  );

  const getStepIndicator = () => {
    const steps = [
      { key: "eligibility", label: "Eligibility", icon: Shield },
      { key: "pre_pickup", label: "Pre-Pickup", icon: FileText },
      { key: "id_verify", label: "ID Verify", icon: IdCard },
      { key: "final_release", label: "Release", icon: Truck },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-2 ${i <= currentIndex ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i < currentIndex ? "bg-primary text-primary-foreground" : 
                i === currentIndex ? "bg-primary/20 text-primary border-2 border-primary" : 
                "bg-muted"
              }`}>
                {i < currentIndex ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className="text-xs hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${i < currentIndex ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Customer Trailer Checkout
          </DialogTitle>
          <DialogDescription>
            Complete the checkout process to release trailer to customer
          </DialogDescription>
        </DialogHeader>

        {step !== "complete" && getStepIndicator()}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {step === "eligibility" && renderEligibilityStep()}
            {step === "pre_pickup" && renderPrePickupStep()}
            {step === "id_verify" && renderIdVerifyStep()}
            {step === "final_release" && renderFinalReleaseStep()}
            {step === "complete" && renderCompleteStep()}
          </>
        )}

        {step !== "complete" && (
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === "eligibility" && eligibility?.isEligible && (
              <Button onClick={createAgreement} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Start Checkout Process
              </Button>
            )}
            {step === "id_verify" && (
              <Button onClick={handleIdVerification} disabled={!idVerified || processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm ID Verification
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
