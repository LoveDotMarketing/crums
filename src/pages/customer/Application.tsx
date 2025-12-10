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
import { Loader2, CheckCircle, AlertCircle, FileText, Percent, CreditCard, UserCheck, Truck, ClipboardCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { validateFile, sanitizeInput } from "@/lib/validations";
import { format } from "date-fns";
import { trackApplicationStarted, trackFormSubmission, trackConversion } from "@/lib/analytics";

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
  
  // Drivers Compliance
  company_name: string;
  business_needs: string;
  truck_vin: string;
  mc_dot_number: string;
  trailer_type: string;
  
  // Payment
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  billing_address: string;
  consent_autopay: boolean;
  prepay_full_year: boolean;
  
  // Agreements
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  consent_communications: boolean;
  consent_credit_check: boolean;
  
  // Documents (legacy - still needed)
  ssn_card_url: string | null;
  drivers_license_url: string | null;
  insurance_docs_url: string | null;
  contract_url: string | null;
  
  status: string;
}

const TRAILER_TYPES = [
  { value: "53_dry_van", label: "53' Dry Van" },
  { value: "48_flatbed", label: "48' Flatbed" },
  { value: "refrigerated", label: "Refrigerated Trailer" },
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
    company_name: "",
    business_needs: "",
    truck_vin: "",
    mc_dot_number: "",
    trailer_type: "",
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    routing_number: "",
    billing_address: "",
    consent_autopay: false,
    prepay_full_year: false,
    terms_accepted: false,
    terms_accepted_at: null,
    consent_communications: false,
    consent_credit_check: false,
    ssn_card_url: null,
    drivers_license_url: null,
    insurance_docs_url: null,
    contract_url: null,
    status: "new",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    // Track application page view
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
          company_name: appData.company_address || "", // Using company_address for company name
          business_needs: appData.business_needs || "",
          truck_vin: appData.truck_vin || "",
          mc_dot_number: appData.mc_dot_number || "",
          trailer_type: appData.trailer_type || "",
          bank_name: appData.bank_name || "",
          account_holder_name: appData.account_holder_name || "",
          account_number: appData.account_number ? "****" + appData.account_number.slice(-4) : "",
          routing_number: appData.routing_number ? "****" + appData.routing_number.slice(-4) : "",
          billing_address: appData.billing_address || "",
          consent_autopay: appData.consent_autopay || false,
          prepay_full_year: appData.prepay_full_year || false,
          terms_accepted: appData.terms_accepted || false,
          terms_accepted_at: appData.terms_accepted_at || null,
          consent_communications: appData.consent_communications || false,
          consent_credit_check: appData.consent_credit_check || false,
          ssn_card_url: appData.ssn_card_url || null,
          drivers_license_url: appData.drivers_license_url || null,
          insurance_docs_url: appData.insurance_docs_url || null,
          contract_url: appData.contract_url || null,
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
      // Section 1: Basic Information
      profile.first_name,
      profile.last_name,
      profile.date_of_birth,
      profile.phone,
      profile.home_address,
      // Section 2: Drivers Compliance
      application.business_needs,
      application.truck_vin,
      application.mc_dot_number,
      application.trailer_type,
      // Section 3: Payment
      application.bank_name,
      application.account_holder_name,
      application.account_number,
      application.routing_number,
      application.billing_address,
      application.consent_autopay,
      // Section 4: Agreements
      application.terms_accepted,
      application.consent_communications,
      application.consent_credit_check,
    ];
    
    const completed = requiredFields.filter(field => {
      if (typeof field === 'boolean') return field === true;
      return field && field.toString().length > 0;
    }).length;
    
    return Math.round((completed / requiredFields.length) * 100);
  };

  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate age
    if (!validateAge(profile.date_of_birth)) {
      toast.error("You must be at least 18 years old to apply");
      return;
    }

    // Validate required consent checkboxes
    if (!application.consent_autopay) {
      toast.error("You must consent to automatic payments");
      return;
    }
    if (!application.terms_accepted) {
      toast.error("You must accept the terms and conditions");
      return;
    }
    if (!application.consent_communications) {
      toast.error("You must consent to communications");
      return;
    }
    if (!application.consent_credit_check) {
      toast.error("You must consent to credit checks");
      return;
    }

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

      // Prepare base application data
      const baseApplicationData = {
        user_id: user?.id,
        phone_number: sanitizeInput(profile.phone),
        company_address: sanitizeInput(application.company_name),
        business_needs: sanitizeInput(application.business_needs),
        truck_vin: sanitizeInput(application.truck_vin),
        mc_dot_number: sanitizeInput(application.mc_dot_number),
        trailer_type: application.trailer_type,
        bank_name: sanitizeInput(application.bank_name),
        account_holder_name: sanitizeInput(application.account_holder_name),
        billing_address: sanitizeInput(application.billing_address),
        consent_autopay: application.consent_autopay,
        prepay_full_year: application.prepay_full_year,
        terms_accepted: application.terms_accepted,
        terms_accepted_at: application.terms_accepted ? new Date().toISOString() : null,
        consent_communications: application.consent_communications,
        consent_credit_check: application.consent_credit_check,
        ssn_card_url: application.ssn_card_url,
        drivers_license_url: application.drivers_license_url,
        insurance_docs_url: application.insurance_docs_url,
        contract_url: application.contract_url,
        status: calculateProgress() === 100 ? "pending" : "incomplete",
      };

      // Only include banking numbers if they're not masked
      const bankingData: { account_number?: string; routing_number?: string } = {};
      if (!application.account_number.startsWith("****")) {
        bankingData.account_number = sanitizeInput(application.account_number);
      }
      if (!application.routing_number.startsWith("****")) {
        bankingData.routing_number = sanitizeInput(application.routing_number);
      }

      if (application.id) {
        const { error } = await supabase
          .from("customer_applications")
          .update({ ...baseApplicationData, ...bankingData })
          .eq("id", application.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customer_applications")
          .insert({ ...baseApplicationData, ...bankingData });
        if (error) throw error;
      }

      toast.success("Application saved successfully");
      trackFormSubmission('customer_application', true);
      trackConversion('application_submit');
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
            {/* Section 1: Basic Information */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Section 1: Basic Information</CardTitle>
                    <CardDescription>Your personal contact details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      required
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      required
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      required
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      max={format(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'yyyy-MM-dd')}
                    />
                    <p className="text-xs text-muted-foreground">You must be at least 18 years old</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home_address">Home Address *</Label>
                  <Input
                    id="home_address"
                    required
                    value={profile.home_address}
                    onChange={(e) => setProfile({ ...profile, home_address: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Drivers Compliance */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Section 2: Drivers Compliance</CardTitle>
                    <CardDescription>Business and DOT information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Business Name (if applicable)</Label>
                  <Input
                    id="company_name"
                    value={application.company_name}
                    onChange={(e) => setApplication({ ...application, company_name: e.target.value })}
                    placeholder="Your Company LLC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_needs">Business Needs for Trailer *</Label>
                  <textarea
                    id="business_needs"
                    required
                    value={application.business_needs}
                    onChange={(e) => setApplication({ ...application, business_needs: e.target.value })}
                    placeholder="Describe how you will use the trailer (e.g., freight hauling, local delivery, etc.)"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="truck_vin">Your Truck VIN *</Label>
                    <Input
                      id="truck_vin"
                      required
                      maxLength={17}
                      value={application.truck_vin}
                      onChange={(e) => setApplication({ ...application, truck_vin: e.target.value.toUpperCase() })}
                      placeholder="1HGBH41JXMN109186"
                    />
                    <p className="text-xs text-muted-foreground">17-character Vehicle Identification Number</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mc_dot_number">DOT Number *</Label>
                    <Input
                      id="mc_dot_number"
                      required
                      value={application.mc_dot_number}
                      onChange={(e) => setApplication({ ...application, mc_dot_number: e.target.value })}
                      placeholder="DOT123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailer_type">Type of Trailer Leasing *</Label>
                  <select
                    id="trailer_type"
                    required
                    value={application.trailer_type}
                    onChange={(e) => setApplication({ ...application, trailer_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select trailer type...</option>
                    {TRAILER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Uploads */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Required Documents</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Driver's License *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'drivers_license_url')}
                          disabled={uploadingDoc === 'drivers_license_url'}
                          className="flex-1"
                        />
                        {application.drivers_license_url && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        {uploadingDoc === 'drivers_license_url' && <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Insurance Documents *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'insurance_docs_url')}
                          disabled={uploadingDoc === 'insurance_docs_url'}
                          className="flex-1"
                        />
                        {application.insurance_docs_url && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        {uploadingDoc === 'insurance_docs_url' && <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Payment */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Section 3: Payment Information</CardTitle>
                    <CardDescription>Banking and billing details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="billing_address">Billing Address *</Label>
                  <Input
                    id="billing_address"
                    required
                    value={application.billing_address}
                    onChange={(e) => setApplication({ ...application, billing_address: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="consent_autopay"
                    checked={application.consent_autopay}
                    onCheckedChange={(checked) => setApplication({ ...application, consent_autopay: checked === true })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent_autopay"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Consent to Automatic Payments *
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I authorize CRUMS Leasing to automatically debit my account for monthly lease payments.
                    </p>
                  </div>
                </div>

                {/* Prepay Discount Card */}
                <Card className="border-2 border-dashed border-secondary bg-secondary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="prepay_full_year"
                        checked={application.prepay_full_year}
                        onCheckedChange={(checked) => setApplication({ ...application, prepay_full_year: checked === true })}
                      />
                      <div className="grid gap-1.5 leading-none flex-1">
                        <div className="flex items-center gap-2">
                          <Percent className="h-5 w-5 text-secondary" />
                          <label
                            htmlFor="prepay_full_year"
                            className="text-sm font-bold leading-none text-secondary"
                          >
                            Save 10% - Prepay Full Year
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Pay your full 12-month contract upfront and receive a <strong>10% discount</strong> on your total lease amount. 
                          This option will be processed through Stripe after your application is approved.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Section 4: Agreements */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Section 4: Agreements</CardTitle>
                    <CardDescription>Required acknowledgements and consents</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms_accepted"
                    checked={application.terms_accepted}
                    onCheckedChange={(checked) => setApplication({ ...application, terms_accepted: checked === true })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms_accepted"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Terms & Conditions *
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I have read and agree to the{" "}
                      <a href="#" className="text-primary underline inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        CRUMS Leasing Agreement
                      </a>
                      {" "}(PDF will be available soon)
                    </p>
                  </div>
                </div>

                {/* Consent to Communications */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent_communications"
                    checked={application.consent_communications}
                    onCheckedChange={(checked) => setApplication({ ...application, consent_communications: checked === true })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent_communications"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Consent to Communications *
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I consent to receive text messages, phone calls, and emails from CRUMS Leasing regarding my account, 
                      lease payments, and important updates.
                    </p>
                  </div>
                </div>

                {/* Consent to Credit Check */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent_credit_check"
                    checked={application.consent_credit_check}
                    onCheckedChange={(checked) => setApplication({ ...application, consent_credit_check: checked === true })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent_credit_check"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Consent to Credit Check *
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I understand that a credit check may be performed as part of the application review process. 
                      Some applicants may require a routine credit review.
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All checkboxes above are required to submit your application.
                  </AlertDescription>
                </Alert>
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
