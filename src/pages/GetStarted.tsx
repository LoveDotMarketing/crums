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
import { ArrowRight, ArrowLeft, Check, Gift } from "lucide-react";
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
  const [mcDotNumber, setMcDotNumber] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [numberOfTrailers, setNumberOfTrailers] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [message, setMessage] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Step 2 - Banking (optional)
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Step 3 - Documents (optional)
  const [driversLicense, setDriversLicense] = useState<File | null>(null);
  const [ssnCard, setSsnCard] = useState<File | null>(null);
  const [insuranceDocs, setInsuranceDocs] = useState<File | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [secondaryContactName, setSecondaryContactName] = useState("");
  const [secondaryContactPhone, setSecondaryContactPhone] = useState("");
  const [secondaryContactRelationship, setSecondaryContactRelationship] = useState("");

  // Step 4 - Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

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

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword || !companyName || !primaryContactName || !phoneNumber || !companyAddress || !businessType || !numberOfTrailers || !dateNeeded) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
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
      firstName: primaryContactName.split(" ")[0] || "",
      lastName: primaryContactName.split(" ")[1] || "",
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
      company_name: companyName,
      company_address: companyAddress,
      mc_dot_number: mcDotNumber,
      business_type: businessType,
      account_holder_name: accountHolderName || "N/A",
      account_number: accountNumber || "0000",
      routing_number: routingNumber || "000000000",
      bank_name: bankName || "N/A",
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
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDoThisLater = () => {
    setCurrentStep(4);
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
    if (!acceptedTerms) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" });
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
          first_name: primaryContactName.split(' ')[0],
          last_name: primaryContactName.split(' ').slice(1).join(' ') || ''
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Upload documents if provided
      let driversLicenseUrl = null;
      let ssnCardUrl = null;
      let insuranceDocsUrl = null;

      if (driversLicense) {
        driversLicenseUrl = await uploadFile(driversLicense, `${session.user.id}/drivers-license-${Date.now()}`);
      }
      if (ssnCard) {
        ssnCardUrl = await uploadFile(ssnCard, `${session.user.id}/ssn-card-${Date.now()}`);
      }
      if (insuranceDocs) {
        insuranceDocsUrl = await uploadFile(insuranceDocs, `${session.user.id}/insurance-${Date.now()}`);
      }

      // Check if all required fields are filled to determine status
      const hasBankingInfo = bankName && accountHolderName && accountNumber && routingNumber && paymentMethod;
      const hasDocuments = driversLicenseUrl && ssnCardUrl && insuranceDocsUrl;
      const applicationStatus = (hasBankingInfo && hasDocuments) ? 'pending' : 'incomplete';

      // Create customer application
      const { error: applicationError } = await supabase
        .from('customer_applications')
        .insert({
          user_id: session.user.id,
          phone_number: phoneNumber,
          mc_dot_number: mcDotNumber || null,
          company_address: companyAddress,
          business_type: businessType,
          number_of_trailers: parseInt(numberOfTrailers),
          date_needed: dateNeeded,
          insurance_company: insuranceCompany || null,
          message: message || null,
          bank_name: bankName || null,
          account_holder_name: accountHolderName || null,
          account_number: accountNumber || null,
          routing_number: routingNumber || null,
          payment_method: paymentMethod || null,
          drivers_license_url: driversLicenseUrl,
          ssn_card_url: ssnCardUrl,
          insurance_docs_url: insuranceDocsUrl,
          secondary_contact_name: secondaryContactName || null,
          secondary_contact_phone: secondaryContactPhone || null,
          secondary_contact_relationship: secondaryContactRelationship || null,
          status: applicationStatus
        });

      if (applicationError) throw applicationError;

      // Track referral if a code was provided
      if (referralCode.trim()) {
        try {
          // Use the secure create_referral function
          const { data: referralResult, error: referralError } = await supabase
            .rpc("create_referral", {
              p_referral_code: referralCode.trim().toUpperCase(),
              p_referred_email: email
            });

          if (referralError) {
            console.error("Referral error:", referralError);
          } else if (referralResult) {
            const result = referralResult as { success: boolean; error?: string; referral_id?: string };
            if (result.success) {
              toast({ 
                title: "Referral Applied!", 
                description: "You'll receive $250 off after lease approval." 
              });
            } else if (result.error === "You cannot refer yourself") {
              toast({ 
                title: "Invalid Referral Code", 
                description: "Oops! You can't use your own referral code. Ask a friend to share theirs!",
                variant: "destructive"
              });
            } else if (result.error === "This email has already been referred") {
              toast({ 
                title: "Already Referred", 
                description: "This email has already been referred by another customer."
              });
            } else if (result.error) {
              toast({ 
                title: "Referral Error", 
                description: result.error,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          // Non-critical, don't block signup flow
          console.error("Referral tracking error:", error);
        }
      }

      // Track successful signup
      trackSignup('email');
      trackConversion('signup');

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
    { number: 2, title: "Banking", description: "Payment information" },
    { number: 3, title: "Documents", description: "Required documents" },
    { number: 4, title: "Review", description: "Confirm & submit" }
  ];

  const isStepComplete = (step: number) => {
    if (step === 1) return email && password && confirmPassword && companyName && primaryContactName && phoneNumber;
    if (step === 2) return bankName && accountHolderName && accountNumber && routingNumber && paymentMethod;
    if (step === 3) return driversLicense && ssnCard && insuranceDocs;
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
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.number 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep === step.number 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                    </div>
                    <div className="text-center mt-2 hidden sm:block">
                      <div className="text-xs font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Banking Information"}
                {currentStep === 3 && "Documents & Additional Info"}
                {currentStep === 4 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter your basic information to get started"}
                {currentStep === 2 && "Optional - Add your banking details or do this later"}
                {currentStep === 3 && "Optional - Upload required documents or do this later"}
                {currentStep === 4 && "Review your information and submit your application"}
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
                      placeholder="Minimum 8 characters"
                    />
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
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mcDotNumber">MC/DOT Number (Optional)</Label>
                    <Input 
                      id="mcDotNumber" 
                      value={mcDotNumber} 
                      onChange={(e) => setMcDotNumber(e.target.value)}
                      placeholder="MC/DOT#"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactName">Primary Contact Name *</Label>
                    <Input 
                      id="primaryContactName" 
                      value={primaryContactName} 
                      onChange={(e) => setPrimaryContactName(e.target.value)}
                      placeholder="Full name"
                    />
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
                    <Label htmlFor="companyAddress">Company Address *</Label>
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
                    <Label htmlFor="dateNeeded">Date Needed *</Label>
                    <Input 
                      id="dateNeeded" 
                      type="date"
                      value={dateNeeded} 
                      onChange={(e) => setDateNeeded(e.target.value)}
                    />
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
                    <Input 
                      id="referralCode" 
                      type="text"
                      value={referralCode} 
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CRUMS-ABC123"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Have a referral code? Enter it to save $250 on your lease!
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Banking */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input 
                      id="bankName" 
                      value={bankName} 
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Your bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input 
                      id="accountHolderName" 
                      value={accountHolderName} 
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name on account"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input 
                      id="accountNumber" 
                      value={accountNumber} 
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input 
                      id="routingNumber" 
                      value={routingNumber} 
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="9-digit routing number"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ach">ACH Transfer</SelectItem>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driversLicense">Driver's License</Label>
                    <Input 
                      id="driversLicense" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setDriversLicense(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssnCard">SSN Card</Label>
                    <Input 
                      id="ssnCard" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setSsnCard(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceDocs">Insurance Documents</Label>
                    <Input 
                      id="insuranceDocs" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setInsuranceDocs(e.target.files?.[0] || null)}
                    />
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

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Account Information</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                        <p className="text-sm"><span className="font-medium">Email:</span> {email}</p>
                        <p className="text-sm"><span className="font-medium">Company:</span> {companyName}</p>
                        {mcDotNumber && <p className="text-sm"><span className="font-medium">MC/DOT#:</span> {mcDotNumber}</p>}
                        <p className="text-sm"><span className="font-medium">Contact:</span> {primaryContactName}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {phoneNumber}</p>
                        <p className="text-sm"><span className="font-medium">Address:</span> {companyAddress}</p>
                        <p className="text-sm"><span className="font-medium">Business Type:</span> {businessType}</p>
                        <p className="text-sm"><span className="font-medium">Trailers Needed:</span> {numberOfTrailers}</p>
                        <p className="text-sm"><span className="font-medium">Date Needed:</span> {dateNeeded}</p>
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
                      <h3 className="font-semibold text-sm text-muted-foreground">Banking Information</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {isStepComplete(2) ? (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Bank:</span> {bankName}</p>
                            <p className="text-sm"><span className="font-medium">Account Holder:</span> {accountHolderName}</p>
                            <p className="text-sm"><span className="font-medium">Payment Method:</span> {paymentMethod?.toUpperCase()}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not completed - will need to add this later</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Documents</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">Driver's License:</span>
                          {driversLicense ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <span className="font-medium">SSN Card:</span>
                          {ssnCard ? <Check className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground italic">Not uploaded</span>}
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
                  {(currentStep === 2 || currentStep === 3) && (
                    <Button 
                      variant="secondary" 
                      onClick={handleDoThisLater}
                      disabled={isLoading}
                    >
                      Do This Later
                    </Button>
                  )}

                  {currentStep < 4 ? (
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
