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
import { Loader2, CheckCircle, AlertCircle, FileText, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { validateFile, sanitizeInput } from "@/lib/validations";
import { format } from "date-fns";
import { trackApplicationStarted, trackFormSubmission } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  home_address: string;
}

interface ApplicationData {
  id?: string;
  phone_number: string;
  company_address: string;
  business_type: string;
  truck_vin: string;
  trailer_type: string;
  number_of_trailers: number | null;
  date_needed: string;
  ssn: string;
  insurance_company: string;
  insurance_company_phone: string;
  message: string;
  secondary_contact_name: string;
  secondary_contact_phone: string;
  secondary_contact_relationship: string;
  dot_number_url: string | null;
  drivers_license_url: string | null;
  drivers_license_back_url: string | null;
  insurance_docs_url: string | null;
  status: string;
}

const TRAILER_TYPES = [
  { value: "53' Dry Van", label: "53' Dry Van" },
  { value: "48' Flatbed", label: "48' Flatbed" },
  { value: "Refrigerated", label: "Refrigerated" },
];

export default function Application() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    home_address: "",
  });
  
  const [application, setApplication] = useState<ApplicationData>({
    phone_number: "",
    company_address: "",
    business_type: "",
    truck_vin: "",
    trailer_type: "",
    number_of_trailers: null,
    date_needed: "",
    ssn: "",
    insurance_company: "",
    insurance_company_phone: "",
    message: "",
    secondary_contact_name: "",
    secondary_contact_phone: "",
    secondary_contact_relationship: "",
    dot_number_url: null,
    drivers_license_url: null,
    drivers_license_back_url: null,
    insurance_docs_url: null,
    status: "new",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    trackApplicationStarted();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, date_of_birth, home_address")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          date_of_birth: profileData.date_of_birth || "",
          home_address: profileData.home_address || "",
        });
      }

      // Fetch application data
      const { data: appData, error: appError } = await supabase
        .from("customer_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (appError) throw appError;

      if (appData) {
        setApplication({
          id: appData.id,
          phone_number: appData.phone_number || "",
          company_address: appData.company_address || "",
          business_type: appData.business_type || "",
          truck_vin: appData.truck_vin || "",
          trailer_type: appData.trailer_type || "",
          number_of_trailers: appData.number_of_trailers || null,
          date_needed: appData.date_needed || "",
          ssn: appData.ssn ? "***-**-" + appData.ssn.slice(-4) : "",
          insurance_company: appData.insurance_company || "",
          insurance_company_phone: appData.insurance_company_phone || "",
          message: appData.message || "",
          secondary_contact_name: appData.secondary_contact_name || "",
          secondary_contact_phone: appData.secondary_contact_phone || "",
          secondary_contact_relationship: appData.secondary_contact_relationship || "",
          dot_number_url: appData.dot_number_url || null,
          drivers_license_url: appData.drivers_license_url || null,
          drivers_license_back_url: appData.drivers_license_back_url || null,
          insurance_docs_url: appData.insurance_docs_url || null,
          status: appData.status,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    if (!user) return;

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
        .createSignedUrl(fileName, 31536000);

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
      profile.first_name,
      profile.last_name,
      profile.phone,
      application.truck_vin,
      application.trailer_type,
      application.drivers_license_url,
      application.drivers_license_back_url,
    ];
    
    const completed = requiredFields.filter(field => field && field.toString().length > 0).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: sanitizeInput(profile.first_name),
          last_name: sanitizeInput(profile.last_name),
          phone: sanitizeInput(profile.phone),
          date_of_birth: profile.date_of_birth || null,
          home_address: sanitizeInput(profile.home_address),
        })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Prepare application data
      const applicationData: Record<string, any> = {
        user_id: user?.id,
        phone_number: sanitizeInput(profile.phone),
        company_address: sanitizeInput(application.company_address),
        business_type: application.business_type,
        truck_vin: sanitizeInput(application.truck_vin),
        trailer_type: application.trailer_type,
        number_of_trailers: application.number_of_trailers,
        date_needed: application.date_needed || null,
        insurance_company: sanitizeInput(application.insurance_company),
        insurance_company_phone: sanitizeInput(application.insurance_company_phone),
        message: sanitizeInput(application.message),
        secondary_contact_name: sanitizeInput(application.secondary_contact_name),
        secondary_contact_phone: sanitizeInput(application.secondary_contact_phone),
        secondary_contact_relationship: sanitizeInput(application.secondary_contact_relationship),
        dot_number_url: application.dot_number_url,
        drivers_license_url: application.drivers_license_url,
        drivers_license_back_url: application.drivers_license_back_url,
        insurance_docs_url: application.insurance_docs_url,
        status: calculateProgress() === 100 ? "pending" : "incomplete",
      };

      // Only update SSN if it's not masked - encrypt before saving
      if (application.ssn && !application.ssn.includes("*")) {
        const cleanSSN = application.ssn.replace(/-/g, "");
        
        // Validate SSN format (9 digits)
        if (!/^\d{9}$/.test(cleanSSN)) {
          toast.error("SSN must be exactly 9 digits");
          setSaving(false);
          return;
        }
        
        // Encrypt SSN using the ssn-crypto edge function
        const { data: encryptData, error: encryptError } = await supabase.functions.invoke('ssn-crypto', {
          body: { action: 'encrypt', ssn: cleanSSN }
        });
        
        if (encryptError || !encryptData?.encrypted) {
          console.error("SSN encryption error:", encryptError);
          toast.error("Failed to secure SSN data. Please try again.");
          setSaving(false);
          return;
        }
        
        applicationData.ssn = encryptData.encrypted;
      }

      if (application.id) {
        const { error } = await supabase
          .from("customer_applications")
          .update(applicationData)
          .eq("id", application.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customer_applications")
          .insert(applicationData as any);
        if (error) throw error;
      }

      toast.success("Application saved successfully");
      trackFormSubmission('customer_application', true);
      fetchData();
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
            <p className="text-muted-foreground">Review and update your application information</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{progress}% Complete</p>
              
              {application.status === "approved" && (
                <Alert className="mt-4 border-primary bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertTitle>Application Approved</AlertTitle>
                  <AlertDescription>
                    Your application has been approved! You can now request trailers.
                  </AlertDescription>
                </Alert>
              )}
              
              {application.status === "pending" && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Under Review</AlertTitle>
                  <AlertDescription>
                    Your application is being reviewed. We'll notify you once it's approved.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <Input
                    id="homeAddress"
                    value={profile.home_address}
                    onChange={(e) => setProfile({ ...profile, home_address: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your trucking business details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="companyAddress">Business Address</Label>
                  <Input
                    id="companyAddress"
                    value={application.company_address}
                    onChange={(e) => setApplication({ ...application, company_address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={application.business_type}
                    onValueChange={(value) => setApplication({ ...application, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="truckVin">Truck/Cab VIN</Label>
                  <Input
                    id="truckVin"
                    value={application.truck_vin}
                    onChange={(e) => setApplication({ ...application, truck_vin: e.target.value.toUpperCase() })}
                    maxLength={17}
                  />
                </div>
                <div>
                  <Label htmlFor="trailerType">Trailer Type</Label>
                  <Select
                    value={application.trailer_type}
                    onValueChange={(value) => setApplication({ ...application, trailer_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAILER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numberOfTrailers">Number of Trailers</Label>
                  <Input
                    id="numberOfTrailers"
                    type="number"
                    min="1"
                    value={application.number_of_trailers || ""}
                    onChange={(e) => setApplication({ ...application, number_of_trailers: parseInt(e.target.value) || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateNeeded">Date Needed</Label>
                  <Input
                    id="dateNeeded"
                    type="date"
                    value={application.date_needed}
                    onChange={(e) => setApplication({ ...application, date_needed: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
                <CardDescription>Your insurance provider details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Input
                    id="insuranceCompany"
                    value={application.insurance_company}
                    onChange={(e) => setApplication({ ...application, insurance_company: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePhone">Insurance Company Phone</Label>
                  <Input
                    id="insurancePhone"
                    type="tel"
                    value={application.insurance_company_phone}
                    onChange={(e) => setApplication({ ...application, insurance_company_phone: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload required documents (JPG, PNG, PDF)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>DOT Registration</Label>
                    <div className="mt-2">
                      {application.dot_number_url ? (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          Document uploaded
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "dot_number_url")}
                            disabled={uploadingDoc === "dot_number_url"}
                          />
                          {uploadingDoc === "dot_number_url" && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Driver's License (Front)</Label>
                    <div className="mt-2">
                      {application.drivers_license_url ? (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          Document uploaded
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "drivers_license_url")}
                            disabled={uploadingDoc === "drivers_license_url"}
                          />
                          {uploadingDoc === "drivers_license_url" && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Driver's License (Back)</Label>
                    <div className="mt-2">
                      {application.drivers_license_back_url ? (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          Document uploaded
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "drivers_license_back_url")}
                            disabled={uploadingDoc === "drivers_license_back_url"}
                          />
                          {uploadingDoc === "drivers_license_back_url" && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Insurance Documents</Label>
                    <div className="mt-2">
                      {application.insurance_docs_url ? (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          Document uploaded
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "insurance_docs_url")}
                            disabled={uploadingDoc === "insurance_docs_url"}
                          />
                          {uploadingDoc === "insurance_docs_url" && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Secondary Contact (Optional)</CardTitle>
                <CardDescription>Emergency contact information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="secondaryName">Name</Label>
                  <Input
                    id="secondaryName"
                    value={application.secondary_contact_name}
                    onChange={(e) => setApplication({ ...application, secondary_contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryPhone">Phone</Label>
                  <Input
                    id="secondaryPhone"
                    type="tel"
                    value={application.secondary_contact_phone}
                    onChange={(e) => setApplication({ ...application, secondary_contact_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryRelationship">Relationship</Label>
                  <Input
                    id="secondaryRelationship"
                    value={application.secondary_contact_relationship}
                    onChange={(e) => setApplication({ ...application, secondary_contact_relationship: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} size="lg">
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