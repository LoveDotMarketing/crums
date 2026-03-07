import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fireMetaCapi } from "@/lib/analytics";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navigation } from "@/components/Navigation";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SignatureCapture } from "@/components/mechanic/SignatureCapture";
import { 
  Truck, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  ClipboardCheck,
  Loader2
} from "lucide-react";

interface Inspection {
  id: string;
  trailer_id: string;
  trailer_number: string;
  vin: string | null;
  license_plate: string | null;
  trailer_type: string | null;
  inspection_date: string;
  status: string;
  inspector_signature: string | null;
  brakes_operational: boolean | null;
  tires_tread_depth: boolean | null;
  lights_operational: boolean | null;
  frame_no_cracks: boolean | null;
  rear_doors_operational: boolean | null;
  kingpin_secure: boolean | null;
  dot_reflective_tape_present: boolean | null;
}

export default function TrailerCheckout() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Acknowledgment checkboxes
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [conditionAccepted, setConditionAccepted] = useState(false);
  const [responsibilityUnderstood, setResponsibilityUnderstood] = useState(false);
  const [certificationAccepted, setCertificationAccepted] = useState(false);
  
  // Customer info
  const [companyName, setCompanyName] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (inspectionId && user) {
      fetchInspection();
    }
  }, [inspectionId, user]);

  const fetchInspection = async () => {
    try {
      const { data, error } = await supabase
        .from("dot_inspections")
        .select("id, trailer_id, trailer_number, vin, license_plate, trailer_type, inspection_date, status, inspector_signature, brakes_operational, tires_tread_depth, brake_lights_operational, frame_no_cracks, rear_doors_operational, kingpin_secure, dot_reflective_tape_present, customer_acknowledged")
        .eq("id", inspectionId)
        .eq("status", "completed")
        .single();

      if (error) throw error;
      
      if (data.customer_acknowledged) {
        toast.error("This inspection has already been signed off");
        navigate("/dashboard/customer");
        return;
      }
      
      setInspection({
        ...data,
        lights_operational: data.brake_lights_operational
      } as any);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      toast.error("Failed to load inspection details");
      navigate("/dashboard/customer");
    } finally {
      setLoading(false);
    }
  };

  const allAcknowledged = reviewConfirmed && conditionAccepted && responsibilityUnderstood && certificationAccepted;
  const canSubmit = allAcknowledged && companyName.trim() && signerName.trim() && signature;

  const handleSubmit = async () => {
    if (!canSubmit || !inspection) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("dot_inspections")
        .update({
          customer_acknowledged: true,
          customer_acknowledged_at: new Date().toISOString(),
          customer_signature: signature,
          customer_name: signerName,
          customer_company_name: companyName,
          customer_signer_name: signerName,
          customer_review_confirmed: true,
          customer_condition_accepted: true,
          customer_responsibility_understood: true,
          customer_certification_accepted: true,
          status: "released"
        })
        .eq("id", inspection.id);

      if (error) throw error;

      toast.success("Trailer checkout completed successfully!");
      fireMetaCapi({ eventName: 'InitiateCheckout' });
      navigate(`/dashboard/customer/checkout/${inspection.id}/complete`);
    } catch (error) {
      console.error("Error submitting checkout:", error);
      toast.error("Failed to complete checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Inspection Not Found</h2>
          <p className="text-muted-foreground mt-2">This inspection may not exist or is not available for checkout.</p>
          <Button onClick={() => navigate("/dashboard/customer")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Trailer Checkout | Crum's Trailer Leasing" description="Complete your trailer checkout acknowledgment form" />
      <Navigation />
      <CustomerNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            DOT-Ready Customer Acknowledgment
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and sign off on the DOT inspection before taking possession of the trailer
          </p>
        </div>

        {/* Trailer Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Trailer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Trailer Number</Label>
                <p className="font-semibold">{inspection.trailer_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">VIN</Label>
                <p className="font-semibold">{inspection.vin || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">License Plate</Label>
                <p className="font-semibold">{inspection.license_plate || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Inspection Date</Label>
                <p className="font-semibold">
                  {format(new Date(inspection.inspection_date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DOT Inspection Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              DOT Inspection Summary
            </CardTitle>
            <CardDescription>
              The following items were inspected and verified by our mechanic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Brakes Operational", value: inspection.brakes_operational },
                { label: "Tires Tread Depth", value: inspection.tires_tread_depth },
                { label: "Lights Operational", value: inspection.lights_operational },
                { label: "Frame Condition", value: inspection.frame_no_cracks },
                { label: "Rear Doors", value: inspection.rear_doors_operational },
                { label: "Kingpin Secure", value: inspection.kingpin_secure },
                { label: "Reflective Tape", value: inspection.dot_reflective_tape_present },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${item.value ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-sm">{item.label}</span>
                  <Badge variant={item.value ? "default" : "secondary"} className="ml-auto text-xs">
                    {item.value ? "Pass" : "N/A"}
                  </Badge>
                </div>
              ))}
            </div>
            
            {inspection.inspector_signature && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-muted-foreground text-sm">Inspector Signature</Label>
                <img 
                  src={inspection.inspector_signature} 
                  alt="Inspector signature" 
                  className="h-16 mt-1 border rounded p-1 bg-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Acknowledgments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Acknowledgment</CardTitle>
            <CardDescription>
              Please review and confirm each statement below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="review" 
                checked={reviewConfirmed}
                onCheckedChange={(checked) => setReviewConfirmed(checked === true)}
              />
              <div>
                <Label htmlFor="review" className="font-medium cursor-pointer">
                  Customer Review Confirmation
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I confirm that I have reviewed and am taking possession of the above-mentioned trailer, which has been inspected and meets DOT safety requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="condition" 
                checked={conditionAccepted}
                onCheckedChange={(checked) => setConditionAccepted(checked === true)}
              />
              <div>
                <Label htmlFor="condition" className="font-medium cursor-pointer">
                  Condition Acceptance
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  The trailer's current condition has been assessed through a visual and operational inspection. The items checked above have been reviewed, and I accept responsibility for maintaining this trailer while in my possession.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="responsibility" 
                checked={responsibilityUnderstood}
                onCheckedChange={(checked) => setResponsibilityUnderstood(checked === true)}
              />
              <div>
                <Label htmlFor="responsibility" className="font-medium cursor-pointer">
                  Responsibility Clarification
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I agree to promptly report any malfunction or damage to Crum's Leasing LLC. I understand that I am responsible for any toll violations, citations, or damages incurred while the trailer is in my possession.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="certification" 
                checked={certificationAccepted}
                onCheckedChange={(checked) => setCertificationAccepted(checked === true)}
              />
              <div>
                <Label htmlFor="certification" className="font-medium cursor-pointer">
                  Customer Certification
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  By signing below, I certify that I am authorized to take possession of this trailer, have reviewed its condition, and will adhere to all safety and operational guidelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information & Signature */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Signature</CardTitle>
            <CardDescription>
              Enter your information and sign below to complete the checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Customer / Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company or customer name"
                />
              </div>
              <div>
                <Label htmlFor="signerName">Authorized Signer Name *</Label>
                <Input
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <Separator />

            <SignatureCapture
              label="Customer Signature *"
              onSignatureChange={setSignature}
            />

            <div className="text-sm text-muted-foreground">
              <strong>Date & Time:</strong> {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard/customer")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Checkout
              </>
            )}
          </Button>
        </div>

        {!canSubmit && (
          <p className="text-sm text-muted-foreground text-right mt-2">
            Please complete all acknowledgments, enter your information, and provide your signature
          </p>
        )}
      </div>
    </div>
  );
}