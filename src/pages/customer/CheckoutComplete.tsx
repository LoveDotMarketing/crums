import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navigation } from "@/components/Navigation";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { SEO } from "@/components/SEO";
import { PrintButton } from "@/components/PrintButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Truck, 
  FileCheck,
  User,
  Wrench,
  Calendar,
  Loader2,
  ArrowLeft
} from "lucide-react";

interface CompletedInspection {
  id: string;
  trailer_number: string;
  vin: string | null;
  license_plate: string | null;
  trailer_type: string | null;
  inspection_date: string;
  status: string;
  inspector_signature: string | null;
  inspector_name: string | null;
  customer_signature: string | null;
  customer_name: string | null;
  customer_company_name: string | null;
  customer_signer_name: string | null;
  customer_acknowledged_at: string | null;
  brakes_operational: boolean | null;
  tires_tread_depth: boolean | null;
  lights_operational: boolean | null;
  frame_no_cracks: boolean | null;
  rear_doors_operational: boolean | null;
  kingpin_secure: boolean | null;
  dot_reflective_tape_present: boolean | null;
}

export default function CheckoutComplete() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [inspection, setInspection] = useState<CompletedInspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inspectionId && user) {
      fetchInspection();
    }
  }, [inspectionId, user]);

  const fetchInspection = async () => {
    try {
      const { data, error } = await supabase
        .from("dot_inspections")
        .select("id, trailer_number, vin, license_plate, trailer_type, inspection_date, status, inspector_signature, inspector_name, customer_signature, customer_name, customer_company_name, customer_signer_name, customer_acknowledged_at, brakes_operational, tires_tread_depth, brake_lights_operational, frame_no_cracks, rear_doors_operational, kingpin_secure, dot_reflective_tape_present")
        .eq("id", inspectionId)
        .eq("customer_acknowledged", true)
        .single();

      if (error) throw error;
      setInspection({
        ...data,
        lights_operational: data.brake_lights_operational
      } as CompletedInspection);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      toast.error("Failed to load checkout details");
      navigate("/dashboard/customer");
    } finally {
      setLoading(false);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout Complete | Crum's Trailer Leasing" description="Your trailer checkout has been completed successfully" />
      <Navigation />
      <CustomerNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 print:hidden">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-green-700 print:text-black">
            Trailer Checkout Complete
          </h1>
          <p className="text-muted-foreground mt-2">
            You have successfully signed off on the DOT inspection and taken possession of the trailer.
          </p>
        </div>

        {/* Print Header (visible only in print) */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-xl font-bold">CRUM'S LEASING LLC</h1>
          <p className="text-sm">DOT-Ready Customer Acknowledgment Form</p>
        </div>

        {/* Trailer Information */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 print:hidden" />
              Trailer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trailer Number</span>
                <p className="font-semibold">{inspection.trailer_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">VIN</span>
                <p className="font-semibold">{inspection.vin || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">License Plate</span>
                <p className="font-semibold">{inspection.license_plate || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-semibold">{inspection.trailer_type || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Details */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 print:hidden" />
              DOT Inspection Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
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
                  <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${item.value ? "text-green-600" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgments */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Customer Acknowledgments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Customer Review Confirmation - Reviewed and taking possession</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Condition Acceptance - Accepts responsibility for maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Responsibility Clarification - Will report issues promptly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Customer Certification - Authorized to take possession</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inspector Signature */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-muted-foreground print:hidden" />
                  <span className="font-medium">Inspector</span>
                </div>
                {inspection.inspector_name && (
                  <p className="text-sm mb-2">{inspection.inspector_name}</p>
                )}
                {inspection.inspector_signature && (
                  <img 
                    src={inspection.inspector_signature} 
                    alt="Inspector signature" 
                    className="h-16 border rounded p-1 bg-white"
                  />
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(inspection.inspection_date), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>

              {/* Customer Signature */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground print:hidden" />
                  <span className="font-medium">Customer</span>
                </div>
                {inspection.customer_signature && (
                  <img 
                    src={inspection.customer_signature} 
                    alt="Customer signature" 
                    className="h-16 border rounded p-1 bg-white"
                  />
                )}
                <div className="text-sm mt-2">
                  <p><strong>Company:</strong> {inspection.customer_company_name}</p>
                  <p><strong>Signed by:</strong> {inspection.customer_signer_name || inspection.customer_name}</p>
                </div>
                {inspection.customer_acknowledged_at && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(inspection.customer_acknowledged_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge */}
        <div className="flex items-center justify-center mb-8 print:hidden">
          <Badge variant="default" className="text-sm px-4 py-2 bg-green-600">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Trailer Released to Customer
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 print:hidden">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard/customer")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <PrintButton />
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Crum's Leasing LLC • DOT-Ready Customer Acknowledgment Form</p>
          <p>Printed on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </div>
    </div>
  );
}