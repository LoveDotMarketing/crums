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
import { ArrowRight, ArrowLeft, Check, Gift, AlertCircle, Clipboard } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { fullSignupSchema, customerApplicationSchema, validateFile, sanitizeInput } from "@/lib/validations";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackSignup, trackConversion, trackSignupStarted, trackSignupFailed, trackFormStart } from "@/lib/analytics";
import { processReferralCode, validateReferralCode } from "@/lib/referral";
import { trackLinkedInSignup, trackLinkedInApplicationSubmit } from "@/lib/linkedinAnalytics";

export default function GetStarted() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Get Started", url: "https://crumsleasing.com/get-started" }
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Step 1 - Required fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [numberOfTrailers, setNumberOfTrailers] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [truckVin, setTruckVin] = useState("");
  const [trailerType, setTrailerType] = useState("");
  const [message, setMessage] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Step 2 - Documents (optional)
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

  // Step 3 - Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);

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

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !dateOfBirth || !phoneNumber || !companyAddress || !businessType || !numberOfTrailers || !dateNeeded) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }
    if (!validateAge(dateOfBirth)) {
      toast({ title: "Error", description: "You must be at least 18 years old to apply", variant: "destructive" });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return false;
    }

    // Validate with zod schema
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

    // Validate application data
    const appValidation = customerApplicationSchema.safeParse({
      email,
      phone_number: phoneNumber,
      company_name: companyName || "",
      company_address: companyAddress,
      business_type: businessType,
      account_holder_name: "N/A",
      account_number: "0000",
      routing_number: "000000000",
      bank_name: "N/A",
      insurance_company: insuranceCompany || "N/A",
      secondary_contact_name: secondaryContactName,
      secondary_contact_phone: secondaryContactPhone,
      secondary_contact_relationship: secondaryContactRelationship,
      message: message
    });

    if (!appValidation.success) {
      const firstError = appValidation.error.errors[0];
      toast({ title: "Validation Error", description: firstError.message, variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDoThisLater = () => {
    setCurrentStep(3);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const validateAllRequiredFields = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Step 1 required fields
    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    if (!confirmPassword) errors.push("Confirm password is required");
    if (password !== confirmPassword) errors.push("Passwords don't match");
    if (!firstName) errors.push("First name is required");
    if (!lastName) errors.push("Last name is required");
    if (!dateOfBirth) errors.push("Date of birth is required");
    if (dateOfBirth && !validateAge(dateOfBirth)) errors.push("Must be at least 18 years old");
    if (!phoneNumber) errors.push("Phone number is required");
    if (!companyAddress) errors.push("Address is required");
    if (!businessType) errors.push("Business type is required");
    if (!numberOfTrailers) errors.push("Number of trailers is required");
    if (!dateNeeded) errors.push("Date needed is required");
    
    // Step 4 required
    if (!acceptedTerms) errors.push("You must accept the terms and conditions");
    
    return { valid: errors.length === 0, errors };
  };

  const getStepStatus = (step: number): 'complete' | 'warning' | 'default' => {
    if (step === 1) {
      const hasAll = email && password && confirmPassword && firstName && lastName && dateOfBirth && phoneNumber && companyAddress && businessType && numberOfTrailers && dateNeeded && ssn;
      if (hasAll && password === confirmPassword && validateAge(dateOfBirth)) return 'complete';
      if (email || password || firstName || lastName) return 'warning';
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

  const uploadFile = async (file: File, path: string) => {
    // Validate file before upload
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

  const handleSubmit = async () => {
    const validation = validateAllRequiredFields();
    if (!validation.valid) {
      toast({ 
        title: "Missing Required Information", 
        description: validation.errors.slice(0, 3).join(", ") + (validation.errors.length > 3 ? ` (+${validation.errors.length - 3} more)` : ""),
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create user account
      const { error: signUpError } = await signUp(email, password, "customer");
      
      if (signUpError) {
        trackSignupFailed(signUpError.message || 'unknown_error');
        toast({ title: "Error", description: signUpError.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Update profile with company name and phone
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_name: companyName,
          phone: phoneNumber,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Upload documents if provided
      let driversLicenseFrontUrl = null;
      let driversLicenseBackUrl = null;
      let insuranceDocsUrl = null;

      if (driversLicenseFront) {
        driversLicenseFrontUrl = await uploadFile(driversLicenseFront, `${session.user.id}/drivers-license-front-${Date.now()}`);
      }
      if (driversLicenseBack) {
        driversLicenseBackUrl = await uploadFile(driversLicenseBack, `${session.user.id}/drivers-license-back-${Date.now()}`);
      }
      if (insuranceDocs) {
        insuranceDocsUrl = await uploadFile(insuranceDocs, `${session.user.id}/insurance-${Date.now()}`);
      }

      // Upload DOT document
      let dotNumberUrl = null;
      if (dotDocument) {
        dotNumberUrl = await uploadFile(dotDocument, `${session.user.id}/dot-document-${Date.now()}`);
      }

      // Check if all required fields are filled to determine status
      const hasDocuments = driversLicenseFrontUrl && driversLicenseBackUrl && insuranceDocsUrl;
      const applicationStatus = hasDocuments ? 'pending' : 'incomplete';

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

      // Create customer application (banking will be collected via Stripe)
      const { error: applicationError } = await supabase
        .from('customer_applications')
        .insert({
          user_id: session.user.id,
          phone_number: phoneNumber,
          dot_number_url: dotNumberUrl,
          company_address: companyAddress,
          business_type: businessType,
          number_of_trailers: parseInt(numberOfTrailers),
          trailer_type: trailerType || null,
          date_needed: dateNeeded,
          truck_vin: truckVin,
          insurance_company: insuranceCompany || null,
          insurance_company_phone: insuranceCompanyPhone || null,
          message: message || null,
          drivers_license_url: driversLicenseFrontUrl,
          drivers_license_back_url: driversLicenseBackUrl,
          ssn: encryptedSSN,
          insurance_docs_url: insuranceDocsUrl,
          secondary_contact_name: secondaryContactName || null,
          secondary_contact_phone: secondaryContactPhone || null,
          secondary_contact_relationship: secondaryContactRelationship || null,
          status: applicationStatus
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
      trackLinkedInApplicationSubmit();
      
      // LinkedIn CAPI (server-side) - fire in background
      supabase.functions.invoke('linkedin-capi', {
        body: {
          conversionType: 'signup',
          email,
          firstName,
          lastName,
          company: companyName,
        }
      }).catch(err => console.warn('[LinkedIn CAPI] Background call failed:', err));
      
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
        title: "Success!", 
        description: "Your account has been created. Welcome aboard!" 
      });

      // Redirect to customer dashboard
      navigate("/customer/dashboard");

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create account. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Account Info", description: "Create your account" },
    { number: 2, title: "Documents", description: "Required documents" },
    { number: 3, title: "Review", description: "Confirm & submit" }
  ];

  const isStepComplete = (step: number) => {
    if (step === 1) return email && password && confirmPassword && firstName && lastName && dateOfBirth && phoneNumber && ssn;
    if (step === 2) return dotDocument && driversLicenseFront && driversLicenseBack && insuranceDocs;
    return false;
  };

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
                        {status === 'warning' && currentStep !== step.number && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background" />
                        )}
                      </button>
                      <div className="text-center mt-2 hidden sm:block">
                        <div className={`text-xs font-medium ${currentStep === step.number ? 'text-primary' : ''}`}>{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 transition-colors ${
                        getStepStatus(step.number) === 'complete' ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Documents & Additional Info"}
                {currentStep === 3 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter your basic information to get started"}
                {currentStep === 2 && "Optional - Upload required documents or do this later"}
                {currentStep === 3 && "Review your information and submit your application"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Account Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
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
                  <div>
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
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
                  <p className="text-xs text-muted-foreground -mt-2">Name must match your driver's license exactly</p>
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
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input 
                      id="phoneNumber" 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
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
                  <div>
                    <Label htmlFor="numberOfTrailers">Number of Trailers Needed *</Label>
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
                    <Label htmlFor="trailerType">Trailer Type *</Label>
                    <Select value={trailerType} onValueChange={setTrailerType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trailer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="53' Dry Van">53' Dry Van</SelectItem>
                        <SelectItem value="48' Flatbed">48' Flatbed</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="truckVin">Cab VIN#</Label>
                    <Input 
                      id="truckVin" 
                      value={truckVin} 
                      onChange={(e) => setTruckVin(e.target.value.toUpperCase())}
                      placeholder="Enter your cab/truck VIN"
                      maxLength={17}
                    />
                    <p className="text-xs text-muted-foreground mt-1">17-character Vehicle Identification Number</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="ssn">
                        {ssnType === "ssn" ? "Social Security Number" : "Employer Identification Number"} *
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {ssnType === "ein" 
                        ? "9-digit Employer Identification Number for business entities."
                        : "9-digit Social Security Number for individual owner-operators."
                      }
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any additional information or special requests..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referralCode" className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Referral Code (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          id="referralCode" 
                          type="text"
                          value={referralCode} 
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="e.g. CRUMS-ABC123"
                          className={`pr-10 ${
                            referralCode.trim() 
                              ? validateReferralCode(referralCode).valid 
                                ? "border-green-500 focus-visible:ring-green-500" 
                                : "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                              setShowPasteHint(true);
                              setTimeout(() => setShowPasteHint(false), 2000);
                            }
                          }}
                          onFocus={() => setShowPasteHint(false)}
                        />
                        {referralCode.trim() && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validateReferralCode(referralCode).valid ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setReferralCode(text.toUpperCase().trim());
                          } catch {
                            toast({ title: "Error", description: "Unable to access clipboard", variant: "destructive" });
                          }
                        }}
                        title="Paste from clipboard"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                    {referralCode.trim() && !validateReferralCode(referralCode).valid ? (
                      <p className="text-xs text-destructive mt-1">
                        {validateReferralCode(referralCode).error}
                      </p>
                    ) : showPasteHint ? (
                      <p className="text-xs text-primary mt-1 animate-pulse">
                        Pasting... or click the clipboard button
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Have a referral code? Enter it to save $250 on your lease!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dotDocument">DOT Registration Document</Label>
                    <Input 
                      id="dotDocument" 
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setDotDocument(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF</p>
                    {dotDocument && (
                      <p className="text-xs text-green-600 mt-1">✓ {dotDocument.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="driversLicenseFront">Driver's License (Front) *</Label>
                    <Input 
                      id="driversLicenseFront" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setDriversLicenseFront(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF</p>
                    {driversLicenseFront && (
                      <p className="text-xs text-green-600 mt-1">✓ {driversLicenseFront.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="driversLicenseBack">Driver's License (Back) *</Label>
                    <Input 
                      id="driversLicenseBack" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setDriversLicenseBack(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF</p>
                    {driversLicenseBack && (
                      <p className="text-xs text-green-600 mt-1">✓ {driversLicenseBack.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="insuranceDocs">Insurance Documents</Label>
                    <Input 
                      id="insuranceDocs" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setInsuranceDocs(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF</p>
                  </div>
                  <div>
                    <Label htmlFor="insuranceCompany">Insurance Company Name</Label>
                    <Input 
                      id="insuranceCompany" 
                      value={insuranceCompany} 
                      onChange={(e) => setInsuranceCompany(e.target.value)}
                      placeholder="Insurance company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceCompanyPhone">Insurance Company Phone</Label>
                    <Input 
                      id="insuranceCompanyPhone" 
                      type="tel"
                      value={insuranceCompanyPhone} 
                      onChange={(e) => setInsuranceCompanyPhone(e.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-4">Secondary Contact (Optional)</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="secondaryContactName">Name</Label>
                        <Input 
                          id="secondaryContactName" 
                          value={secondaryContactName} 
                          onChange={(e) => setSecondaryContactName(e.target.value)}
                          placeholder="Secondary contact name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryContactPhone">Phone</Label>
                        <Input 
                          id="secondaryContactPhone" 
                          type="tel"
                          value={secondaryContactPhone} 
                          onChange={(e) => setSecondaryContactPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryContactRelationship">Relationship</Label>
                        <Input 
                          id="secondaryContactRelationship" 
                          value={secondaryContactRelationship} 
                          onChange={(e) => setSecondaryContactRelationship(e.target.value)}
                          placeholder="e.g., Business Partner, Spouse"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Account Information</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                        <p className="text-sm"><span className="font-medium">Email:</span> {email}</p>
                        {companyName && <p className="text-sm"><span className="font-medium">Company:</span> {companyName}</p>}
                        <p className="text-sm"><span className="font-medium">Name:</span> {firstName} {lastName}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {phoneNumber}</p>
                        <p className="text-sm"><span className="font-medium">Address:</span> {companyAddress}</p>
                        <p className="text-sm"><span className="font-medium">Business Type:</span> {businessType}</p>
                        <p className="text-sm"><span className="font-medium">Trailers Needed:</span> {numberOfTrailers}</p>
                        <p className="text-sm"><span className="font-medium">Trailer Type:</span> {trailerType}</p>
                        <p className="text-sm"><span className="font-medium">Date Needed:</span> {dateNeeded}</p>
                        <p className="text-sm"><span className="font-medium">Cab VIN#:</span> {truckVin}</p>
                        {message && <p className="text-sm"><span className="font-medium">Message:</span> {message}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Insurance</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {insuranceCompany ? (
                          <p className="text-sm"><span className="font-medium">Company:</span> {insuranceCompany}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not provided</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Documents</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">DOT Document:</span>
                          {dotDocument ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">Driver's License (Front):</span>
                          {driversLicenseFront ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">Driver's License (Back):</span>
                          {driversLicenseBack ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">Insurance:</span>
                          {insuranceDocs ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Secondary Contact</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {secondaryContactName ? (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Name:</span> {secondaryContactName}</p>
                            <p className="text-sm"><span className="font-medium">Phone:</span> {secondaryContactPhone}</p>
                            <p className="text-sm"><span className="font-medium">Relationship:</span> {secondaryContactRelationship}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-4 border-t">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I accept the <Link to="/terms" className="text-primary hover:underline">terms and conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>, and authorize CRUM'S Trucking & Leasing to process my application.
                      I understand that incomplete applications may take longer to process.
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={currentStep === 1 || isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {currentStep === 2 && (
                    <Button 
                      variant="secondary" 
                      onClick={handleDoThisLater}
                      disabled={isLoading}
                    >
                      Do This Later
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button onClick={handleNext} disabled={isLoading}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isLoading || !acceptedTerms}>
                      {isLoading ? "Creating Account..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Links */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions before applying?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services/trailer-leasing" className="text-primary hover:underline font-medium">
                Trailer leasing details
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Speak with our team
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/resources" className="text-primary hover:underline font-medium">
                Carrier resources & tools
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
