import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Phone, CheckCircle, Truck, Shield, Clock } from "lucide-react";
import { trackFormSubmission, trackConversion, trackFacebookEvent } from "@/lib/analytics";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import crumsLogo from "@/assets/crums-leasing-logo-contact.jpg";

const thankYouLinks = [
  { to: "/dry-van-trailer-leasing", label: "Dry Van Trailer Leasing", description: "Flexible leasing plans with no credit check required" },
  { to: "/services/lease-to-own", label: "Lease-to-Own Program", description: "Build equity with every payment toward trailer ownership" },
  { to: "/commercial-dry-van-trailer-for-lease-56171", label: "View Available Trailer", description: "Browse our current inventory — Unit 56171 ready for pickup" },
  { to: "/resources/guides/owner-operator-basics", label: "Owner-Operator Basics", description: "Essential guide for independent truckers getting started" },
  { to: "/resources/tools/cost-per-mile", label: "Cost Per Mile Calculator", description: "Calculate your true operating costs per mile" },
  { to: "/why-choose-crums", label: "Why Choose CRUMS?", description: "See what sets us apart from other leasing companies" },
];

const FacebookThankYou = () => {
  const location = useLocation();
  const state = location.state as { name?: string; email?: string; company?: string } | null;
  const firstName = state?.name?.split(" ")[0] || "";

  useEffect(() => {
    trackFormSubmission("facebook_landing");
    trackConversion("quote_request");
    trackFacebookEvent('Lead');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEO
        title="Thank You | CRUMS Leasing"
        description="Your quote request has been received. Our team will contact you within 1 business day."
        noindex={true}
      />

      {/* Minimal header */}
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
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
                (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', 'phone_click', {
                  phone_number: '+18885704564',
                  page: window.location.pathname,
                });
              }
            }}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">(888) 570-4564</span>
            <span className="sm:hidden">Call Us</span>
          </a>
        </div>
      </header>

      <main className="min-h-[80vh] flex items-center justify-center bg-muted/30">
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {firstName ? `Thanks, ${firstName}!` : "Thank You!"}
          </h1>

          <p className="text-lg text-muted-foreground">
            Your quote request has been received. Our team will reach out within{" "}
            <strong className="text-foreground">1 business day</strong>.
          </p>

          <div className="bg-background rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">What Happens Next?</h2>
            <div className="space-y-3 text-left">
              {[
                { icon: Clock, text: "We review your request and prepare a custom quote" },
                { icon: Phone, text: "A leasing specialist will call or email you" },
                { icon: Truck, text: "Pick up your trailer or schedule delivery" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Need it sooner?</p>
            <a
              href="tel:+18885704564"
              className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
                  (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', 'phone_click', {
                    phone_number: '+18885704564',
                    page: window.location.pathname,
                  });
                }
              }}
            >
              <Phone className="h-5 w-5" />
              Call (888) 570-4564
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-muted-foreground">
            {[
              { icon: Shield, label: "No Credit Check" },
              { icon: Clock, label: "Flexible Terms" },
              { icon: Truck, label: "TX & Nationwide" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>
      <RelatedLinksSection
        title="While You Wait"
        subtitle="Explore resources to help you get started"
        links={thankYouLinks}
      />
    </>
  );
};

export default FacebookThankYou;
