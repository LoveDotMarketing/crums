import { useState, useEffect, lazy, Suspense } from "react";

const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackFormStart, trackPageView, trackEvent } from "@/lib/analytics";
import { getLeadSourceData } from "@/lib/leadSourceTracking";
import {
  Phone,
  Truck,
  Shield,
  Clock,
  Star,
  ChevronDown,
  MapPin,
} from "lucide-react";
import crumsLogo from "@/assets/crums-leasing-logo-contact.jpg";

const isGibberish = (text: string): boolean => {
  if (!text || text.length < 2) return false;
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  if (consonantPattern.test(text)) return true;
  const vowels = (text.match(/[aeiou]/gi) || []).length;
  const letters = (text.match(/[a-z]/gi) || []).length;
  if (letters > 5 && vowels / letters < 0.15) return true;
  return false;
};

const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const GoogleLanding = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [formLoadTime] = useState(Date.now());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    trackPageView("/lp/google", "Google Landing Page", "landing_page");
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    trailersNeeded: "",
    message: "",
    address2: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFormFocus = (fieldName: string) => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart("google_landing", fieldName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.address2) {
      toast({ title: "Success!", description: "We'll be in touch soon!" });
      return;
    }

    if (Date.now() - formLoadTime < 3000) {
      toast({
        title: "Please slow down",
        description: "Please take a moment to fill out the form.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isGibberish(formData.name) || isGibberish(formData.company)) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid information.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email.", variant: "destructive" });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const leadSourceData = getLeadSourceData();

      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          service: "trailer-leasing",
          message: formData.message
            ? `[Google Ad Lead] Trailers needed: ${formData.trailersNeeded || "Not specified"}. ${formData.message}`
            : `[Google Ad Lead] Trailers needed: ${formData.trailersNeeded || "Not specified"}`,
          ...leadSourceData,
          _timestamp: formLoadTime,
        },
      });

      if (error) throw error;

      if (data?.spam) {
        toast({ title: "Submission Failed", description: "Please try again later.", variant: "destructive" });
        return;
      }

      // Send confirmation email to the customer in background
      supabase.functions.invoke('send-contact-confirmation', {
        body: { name: formData.name, email: formData.email }
      }).catch(err => console.warn('[Contact Confirmation] Background call failed:', err));

      navigate("/lp/google/thank-you", {
        state: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
        },
      });
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please call us at (888) 570-4564.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "What types of trailers do you lease?",
      a: "We offer dry van, flatbed, and refrigerated trailers in various sizes. Our most popular option is the 53' dry van trailer.",
    },
    {
      q: "Do you require a credit check?",
      a: "No. We work with owner-operators and small fleets of all credit backgrounds. We focus on your business needs, not your credit score.",
    },
    {
      q: "What are your lease terms?",
      a: "We offer flexible month-to-month and long-term lease options starting at competitive rates. No long-term commitments required.",
    },
    {
      q: "Do you offer delivery?",
      a: "Yes! We offer pickup and delivery across Texas and surrounding states. Contact us for delivery availability in your area.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "CRUMS Trailer Leasing",
    provider: {
      "@type": "LocalBusiness",
      name: "CRUMS Leasing",
      telephone: "+1-888-570-4564",
      url: "https://crumsleasing.com",
    },
    description:
      "Affordable semi-trailer leasing for owner-operators and small fleets. No credit check required.",
    areaServed: { "@type": "Country", name: "US" },
  };

  return (
    <>
      <SEO
        title="Google Trailer Lease Quote | CRUMS Leasing"
        description="Request a CRUMS Leasing trailer lease quote from our Google ad page with flexible terms, no credit check, and quick follow-up for growing fleets."
        canonical="https://crumsleasing.com/lp/google"
        noindex={true}
        structuredData={structuredData}
      />

      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src={crumsLogo}
            alt="CRUMS Leasing"
            className="h-10 w-auto"
            width={160}
            height={40}
          />
          <a
            href="tel:+18885704564"
            onClick={() => {
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'phone_click', {
                  phone_number: '+18885704564',
                  page: window.location.pathname,
                });
              }
            }}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">(888) 570-4564</span>
            <span className="sm:hidden">Call Us</span>
          </a>
        </div>
      </header>

      <main>
        <section className="relative bg-[hsl(var(--brand-navy))] text-primary-foreground overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/images/crums-trailers-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                  <Truck className="h-4 w-4" />
                  Trusted by 100+ Owner-Operators
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  Lease a Semi-Trailer
                  <br />
                  <span className="text-secondary">Without the Hassle</span>
                </h1>
                <p className="text-lg text-primary-foreground/80 max-w-lg">
                  No credit check. No long-term commitment. Affordable rates for
                  owner-operators and small fleets ready to grow.
                </p>

                <div className="flex flex-wrap gap-6 pt-4">
                  {[
                    { icon: Shield, label: "No Credit Check" },
                    { icon: Clock, label: "Flexible Terms" },
                    { icon: MapPin, label: "TX & Nationwide" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                      <Icon className="h-4 w-4 text-secondary" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-background text-foreground shadow-2xl border-0">
                <CardContent className="p-6 md:p-8">
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">
                        Get Your Free Quote
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        No obligation. Response within 1 business day.
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="absolute -left-[9999px]" aria-hidden="true">
                        <input
                          type="text"
                          id="address2"
                          name="address2"
                          tabIndex={-1}
                          autoComplete="nope"
                          value={formData.address2}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="John Smith"
                            value={formData.name}
                            onChange={handleInputChange}
                            onFocus={() => handleFormFocus("name")}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="company">Company Name *</Label>
                          <Input
                            id="company"
                            placeholder="Your company"
                            value={formData.company}
                            onChange={handleInputChange}
                            onFocus={() => handleFormFocus("company")}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => handleFormFocus("email")}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 000-0000"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onFocus={() => handleFormFocus("phone")}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="trailersNeeded">How Many Trailers?</Label>
                        <select
                          id="trailersNeeded"
                          value={formData.trailersNeeded}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select...</option>
                          <option value="1">1 Trailer</option>
                          <option value="2-5">2–5 Trailers</option>
                          <option value="6-10">6–10 Trailers</option>
                          <option value="10+">10+ Trailers</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="message">
                          Anything else? <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                          id="message"
                          rows={3}
                          placeholder="Tell us about your needs..."
                          value={formData.message}
                          onChange={handleInputChange}
                          onFocus={() => handleFormFocus("message")}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Get My Free Quote"}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        No spam. No obligation. We respect your privacy.
                      </p>
                    </form>
                  </>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted border-b border-border py-6">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { value: "10+", label: "Years in Business" },
              { value: "4.8", label: "Google Rating", icon: Star },
              { value: "100+", label: "Active Leases" },
              { value: "24hr", label: "Response Time" },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-secondary fill-secondary" />}
                <span className="text-lg font-bold text-foreground">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
              Why Owner-Operators Choose CRUMS
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "No Credit Check",
                  desc: "We approve based on your business, not your credit score. Get on the road faster.",
                },
                {
                  icon: Clock,
                  title: "Flexible Lease Terms",
                  desc: "Month-to-month or long-term — you choose what works for your business. Cancel anytime.",
                },
                {
                  icon: Truck,
                  title: "Pickup & Delivery",
                  desc: "We deliver trailers to your location across Texas and surrounding states. Hassle-free.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border border-border text-center">
                  <CardContent className="p-6 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
              What Our Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    "CRUMS made leasing a trailer simple. No credit check headaches, fair pricing, and the team actually cares about your success.",
                  name: "Marcus T.",
                  role: "Owner-Operator, Houston TX",
                },
                {
                  quote:
                    "I was turned down by three other companies. CRUMS gave me a chance and delivered the trailer right to my door. Highly recommend.",
                  name: "David R.",
                  role: "Small Fleet Owner, San Antonio TX",
                },
              ].map(({ quote, name, role }) => (
                <Card key={name} className="border border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-secondary fill-secondary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Call us now or scroll up to fill out the form. We respond within 1
              business day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+18885704564"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-3 rounded-md text-lg transition-colors"
              >
                <Phone className="h-5 w-5" />
                (888) 570-4564
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-background/10 hover:bg-background/20 text-primary-foreground font-semibold px-8 py-3 rounded-md text-lg transition-colors border border-background/20"
              >
                Fill Out the Form
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[hsl(var(--brand-navy))] text-primary-foreground/60 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} CRUMS Leasing. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms
            </a>
            <a href="tel:+18885704564" className="hover:text-primary-foreground transition-colors">
              (888) 570-4564
            </a>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <ChatBot userType="public" />
      </Suspense>
    </>
  );
};

export default GoogleLanding;
