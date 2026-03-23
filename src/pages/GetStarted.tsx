import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check, Gift, AlertCircle, Clipboard, Zap, FileText } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { fullSignupSchema, customerApplicationSchema, validateFile, sanitizeInput } from "@/lib/validations";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackSignup, trackConversion, trackSignupStarted, trackSignupFailed, trackFormStart, trackEvent, fireMetaCapi } from "@/lib/analytics";
import { processReferralCode, validateReferralCode } from "@/lib/referral";
import { trackLinkedInSignup, trackLinkedInApplicationSubmit } from "@/lib/linkedinAnalytics";
import { logSignupStarted, logSignupCompleted, logSignupFailed, logSessionError, logDocumentUploadFailed, logCustomerEvent } from "@/lib/eventLogger";
import { getLeadSourceData } from "@/lib/leadSourceTracking";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";

type FormMode = "quick-start" | "prompt" | "full-form";

export default function GetStarted() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Get Started", url: "https://crumsleasing.com/get-started" }
  ]);

  const [formMode, setFormMode] = useState<FormMode>("quick-start");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Quick Start fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Full form fields
  const [companyName, setCompanyName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [numberOfTrailers, setNumberOfTrailers] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [truckVin, setTruckVin] = useState("");
  const [trailerType, setTrailerType] = useState("");
  const [message, setMessage] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Documents
  const [dotDocument, setDotDocument] = useState<File | null>(null);
  const [driversLicenseFront, setDriversLicenseFront] = useState<File | null>(null);
  const [driversLicenseBack, setDriversLicenseBack] = useState<File | null>(null);
  const [ssn, setSsn] = useState("");
  const [ssnType, setSsnType] = useState<"ssn" | "ein">("ssn");
  const [insuranceDocs, setInsuranceDocs] = useState<File | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceCompanyPhone, setInsuranceCompanyPhone] = useState("");
  const [secondaryContactName, setSecondaryContactName] = useState("");
  const [secondaryContactPhone, setSecondaryContactPhone] = useState("");
  const [secondaryContactRelationship, setSecondaryContactRelationship] = useState("");

  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isCompletionMode, setIsCompletionMode] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError("Phone number must have at least 10 digits");
    } else {
      setPhoneError("");
    }
  };

  // Persist form data in localStorage to prevent mobile data loss
  const STORAGE_KEY = 'crums_getstarted_form';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.email) setEmail(data.email);
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.referralCode) setReferralCode(data.referralCode);
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  useEffect(() => {
    if (email || firstName || lastName || phoneNumber || companyName) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        email, firstName, lastName, phoneNumber, companyName, referralCode
      }));
    }
  }, [email, firstName, lastName, phoneNumber, companyName, referralCode]);

  const clearSavedForm = () => localStorage.removeItem(STORAGE_KEY);

  // Check for completion mode (incomplete profile redirect from login)
  useEffect(() => {
    const complete = searchParams.get("complete");
    if (complete === "true") {
      setIsCompletionMode(true);
      // Load profile data for pre-fill
      (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone, company_name, email')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            if (profile.email) setEmail(profile.email);
            if (profile.first_name) setFirstName(profile.first_name);
            if (profile.last_name) setLastName(profile.last_name);
            if (profile.phone) setPhoneNumber(profile.phone);
            if (profile.company_name) setCompanyName(profile.company_name);
          }
        }
      })();
    }
  }, [searchParams]);

  // Track signup started on page load
  useEffect(() => {
    trackSignupStarted('get_started_page');
  }, []);

  // Check for referral code in URL on mount
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      toast({ 
        title: "Referral code applied!", 
        description: `Code ${refCode} will be applied to your account.` 
      });
    }
  }, [searchParams]);

  const validateAge = (dob: string): boolean => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const validateQuickStart = () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !phoneNumber) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return false;
    }

    const validationResult = fullSignupSchema.safeParse({
      email,
      password,
      firstName,
      lastName,
      phone: phoneNumber
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({ title: "Validation Error", description: firstError.message, variant: "destructive" });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, path: string) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { data, error } = await supabase.storage
      .from('customer-documents')
      .upload(path, file);
    
    if (error) throw error;
    return data.path;
  };

  // Session retry helper for mobile network latency
  const getSessionWithRetry = async (maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return session;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    return null;
  };

  const handleQuickStartSubmit = async () => {
    // In completion mode, skip account creation
    if (isCompletionMode) {
      if (!firstName || !lastName || !phoneNumber) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      setIsLoading(true);
      try {
        const session = await getSessionWithRetry();
        if (!session) throw new Error("Please log in again and retry.");

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            company_name: companyName || null,
            phone: phoneNumber,
            first_name: firstName,
            last_name: lastName
          })
          .eq('id', session.user.id);

        if (profileError) throw profileError;

        // Upsert application with lead source data
        const leadSource = getLeadSourceData();
        await supabase
          .from('customer_applications')
          .upsert({
            user_id: session.user.id,
            phone_number: phoneNumber,
            status: 'new',
            utm_source: leadSource.utm_source || null,
            utm_medium: leadSource.utm_medium || null,
            utm_campaign: leadSource.utm_campaign || null,
            utm_term: leadSource.utm_term || null,
            utm_content: leadSource.utm_content || null,
            referrer: leadSource.referrer || null,
            landing_page: leadSource.landing_page || null,
            lead_source_raw: leadSource as any,
          }, { onConflict: 'user_id', ignoreDuplicates: false });

        clearSavedForm();
        toast({ title: "Profile Updated!", description: "Your profile has been completed." });
        setFormMode("prompt");
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!validateQuickStart()) return;

    setIsLoading(true);
    logSignupStarted(email);
    try {
      // Create user account
      const { error: signUpError } = await signUp(email, password, "customer");
      
      if (signUpError) {
        trackSignupFailed(signUpError.message || 'unknown_error');
        logSignupFailed(email, signUpError.message || 'unknown_error');
        // Friendly message for already-registered users
        if (signUpError.message?.toLowerCase().includes("user already registered") || signUpError.message?.toLowerCase().includes("already registered")) {
          toast({
            title: "Account already exists",
            description: "It looks like you already have an account. Please sign in instead.",
            action: (
              <a href="/login" className="underline font-medium text-sm whitespace-nowrap">
                Go to Login
              </a>
            ),
          });
        } else {
          toast({ title: "Error", description: signUpError.message, variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      // Get the user session with retry for mobile latency
      const session = await getSessionWithRetry();
      if (!session) {
        logSessionError("signup_profile_update", "Session not available after signup");
        toast({ 
          title: "Account Created", 
          description: "Your account was created but we couldn't complete your profile. Please log in at the login page to finish setup.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_name: companyName || null,
          phone: phoneNumber,
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Create or update customer application (upsert to prevent duplicates)
      const leadSource = getLeadSourceData();
      const { error: applicationError } = await supabase
        .from('customer_applications')
        .upsert({
          user_id: session.user.id,
          phone_number: phoneNumber,
          status: 'new',
          utm_source: leadSource.utm_source || null,
          utm_medium: leadSource.utm_medium || null,
          utm_campaign: leadSource.utm_campaign || null,
          utm_term: leadSource.utm_term || null,
          utm_content: leadSource.utm_content || null,
          referrer: leadSource.referrer || null,
          landing_page: leadSource.landing_page || null,
          lead_source_raw: leadSource as any,
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (applicationError) throw applicationError;

      // Track referral if a code was provided
      if (referralCode.trim()) {
        const referralResult = await processReferralCode(referralCode, email);
        if (referralResult) {
          toast({
            title: referralResult.success ? "Referral Applied!" : "Referral Notice",
            description: referralResult.message,
            variant: referralResult.variant,
          });
        }
      }

      // Track successful signup
      trackSignup('email');
      trackConversion('signup');
      trackLinkedInSignup();
      logSignupCompleted(email);
      trackEvent('get_started_complete', {
        form_name: 'get_started_form',
        page_type: 'signup_page',
      });
      
      // Meta CAPI CompleteRegistration
      fireMetaCapi({
        eventName: 'CompleteRegistration',
        email,
        phone: phoneNumber || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      // Notify team of new registration (fire-and-forget)
      supabase.functions.invoke('send-signup-notification', {
        body: { firstName, lastName, email, phone: phoneNumber, companyName, referralCode }
      }).catch(err => console.error('Signup notification error:', err));

      clearSavedForm();

      toast({ 
        title: "Account Created!", 
        description: "Welcome to CRUMS Leasing!" 
      });

      // Show prompt to continue or go to dashboard
      setFormMode("prompt");

    } catch (error: any) {
      console.error("Registration error:", error);
      logSignupFailed(email, error.message || "Unknown registration error");
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create account. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFullForm = () => {
    setFormMode("full-form");
    setCurrentStep(1);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard/customer");
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const validateFullFormStep1 = () => {
    if (!dateOfBirth || !companyAddress || !businessType || !numberOfTrailers || !dateNeeded) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }
    if (!validateAge(dateOfBirth)) {
      toast({ title: "Error", description: "You must be at least 18 years old to apply", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFullFormSubmit = async () => {
    if (!acceptedTerms) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const session = await getSessionWithRetry();
      if (!session) {
        logSessionError("full_form_submit", "Session expired during application submit");
        throw new Error("Session expired. Please log in again.");
      }

      // Update profile with DOB
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_name: companyName || null,
          date_of_birth: dateOfBirth || null
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Upload documents if provided
      let driversLicenseFrontUrl = null;
      let driversLicenseBackUrl = null;
      let insuranceDocsUrl = null;
      let dotNumberUrl = null;

      if (driversLicenseFront) {
        driversLicenseFrontUrl = await uploadFile(driversLicenseFront, `${session.user.id}/drivers-license-front-${Date.now()}`);
      }
      if (driversLicenseBack) {
        driversLicenseBackUrl = await uploadFile(driversLicenseBack, `${session.user.id}/drivers-license-back-${Date.now()}`);
      }
      if (insuranceDocs) {
        insuranceDocsUrl = await uploadFile(insuranceDocs, `${session.user.id}/insurance-${Date.now()}`);
      }
      if (dotDocument) {
        dotNumberUrl = await uploadFile(dotDocument, `${session.user.id}/dot-document-${Date.now()}`);
      }

      // Encrypt SSN before storing
      let encryptedSSN = ssn;
      if (ssn) {
        const { data: encryptData, error: encryptError } = await supabase.functions.invoke('ssn-crypto', {
          body: { action: 'encrypt', ssn: ssn }
        });
        
        if (encryptError) {
          console.error("SSN encryption error:", encryptError);
          throw new Error("Failed to secure SSN data. Please try again.");
        }
        encryptedSSN = encryptData.encrypted;
      }

      // Determine status based on documents
      const hasDocuments = driversLicenseFrontUrl && driversLicenseBackUrl && insuranceDocsUrl;
      const applicationStatus = hasDocuments ? 'pending_review' : 'new';

      // Update customer application
      const { error: applicationError } = await supabase
        .from('customer_applications')
        .update({
          dot_number_url: dotNumberUrl,
          company_address: companyAddress || null,
          business_type: businessType || null,
          number_of_trailers: numberOfTrailers ? parseInt(numberOfTrailers) : null,
          trailer_type: trailerType || null,
          date_needed: dateNeeded || null,
          truck_vin: truckVin || null,
          insurance_company: insuranceCompany || null,
          insurance_company_phone: insuranceCompanyPhone || null,
          message: message || null,
          drivers_license_url: driversLicenseFrontUrl,
          drivers_license_back_url: driversLicenseBackUrl,
          ssn: encryptedSSN || null,
          insurance_docs_url: insuranceDocsUrl,
          secondary_contact_name: secondaryContactName || null,
          secondary_contact_phone: secondaryContactPhone || null,
          secondary_contact_relationship: secondaryContactRelationship || null,
          status: applicationStatus
        })
        .eq('user_id', session.user.id);

      if (applicationError) throw applicationError;

      trackLinkedInApplicationSubmit();
      trackEvent('get_started_complete', {
        form_name: 'get_started_form',
        page_type: 'signup_page',
      });
      
      // LinkedIn CAPI
      supabase.functions.invoke('linkedin-capi', {
        body: {
          conversionType: 'application_submit',
          email,
          firstName,
          lastName,
          company: companyName,
        }
      }).catch(err => console.warn('[LinkedIn CAPI] Background call failed:', err));

      toast({ 
        title: "Application Updated!", 
        description: "Your application has been submitted for review." 
      });

      navigate("/dashboard/customer");

    } catch (error: any) {
      console.error("Application update error:", error);
      logCustomerEvent("application_submit_failed", `Application submit failed: ${error.message}`, { error: error.message });
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update application. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Details", description: "Business info" },
    { number: 2, title: "Documents", description: "Required documents" },
    { number: 3, title: "Review", description: "Confirm & submit" }
  ];

  const getStepStatus = (step: number): 'complete' | 'warning' | 'default' => {
    if (step === 1) {
      const hasAll = dateOfBirth && companyAddress && businessType && numberOfTrailers && dateNeeded;
      if (hasAll && validateAge(dateOfBirth)) return 'complete';
      if (dateOfBirth || companyAddress || businessType) return 'warning';
      return 'default';
    }
    if (step === 2) {
      if (dotDocument && driversLicenseFront && driversLicenseBack && insuranceDocs) return 'complete';
      return 'default';
    }
    if (step === 3) {
      if (acceptedTerms) return 'complete';
      return 'default';
    }
    return 'default';
  };

  // Quick Start Form
  if (formMode === "quick-start") {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO
          title="Get Started - Apply for Trailer Leasing"
          description="Start your trailer leasing application with CRUMS Leasing. Fast approval process for 53-foot dry van and flatbed trailers. Create your account and submit your application today."
          canonical="https://crumsleasing.com/get-started"
          structuredData={breadcrumbSchema}
        />
        <Navigation />
        <Breadcrumbs />
        
        <main className="flex-1 bg-gradient-to-b from-background to-muted py-12">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                <Zap className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isCompletionMode ? "Complete Your Profile" : "Quick Start"}
              </h1>
              <p className="text-muted-foreground">
                {isCompletionMode ? "Please fill in your details to finish setup" : "Create your account in 60 seconds"}
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {isCompletionMode ? "Your Information" : "Create Your Account"}
                </CardTitle>
                <CardDescription>
                  {isCompletionMode 
                    ? "We need a few details to complete your profile"
                    : "Get started fast - complete your full application later"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!isCompletionMode && (
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input 
                      id="phoneNumber" 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(555) 123-4567"
                      className={phoneError ? "border-destructive" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-destructive mt-1">{phoneError}</p>
                    )}
                  </div>
                  {/* Company Name - shown in both modes */}
                  <div>
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your trucking company name"
                    />
                  </div>

                  {!isCompletionMode && (
                    <>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                        />
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                          <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                          <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
                          <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>One lowercase letter</li>
                          <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>One number</li>
                        </ul>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                        />
                      </div>
                    </>
                  )}

                  {/* Referral Code */}
                  {!isCompletionMode && (
                    <div>
                      <Label htmlFor="referralCode">Referral or Partner Code (Optional)</Label>
                      <div className="relative">
                        <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="referralCode" 
                          value={referralCode} 
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Partner, sales rep, or customer referral code</p>
                    </div>
                  )}

                  <Button 
                    onClick={handleQuickStartSubmit} 
                    className="w-full bg-secondary hover:bg-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : isCompletionMode ? "Complete Profile" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Prompt after Quick Start
  if (formMode === "prompt") {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO
          title="Account Created — Start Your Trailer Lease"
          description="Your account has been created. Complete your application or start exploring your dashboard."
          canonical="https://crumsleasing.com/get-started"
        />
        <Navigation />
        
        <main className="flex-1 bg-gradient-to-b from-background to-muted py-12 flex items-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to CRUMS Leasing!</h1>
              <p className="text-muted-foreground">Your account has been created successfully</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={handleContinueFullForm}>
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-2 mx-auto">
                    <FileText className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Complete Application</CardTitle>
                  <CardDescription>
                    Upload documents and submit for faster approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Upload driver's license
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Provide insurance details
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Submit DOT documentation
                    </li>
                  </ul>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Continue Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={handleGoToDashboard}>
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 mx-auto">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Go to Dashboard</CardTitle>
                  <CardDescription>
                    Explore your account and finish later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      View available trailers
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Complete application anytime
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Contact our team
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Full Form (after quick start)
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Complete Your Trailer Leasing Application"
        description="Complete your trailer leasing application with CRUMS Leasing."
        canonical="https://crumsleasing.com/get-started"
        structuredData={breadcrumbSchema}
      />
      <Navigation />
      <Breadcrumbs />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const status = getStepStatus(step.number);
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        type="button"
                        onClick={() => handleStepClick(step.number)}
                        aria-label={`Go to ${step.title}`}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all cursor-pointer hover:scale-105 hover:ring-2 hover:ring-primary/50 ${
                          currentStep === step.number 
                            ? 'bg-secondary text-secondary-foreground ring-2 ring-primary' 
                            : status === 'complete'
                            ? 'bg-primary text-primary-foreground'
                            : status === 'warning'
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status === 'complete' && currentStep !== step.number ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          step.number
                        )}
                      </button>
                      <span className="text-xs mt-2 font-medium text-center">{step.title}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{step.description}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${
                        step.number < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Business Details"}
                {currentStep === 2 && "Upload Documents"}
                {currentStep === 3 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us about your business needs"}
                {currentStep === 2 && "Upload required documentation (can skip and do later)"}
                {currentStep === 3 && "Review your information and submit"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Business Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date"
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Must be 18 years or older</p>
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Address *</Label>
                    <Input 
                      id="companyAddress" 
                      value={companyAddress} 
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="proprietorship">Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfTrailers">Number of Trailers *</Label>
                      <Input 
                        id="numberOfTrailers" 
                        type="number"
                        min="1"
                        value={numberOfTrailers} 
                        onChange={(e) => setNumberOfTrailers(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trailerType">Trailer Type</Label>
                      <Select value={trailerType} onValueChange={setTrailerType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="53' Dry Van">53' Dry Van</SelectItem>
                          <SelectItem value="48' Flatbed">48' Flatbed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateNeeded">Date Needed *</Label>
                    <Input 
                      id="dateNeeded" 
                      type="date"
                      value={dateNeeded} 
                      onChange={(e) => setDateNeeded(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="ssn">
                        {ssnType === "ssn" ? "Social Security Number" : "Employer Identification Number"}
                      </Label>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setSsnType("ssn"); setSsn(""); }}
                          className={`px-2 py-1 rounded transition-colors ${
                            ssnType === "ssn" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          SSN
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSsnType("ein"); setSsn(""); }}
                          className={`px-2 py-1 rounded transition-colors ${
                            ssnType === "ein" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          EIN
                        </button>
                      </div>
                    </div>
                    <Input 
                      id="ssn" 
                      type="text"
                      value={ssnType === "ein" 
                        ? ssn.replace(/(\d{2})(\d{0,7})/, (_, p1, p2) => p2 ? `${p1}-${p2}` : p1)
                        : ssn.replace(/(\d{3})(\d{2})(\d{0,4})/, (_, p1, p2, p3) => 
                            p3 ? `${p1}-${p2}-${p3}` : p2 ? `${p1}-${p2}` : p1
                          )
                      }
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setSsn(digits);
                      }}
                      placeholder={ssnType === "ein" ? "XX-XXXXXXX" : "XXX-XX-XXXX"}
                      maxLength={ssnType === "ein" ? 10 : 11}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Additional Notes (Optional)</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any special requests or notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleGoToDashboard}>
                      Skip for Now
                    </Button>
                    <Button onClick={() => {
                      if (validateFullFormStep1()) handleNext();
                    }} className="bg-secondary hover:bg-secondary/90">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Documents can be uploaded now or later from your dashboard. Having all documents speeds up approval.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <Label className="font-medium">Driver's License (Front)</Label>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setDriversLicenseFront(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                      {driversLicenseFront && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> {driversLicenseFront.name}
                        </p>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <Label className="font-medium">Driver's License (Back)</Label>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setDriversLicenseBack(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                      {driversLicenseBack && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> {driversLicenseBack.name}
                        </p>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <Label className="font-medium">Insurance Documents</Label>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setInsuranceDocs(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                      {insuranceDocs && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> {insuranceDocs.name}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        <Input 
                          placeholder="Insurance Company Name"
                          value={insuranceCompany}
                          onChange={(e) => setInsuranceCompany(e.target.value)}
                        />
                        <Input 
                          placeholder="Insurance Company Phone"
                          value={insuranceCompanyPhone}
                          onChange={(e) => setInsuranceCompanyPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <Label className="font-medium">DOT/MC Documentation (Optional)</Label>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setDotDocument(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                      {dotDocument && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> {dotDocument.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <Label className="font-medium mb-3 block">Secondary Contact (Emergency)</Label>
                    <div className="grid gap-3">
                      <Input 
                        placeholder="Contact Name"
                        value={secondaryContactName}
                        onChange={(e) => setSecondaryContactName(e.target.value)}
                      />
                      <Input 
                        placeholder="Contact Phone"
                        value={secondaryContactPhone}
                        onChange={(e) => setSecondaryContactPhone(e.target.value)}
                      />
                      <Input 
                        placeholder="Relationship (e.g., Spouse, Business Partner)"
                        value={secondaryContactRelationship}
                        onChange={(e) => setSecondaryContactRelationship(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleNext} className="bg-secondary hover:bg-secondary/90">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Application Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{firstName} {lastName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Business Type</p>
                        <p className="font-medium">{businessType || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trailers Needed</p>
                        <p className="font-medium">{numberOfTrailers} {trailerType || "trailer(s)"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date Needed</p>
                        <p className="font-medium">{dateNeeded || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-muted-foreground mb-2">Documents Uploaded</p>
                      <div className="flex flex-wrap gap-2">
                        {driversLicenseFront && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <Check className="h-3 w-3" /> License (Front)
                          </span>
                        )}
                        {driversLicenseBack && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <Check className="h-3 w-3" /> License (Back)
                          </span>
                        )}
                        {insuranceDocs && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <Check className="h-3 w-3" /> Insurance
                          </span>
                        )}
                        {dotDocument && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <Check className="h-3 w-3" /> DOT Docs
                          </span>
                        )}
                        {!driversLicenseFront && !driversLicenseBack && !insuranceDocs && !dotDocument && (
                          <span className="text-xs text-muted-foreground">No documents uploaded yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
                      . I understand that:
                      <ul className="mt-2 ml-4 space-y-1 text-muted-foreground list-disc">
                        <li>My application will be reviewed and I may be contacted for additional information</li>
                        <li>Upon approval, I will be required to sign a <strong>Trailer Leasing Agreement</strong> via DocuSign</li>
                        <li>The lease agreement includes ACH authorization, payment terms, and policies for late fees and defaults</li>
                        <li>I will need to link my bank account for ACH payments before trailer pickup</li>
                      </ul>
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleFullFormSubmit}
                      disabled={isLoading || !acceptedTerms}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      {isLoading ? "Submitting..." : "Submit Application"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <RelatedLinksSection
        title="Helpful Resources"
        subtitle="Everything you need to get started with confidence"
        links={[
          { to: "/dry-van-trailer-leasing", label: "Dry Van Trailer Leasing", description: "Explore our 53' dry van lease options with flexible terms." },
          { to: "/flatbed-trailer-leasing", label: "Flatbed Trailer Leasing", description: "Flatbed trailers for construction, lumber, and oversized loads." },
          { to: "/commercial-dry-van-trailer-for-lease-56171", label: "See a Trailer Profile", description: "View our 2020 Great Dane dry van with full specs and photos." },
          { to: "/lease-to-own", label: "Lease-to-Own Program", description: "Build equity while you haul — own your trailer over time." },
          { to: "/resources/tools", label: "Trucking Calculators", description: "Cost-per-mile, fuel, IFTA, and profit calculators for carriers." },
          { to: "/reviews", label: "Customer Reviews", description: "See what other owner-operators say about leasing with CRUMS." },
        ]}
      />

      <Footer />
    </div>
  );
}
