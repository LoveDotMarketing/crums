import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { validateFile, sanitizeInput } from "@/lib/validations";

interface ApplicationData {
  id?: string;
  phone_number: string;
  
  // Company & Business Details
  mc_dot_number: string;
  company_address: string;
  business_type: string;
  number_of_trailers: number | string;
  date_needed: string;
  message: string;
  
  secondary_contact_name: string;
  secondary_contact_phone: string;
  secondary_contact_relationship: string;
  
  // SSN
  ssn_number: string;
  ssn_card_url: string | null;
  
  // Driver's License
  dl_number: string;
  drivers_license_url: string | null;
  
  // Insurance
  insurance_carrier: string;
  insurance_policy: string;
  insurance_company: string;
  insurance_docs_url: string | null;
  
  // Contract
  contract_url: string | null;
  
  // Bank Info
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  payment_method: string;
  
  status: string;
}

export default function Application() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationData>({
    phone_number: "",
    mc_dot_number: "",
    company_address: "",
    business_type: "",
    number_of_trailers: "",
    date_needed: "",
    message: "",
    secondary_contact_name: "",
    secondary_contact_phone: "",
    secondary_contact_relationship: "",
    ssn_number: "",
    ssn_card_url: null,
    dl_number: "",
    drivers_license_url: null,
    insurance_carrier: "",
    insurance_policy: "",
    insurance_company: "",
    insurance_docs_url: null,
    contract_url: null,
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    routing_number: "",
    payment_method: "bank",
    status: "new",
  });

  useEffect(() => {
    fetchApplication();
  }, [user]);

  const fetchApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customer_application_safe")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setApplication({
          id: data.id,
          phone_number: data.phone_number || "",
          mc_dot_number: data.mc_dot_number || "",
          company_address: data.company_address || "",
          business_type: data.business_type || "",
          number_of_trailers: data.number_of_trailers || "",
          date_needed: data.date_needed || "",
          message: data.message || "",
          secondary_contact_name: data.secondary_contact_name || "",
          secondary_contact_phone: data.secondary_contact_phone || "",
          secondary_contact_relationship: data.secondary_contact_relationship || "",
          ssn_number: "",
          ssn_card_url: data.has_ssn_card ? "uploaded" : undefined,
          dl_number: "",
          drivers_license_url: data.has_drivers_license ? "uploaded" : undefined,
          insurance_carrier: "",
          insurance_policy: "",
          insurance_company: data.insurance_company || "",
          insurance_docs_url: data.has_insurance_docs ? "uploaded" : undefined,
          contract_url: data.has_contract ? "uploaded" : undefined,
          bank_name: data.bank_name || "",
          account_holder_name: data.account_holder_name || "",
          account_number: data.account_number_masked || "",
          routing_number: data.routing_number_masked || "",
          payment_method: data.payment_method || "bank",
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    if (!user) return;

    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setUploadingDoc(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${fieldName}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error: urlError } = await supabase.storage
        .from('customer-documents')
        .createSignedUrl(fileName, 31536000); // 1 year expiry

      if (urlError) throw urlError;

      setApplication({ ...application, [fieldName]: data.signedUrl });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingDoc(null);
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      application.phone_number,
      application.mc_dot_number,
      application.company_address,
      application.business_type,
      application.number_of_trailers,
      application.date_needed,
      application.insurance_company,
      application.secondary_contact_name,
      application.secondary_contact_phone,
      application.ssn_card_url,
      application.drivers_license_url,
      application.insurance_docs_url,
      application.contract_url,
      application.bank_name,
      application.account_holder_name,
      application.account_number,
      application.routing_number,
    ];
    
    const completed = requiredFields.filter(field => field && field.toString().length > 0).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Sanitize text inputs
      const dataToSave = {
        user_id: user?.id,
        phone_number: sanitizeInput(application.phone_number),
        mc_dot_number: sanitizeInput(application.mc_dot_number),
        company_address: sanitizeInput(application.company_address),
        business_type: sanitizeInput(application.business_type),
        number_of_trailers: application.number_of_trailers ? parseInt(application.number_of_trailers.toString()) : null,
        date_needed: application.date_needed || null,
        insurance_company: sanitizeInput(application.insurance_company),
        message: sanitizeInput(application.message),
        secondary_contact_name: sanitizeInput(application.secondary_contact_name),
        secondary_contact_phone: sanitizeInput(application.secondary_contact_phone),
        secondary_contact_relationship: sanitizeInput(application.secondary_contact_relationship),
        ssn_card_url: application.ssn_card_url,
        drivers_license_url: application.drivers_license_url,
        insurance_docs_url: application.insurance_docs_url,
        contract_url: application.contract_url,
        bank_name: sanitizeInput(application.bank_name),
        account_holder_name: sanitizeInput(application.account_holder_name),
        account_number: sanitizeInput(application.account_number),
        routing_number: sanitizeInput(application.routing_number),
        payment_method: application.payment_method,
        status: calculateProgress() === 100 ? "pending" : "incomplete",
      };

      if (application.id) {
        const { error } = await supabase
          .from("customer_applications")
          .update(dataToSave)
          .eq("id", application.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customer_applications")
          .insert(dataToSave);
        if (error) throw error;
      }

      toast.success("Application saved successfully");
      fetchApplication();
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Rental Application</h1>
            <p className="text-muted-foreground">Complete all required fields to submit your application</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
              <CardDescription>{progress}% Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {progress < 100 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Please complete all required fields to submit your rental application for review.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company & Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company & Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mc_dot_number">MC/DOT Number *</Label>
                    <Input
                      id="mc_dot_number"
                      required
                      value={application.mc_dot_number}
                      onChange={(e) => setApplication({ ...application, mc_dot_number: e.target.value })}
                      placeholder="MC123456 or DOT123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type *</Label>
                    <select
                      id="business_type"
                      required
                      value={application.business_type}
                      onChange={(e) => setApplication({ ...application, business_type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select business type...</option>
                      <option value="individual">Individual</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Company Address *</Label>
                  <Input
                    id="company_address"
                    required
                    value={application.company_address}
                    onChange={(e) => setApplication({ ...application, company_address: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number_of_trailers">Number of Trailers Needed *</Label>
                    <Input
                      id="number_of_trailers"
                      type="number"
                      min="1"
                      required
                      value={application.number_of_trailers}
                      onChange={(e) => setApplication({ ...application, number_of_trailers: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_needed">Date Needed *</Label>
                    <Input
                      id="date_needed"
                      type="date"
                      required
                      value={application.date_needed}
                      onChange={(e) => setApplication({ ...application, date_needed: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <textarea
                    id="message"
                    value={application.message}
                    onChange={(e) => setApplication({ ...application, message: e.target.value })}
                    placeholder="Any additional information or special requests..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    required
                    value={application.phone_number}
                    onChange={(e) => setApplication({ ...application, phone_number: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondary_contact_name">Secondary Contact Name *</Label>
                    <Input
                      id="secondary_contact_name"
                      required
                      value={application.secondary_contact_name}
                      onChange={(e) => setApplication({ ...application, secondary_contact_name: e.target.value })}
                      placeholder="Emergency contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_contact_phone">Secondary Contact Phone *</Label>
                    <Input
                      id="secondary_contact_phone"
                      type="tel"
                      required
                      value={application.secondary_contact_phone}
                      onChange={(e) => setApplication({ ...application, secondary_contact_phone: e.target.value })}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_contact_relationship">Relationship *</Label>
                  <Input
                    id="secondary_contact_relationship"
                    required
                    value={application.secondary_contact_relationship}
                    onChange={(e) => setApplication({ ...application, secondary_contact_relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SSN Card */}
            <Card>
              <CardHeader>
                <CardTitle>Social Security Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ssn_number">SSN (Last 4 digits) *</Label>
                  <Input
                    id="ssn_number"
                    type="text"
                    required
                    maxLength={4}
                    value={application.ssn_number}
                    onChange={(e) => setApplication({ ...application, ssn_number: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SSN Card Photo *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ssn_card_url')}
                      disabled={uploadingDoc === 'ssn_card_url'}
                    />
                    {application.ssn_card_url && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadingDoc === 'ssn_card_url' && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver's License */}
            <Card>
              <CardHeader>
                <CardTitle>Driver's License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dl_number">License Number *</Label>
                  <Input
                    id="dl_number"
                    required
                    value={application.dl_number}
                    onChange={(e) => setApplication({ ...application, dl_number: e.target.value })}
                    placeholder="DL123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label>License Photo *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'drivers_license_url')}
                      disabled={uploadingDoc === 'drivers_license_url'}
                    />
                    {application.drivers_license_url && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadingDoc === 'drivers_license_url' && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_carrier">Carrier Name *</Label>
                    <Input
                      id="insurance_carrier"
                      required
                      value={application.insurance_carrier}
                      onChange={(e) => setApplication({ ...application, insurance_carrier: e.target.value })}
                      placeholder="State Farm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_policy">Policy Number *</Label>
                    <Input
                      id="insurance_policy"
                      required
                      value={application.insurance_policy}
                      onChange={(e) => setApplication({ ...application, insurance_policy: e.target.value })}
                      placeholder="POL-123456"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_company">Insurance Company Name *</Label>
                  <Input
                    id="insurance_company"
                    required
                    value={application.insurance_company}
                    onChange={(e) => setApplication({ ...application, insurance_company: e.target.value })}
                    placeholder="State Farm Insurance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Insurance Documents *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'insurance_docs_url')}
                      disabled={uploadingDoc === 'insurance_docs_url'}
                    />
                    {application.insurance_docs_url && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadingDoc === 'insurance_docs_url' && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Upload your signed contract or use DocuSign link (will be provided by admin)
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label>Signed Contract *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'contract_url')}
                      disabled={uploadingDoc === 'contract_url'}
                    />
                    {application.contract_url && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadingDoc === 'contract_url' && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment & Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="bank"
                        checked={application.payment_method === "bank"}
                        onChange={(e) => setApplication({ ...application, payment_method: e.target.value })}
                      />
                      Bank Transfer / ACH
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="zelle"
                        checked={application.payment_method === "zelle"}
                        onChange={(e) => setApplication({ ...application, payment_method: e.target.value })}
                      />
                      Zelle
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    required
                    value={application.bank_name}
                    onChange={(e) => setApplication({ ...application, bank_name: e.target.value })}
                    placeholder="Chase Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                  <Input
                    id="account_holder_name"
                    required
                    value={application.account_holder_name}
                    onChange={(e) => setApplication({ ...application, account_holder_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routing_number">Routing Number *</Label>
                    <Input
                      id="routing_number"
                      required
                      maxLength={9}
                      value={application.routing_number}
                      onChange={(e) => setApplication({ ...application, routing_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="021000021"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number *</Label>
                    <Input
                      id="account_number"
                      required
                      value={application.account_number}
                      onChange={(e) => setApplication({ ...application, account_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving} size="lg" className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Application"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
