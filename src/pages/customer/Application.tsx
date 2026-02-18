import { useEffect, useState, useRef, useCallback } from "react";
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
import { logApplicationSubmitted, logApplicationSaveFailed, logDocumentUploadFailed } from "@/lib/eventLogger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  company_name: string;
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
  billing_anchor_day: number | null;
  preferred_billing_cycle: string | null;
}

const TRAILER_TYPES = [
  { value: "53' Dry Van", label: "53' Dry Van" },
  { value: "48' Flatbed", label: "48' Flatbed" },
];

export default function Application() {
  const { user, effectiveUserId, isImpersonating } = useAuth();
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
    billing_anchor_day: null,
    preferred_billing_cycle: null,
  });

  const APP_STORAGE_KEY = 'crums_application_form';
  const currentUserId = effectiveUserId || user?.id;

  // Restore from localStorage on mount (before DB fetch overwrites)
  useEffect(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.profile) setProfile(prev => ({ ...prev, ...data.profile }));
        if (data.application) setApplication(prev => ({ ...prev, ...data.application }));
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentUserId]);

  useEffect(() => {
    trackApplicationStarted();
  }, []);
  // Save form edits to localStorage to prevent mobile data loss
  useEffect(() => {
    const hasProfileData = Object.values(profile).some(v => v && v.toString().trim() !== '');
    const hasAppData = Object.entries(application).some(([k, v]) => {
      if (k === 'status' || k === 'id') return false;
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '' && v !== 'new';
      return true;
    });
    if (hasProfileData || hasAppData) {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ profile, application }));
    }
  }, [profile, application]);

  // Debounced auto-save to database
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveToDb = useCallback(async () => {
    if (!currentUserId) return;
    try {
      // Only save profile fields that have values
      const profileUpdate: Record<string, any> = {};
      if (profile.first_name) profileUpdate.first_name = sanitizeInput(profile.first_name);
      if (profile.last_name) profileUpdate.last_name = sanitizeInput(profile.last_name);
      if (profile.phone) profileUpdate.phone = sanitizeInput(profile.phone);
      if (profile.date_of_birth) profileUpdate.date_of_birth = profile.date_of_birth;
      if (profile.home_address) profileUpdate.home_address = sanitizeInput(profile.home_address);
      if (application.company_name) profileUpdate.company_name = sanitizeInput(application.company_name);

      if (Object.keys(profileUpdate).length > 0) {
        await supabase.from("profiles").update(profileUpdate).eq("id", currentUserId);
      }

      // Auto-save application fields (excluding SSN and status) using upsert
      const appUpdate: Record<string, any> = {
        user_id: currentUserId,
        phone_number: sanitizeInput(profile.phone) || "",
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
        billing_anchor_day: application.billing_anchor_day,
        preferred_billing_cycle: application.preferred_billing_cycle,
      };
      await supabase.from("customer_applications").upsert(appUpdate as any, { onConflict: 'user_id' });
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }, [currentUserId, profile, application]);

  // Trigger debounced auto-save when form data changes
  useEffect(() => {
    if (loading) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveToDb();
    }, 3000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [profile, application, loading, autoSaveToDb]);

  const clearSavedApplication = () => localStorage.removeItem(APP_STORAGE_KEY);

  const fetchData = async () => {
    if (!currentUserId) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, date_of_birth, home_address, company_name")
        .eq("id", currentUserId)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(prev => ({
          first_name: profileData.first_name || prev.first_name || "",
          last_name: profileData.last_name || prev.last_name || "",
          email: profileData.email || prev.email || "",
          phone: profileData.phone || prev.phone || "",
          date_of_birth: profileData.date_of_birth || prev.date_of_birth || "",
          home_address: profileData.home_address || prev.home_address || "",
        }));
        // Load company_name from profile into application state
        if (profileData.company_name) {
          setApplication(prev => ({ ...prev, company_name: profileData.company_name || prev.company_name }));
        }
      }

      // Fetch application data
      const { data: appData, error: appError } = await supabase
        .from("customer_applications")
        .select("*")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (appError) throw appError;

      if (appData) {
        setApplication(prev => ({
          id: appData.id,
          phone_number: appData.phone_number || prev.phone_number || "",
          company_name: prev.company_name || "",
          company_address: appData.company_address || prev.company_address || "",
          business_type: appData.business_type || prev.business_type || "",
          truck_vin: appData.truck_vin || prev.truck_vin || "",
          trailer_type: appData.trailer_type || prev.trailer_type || "",
          number_of_trailers: appData.number_of_trailers ?? prev.number_of_trailers ?? null,
          date_needed: appData.date_needed || prev.date_needed || "",
          ssn: appData.ssn ? "***-**-" + appData.ssn.slice(-4) : prev.ssn || "",
          insurance_company: appData.insurance_company || prev.insurance_company || "",
          insurance_company_phone: appData.insurance_company_phone || prev.insurance_company_phone || "",
          message: appData.message || prev.message || "",
          secondary_contact_name: appData.secondary_contact_name || prev.secondary_contact_name || "",
          secondary_contact_phone: appData.secondary_contact_phone || prev.secondary_contact_phone || "",
          secondary_contact_relationship: appData.secondary_contact_relationship || prev.secondary_contact_relationship || "",
          dot_number_url: appData.dot_number_url || prev.dot_number_url || null,
          drivers_license_url: appData.drivers_license_url || prev.drivers_license_url || null,
          drivers_license_back_url: appData.drivers_license_back_url || prev.drivers_license_back_url || null,
          insurance_docs_url: appData.insurance_docs_url || prev.insurance_docs_url || null,
          status: appData.status,
          billing_anchor_day: (appData as any).billing_anchor_day ?? prev.billing_anchor_day ?? null,
          preferred_billing_cycle: (appData as any).preferred_billing_cycle ?? prev.preferred_billing_cycle ?? null,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    if (!currentUserId) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setUploadingDoc(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${fieldName}_${Date.now()}.${fileExt}`;

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
    } catch (error: any) {
      console.error("Error uploading file:", error);
      logDocumentUploadFailed(fieldName, error.message || "Unknown upload error");
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
          company_name: sanitizeInput(application.company_name) || null,
        })
        .eq("id", currentUserId);

      if (profileError) throw profileError;

      // Prepare application data
      const applicationData: Record<string, any> = {
        user_id: currentUserId,
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
        status: calculateProgress() === 100 ? "pending_review" : "new",
        billing_anchor_day: application.billing_anchor_day,
        preferred_billing_cycle: application.preferred_billing_cycle,
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

      // Always upsert to prevent unique constraint errors
      const { error } = await supabase
        .from("customer_applications")
        .upsert(applicationData as any, { onConflict: 'user_id' });
      if (error) throw error;

      toast.success("Application saved successfully");
      clearSavedApplication();
      trackFormSubmission('customer_application', true);
      logApplicationSubmitted();
      fetchData();
    } catch (error: any) {
      console.error("Error saving application:", error);
      logApplicationSaveFailed(error.message || "Unknown error");
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let formatted = digits;
                      if (digits.length <= 3) formatted = digits;
                      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                      setProfile({ ...profile, phone: formatted });
                    }}
                    placeholder="(555) 123-4567"
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
                <div className="md:col-span-2">
                  <Label htmlFor="companyName">Company / Business Name</Label>
                  <Input
                    id="companyName"
                    value={application.company_name}
                    onChange={(e) => setApplication({ ...application, company_name: e.target.value })}
                    placeholder="Ducky Transport LLC"
                  />
                </div>
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
                  <Label htmlFor="truckVin">Cab VIN# (Optional)</Label>
                  <Input
                    id="truckVin"
                    value={application.truck_vin}
                    onChange={(e) => setApplication({ ...application, truck_vin: e.target.value.toUpperCase() })}
                    placeholder="17-character Vehicle Identification Number"
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let formatted = digits;
                      if (digits.length <= 3) formatted = digits;
                      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                      setApplication({ ...application, insurance_company_phone: formatted });
                    }}
                    placeholder="(555) 123-4567"
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
                  {[
                    { field: "dot_number_url", label: "DOT Registration" },
                    { field: "drivers_license_url", label: "Driver's License (Front)" },
                    { field: "drivers_license_back_url", label: "Driver's License (Back)" },
                    { field: "insurance_docs_url", label: "Insurance Documents" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <Label>{label}</Label>
                      <div className="mt-2">
                        {application[field as keyof ApplicationData] ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-primary">Document uploaded</span>
                            <label className="ml-auto">
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], field)}
                                disabled={uploadingDoc === field}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                disabled={uploadingDoc === field}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                                  input?.click();
                                }}
                              >
                                {uploadingDoc === field ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Upload className="h-3 w-3 mr-1" />
                                )}
                                Replace
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], field)}
                              disabled={uploadingDoc === field}
                            />
                            {uploadingDoc === field && <Loader2 className="h-4 w-4 animate-spin" />}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing Preference */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Preference</CardTitle>
                <CardDescription>Choose when you'd like your payments due</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={
                    application.preferred_billing_cycle === "weekly"
                      ? "weekly"
                      : application.billing_anchor_day === 15
                      ? "15"
                      : application.billing_anchor_day === 1
                      ? "1"
                      : ""
                  }
                  onValueChange={(val) => {
                    if (val === "weekly") {
                      setApplication({ ...application, preferred_billing_cycle: "weekly", billing_anchor_day: 5 });
                    } else if (val === "1") {
                      setApplication({ ...application, preferred_billing_cycle: "monthly", billing_anchor_day: 1 });
                    } else if (val === "15") {
                      setApplication({ ...application, preferred_billing_cycle: "monthly", billing_anchor_day: 15 });
                    }
                  }}
                  className="grid grid-cols-3 gap-3"
                >
                  <div>
                    <RadioGroupItem value="1" id="billing-1st" className="peer sr-only" />
                    <Label
                      htmlFor="billing-1st"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl font-bold">1st</span>
                      <span className="text-sm text-muted-foreground text-center">of the month</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="15" id="billing-15th" className="peer sr-only" />
                    <Label
                      htmlFor="billing-15th"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl font-bold">15th</span>
                      <span className="text-sm text-muted-foreground text-center">of the month</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="weekly" id="billing-weekly" className="peer sr-only" />
                    <Label
                      htmlFor="billing-weekly"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-lg font-bold leading-tight">Every</span>
                      <span className="text-lg font-bold leading-tight">Friday</span>
                      <span className="text-sm text-muted-foreground text-center">weekly</span>
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  This is your preferred payment schedule. Your account manager may confirm or adjust this when setting up your subscription.
                </p>
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let formatted = digits;
                      if (digits.length <= 3) formatted = digits;
                      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                      setApplication({ ...application, secondary_contact_phone: formatted });
                    }}
                    placeholder="(555) 123-4567"
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