import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (error) throw error;

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

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Get A Quote</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="John Smith" 
                      className="mt-2"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
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

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <p className="text-muted-foreground">(800) 555-CRUMS</p>
                        <p className="text-sm text-muted-foreground">(800) 555-2786</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <Mail className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">info@crumsleasing.com</p>
                        <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
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
                          Monday - Friday: 7:00 AM - 7:00 PM ET
                          <br />
                          Saturday: 8:00 AM - 4:00 PM ET
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
