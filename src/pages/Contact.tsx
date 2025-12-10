import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { localBusinessSchema, generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackFormSubmission, trackConversion, trackPhoneClick, trackFormStart } from "@/lib/analytics";

// Spam detection utilities
const isGibberish = (text: string): boolean => {
  if (!text || text.length < 2) return false;
  
  // Check for excessive consonants in a row (more than 4)
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  if (consonantPattern.test(text)) return true;
  
  // Check for random character sequences (mix of numbers and letters in unusual patterns)
  const randomPattern = /[a-z]{1,2}[0-9]{1,2}[a-z]{1,2}[0-9]{1,2}/i;
  if (randomPattern.test(text)) return true;
  
  // Check vowel ratio - natural text has ~40% vowels
  const vowels = (text.match(/[aeiou]/gi) || []).length;
  const letters = (text.match(/[a-z]/gi) || []).length;
  if (letters > 5 && vowels / letters < 0.15) return true;
  
  return false;
};

const isValidName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, apostrophes, periods (for initials)
  const namePattern = /^[a-zA-Z][a-zA-Z\s\-'.]{1,99}$/;
  return namePattern.test(name) && !isGibberish(name);
};

const isValidPhone = (phone: string): boolean => {
  // Extract digits only
  const digits = phone.replace(/\D/g, '');
  // Must have at least 10 digits
  return digits.length >= 10 && digits.length <= 15;
};

const isValidCompany = (company: string): boolean => {
  // At least 2 characters, not too many special characters
  if (company.length < 2 || company.length > 200) return false;
  
  // Check for excessive special characters
  const specialChars = (company.match(/[^a-zA-Z0-9\s\-&'.]/g) || []).length;
  if (specialChars > company.length * 0.3) return false;
  
  return !isGibberish(company);
};

// List of known disposable email domains
const disposableEmailDomains = [
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'sharklasers.com', 'temp-mail.org', '10minutemail.com', 'fakeinbox.com',
  'trashmail.com', 'mailnesia.com', 'tempinbox.com', 'dispostable.com'
];

const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

const Contact = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Contact", url: "https://crumsleasing.com/contact" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, breadcrumbSchema]
  };
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime] = useState(Date.now());
  const [formStarted, setFormStarted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    website: "", // Honeypot field - should always be empty
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormFocus = (fieldName: string) => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart('contact_quote', fieldName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently "succeed" (bots fill hidden fields)
    if (formData.website) {
      // Fake success to fool bots
      toast({
        title: "Success!",
        description: "Your request has been submitted. We'll be in touch soon!",
      });
      return;
    }
    
    // Time-based check - reject if submitted too quickly (< 3 seconds)
    const timeSpent = Date.now() - formLoadTime;
    if (timeSpent < 3000) {
      toast({
        title: "Please slow down",
        description: "Please take a moment to fill out the form completely.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required fields
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    // Name validation
    if (!isValidName(formData.name)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (letters, spaces, and hyphens only)",
        variant: "destructive",
      });
      return;
    }

    // Company validation
    if (!isValidCompany(formData.company)) {
      toast({
        title: "Invalid Company Name",
        description: "Please enter a valid company name",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Disposable email check
    if (isDisposableEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a business or personal email address",
        variant: "destructive",
      });
      return;
    }

    // Phone validation
    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with at least 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send form data including honeypot for server-side validation
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          _timestamp: formLoadTime, // Send load time for server-side validation
        },
      });

      if (error) throw error;
      
      // Check if server flagged as spam
      if (data?.spam) {
        toast({
          title: "Submission Failed",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      // Track successful form submission
      trackFormSubmission('contact_quote');
      trackConversion('quote_request');

      toast({
        title: "Success!",
        description: "Your request has been submitted. We'll be in touch soon!",
      });

      // Clear form
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        service: "",
        message: "",
        website: "",
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
        <SEO
        title="Contact Us - Get A Quote"
        description="Contact CRUMS Leasing for trailer leasing and rental quotes. Located in Bulverde, TX. Call (888) 570-4564. 24/7 emergency support available."
        canonical="https://crumsleasing.com/contact"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-secondary to-brand-orange-light text-secondary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-secondary-foreground/90">
            Ready to get started? Our team is here to help you find the perfect solution.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Get A Quote</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from humans, visible to bots */}
                  <div className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                    <Label htmlFor="website">Website (leave blank)</Label>
                    <Input 
                      id="website" 
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="John Smith" 
                      className="mt-2"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => handleFormFocus('name')}
                      required
                      disabled={isSubmitting}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input 
                      id="company" 
                      placeholder="Your Company LLC" 
                      className="mt-2"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@yourcompany.com"
                      className="mt-2"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="mt-2"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service Interest</Label>
                    <select
                      id="service"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.service}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select a service...</option>
                      <option value="Trailer Leasing">Trailer Leasing</option>
                      <option value="Trailer Rentals">Trailer Rentals</option>
                      <option value="Fleet Solutions">Fleet Solutions</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your needs..."
                      rows={4}
                      className="mt-2"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      maxLength={2000}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Get In Touch</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Have questions? Our team is ready to help. Reach out via phone, email, or fill out
                  the form and we'll get back to you within 24 hours.
                </p>
              </div>

              {/* Quick Links */}
              <Card className="border-2 bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Explore Our Services</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link to="/services/trailer-leasing" className="text-primary hover:underline">
                        53-foot dry van trailer leasing
                      </Link>
                    </li>
                    <li>
                      <Link to="/services/trailer-rentals" className="text-primary hover:underline">
                        Short-term trailer rentals
                      </Link>
                    </li>
                    <li>
                      <Link to="/services/fleet-solutions" className="text-primary hover:underline">
                        Fleet management solutions
                      </Link>
                    </li>
                    <li>
                      <Link to="/referral-program" className="text-secondary hover:underline">
                        Save $250 with our referral program
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                        <p className="text-muted-foreground">(888) 570-4564</p>
                      </div>
                    </div>


                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <MapPin className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Location</h3>
                        <p className="text-muted-foreground">
                          4070 FM1863
                          <br />
                          Bulverde, TX 78163
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Friday: 9:00 AM - 5:30 PM
                          <br />
                          Saturday: 9:00 AM - 12:00 PM
                          <br />
                          Sunday: Closed
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          24/7 Emergency Support Available
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                      <div className="flex space-x-4">
                        <a 
                          href="https://www.facebook.com/people/Crums-Leasing/100090574399864/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          aria-label="Visit our Facebook page"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://www.instagram.com/crumsleasingllc/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
                          aria-label="Visit our Instagram page"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://www.linkedin.com/company/crums-leasing/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="Visit our LinkedIn page"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://www.youtube.com/channel/UCvIeBeOpT0ql7n0XQcSmNVg" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          aria-label="Visit our YouTube channel"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">Existing Customer?</h3>
                  <p className="text-muted-foreground mb-4">
                    Log in to your customer portal to manage payments, view tolls, and access
                    support.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/login">Access Customer Portal</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Find Us</h2>
            <div className="rounded-lg overflow-hidden shadow-lg border-2 border-border">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.0358335621604!2d-98.41197869999999!3d29.7476761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865c8755d13488bf%3A0x32f8e2e89d9d005e!2sCRUMS%20Leasing!5e0!3m2!1sen!2sus!4v1763435194517!5m2!1sen!2sus" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="CRUMS Leasing Location"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
