import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Warehouse,
  ShieldCheck,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  Package,
  HardHat,
  Leaf,
  CalendarDays,
  Truck,
} from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema, rentForStorageServiceSchema } from "@/lib/structuredData";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Secure & Weather-Protected",
    description:
      "53-foot enclosed dry van trailers keep your inventory, equipment, and materials safe from rain, wind, and theft—right on your property.",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    description:
      "Rent month-to-month or on a longer-term basis. Scale up during busy seasons and return the trailer when you're done—no long-term commitment required.",
  },
  {
    icon: DollarSign,
    title: "Fraction of Warehouse Cost",
    description:
      "Avoid expensive warehouse leases, build-outs, and utility bills. A storage trailer delivers thousands of cubic feet of space at a fraction of the price.",
  },
  {
    icon: Truck,
    title: "Delivered to Your Location",
    description:
      "We deliver the trailer directly to your job site, parking lot, or facility. When you're finished, we pick it up. No hauling on your end.",
  },
];

const useCases = [
  {
    icon: Package,
    title: "Retail & E-Commerce Overflow",
    description:
      "Manage seasonal inventory surges without committing to a larger warehouse. Perfect for holiday stock, clearance merchandise, or new product launches.",
  },
  {
    icon: HardHat,
    title: "Construction Job Sites",
    description:
      "Store tools, materials, and equipment on-site in a lockable, weather-tight trailer. Reduces theft risk and eliminates daily trips to off-site storage.",
  },
  {
    icon: Leaf,
    title: "Agriculture & Farming",
    description:
      "Keep harvested crops, feed, or equipment protected from the elements. Ideal for farms that need temporary covered storage between growing seasons.",
  },
  {
    icon: CalendarDays,
    title: "Events & Festivals",
    description:
      "Stage supplies, merchandise, or equipment near your venue. Easy to position, secure overnight, and return after the event wraps.",
  },
  {
    icon: Warehouse,
    title: "Business Renovations & Moves",
    description:
      "Temporarily store office furniture, inventory, or fixtures during a remodel or relocation without paying for a separate storage facility.",
  },
  {
    icon: DollarSign,
    title: "Disaster Recovery",
    description:
      "After a flood, fire, or storm, get a trailer on-site fast to protect salvageable inventory and equipment while repairs are underway.",
  },
];

const faqs = [
  {
    q: "What size trailers are available for storage rental?",
    a: "We offer 53-foot dry van trailers—the same enclosed trailers used for over-the-road freight. Each provides approximately 3,500 cubic feet of secure, weather-protected space.",
  },
  {
    q: "How much does it cost to rent a trailer for storage?",
    a: "Pricing depends on your location and rental duration. Contact us for a custom quote—rates are typically a fraction of traditional warehouse space.",
  },
  {
    q: "Do you deliver and pick up the trailer?",
    a: "Yes. We deliver the trailer to your location and pick it up when your rental ends. You just need a flat, accessible area where the trailer can be placed.",
  },
  {
    q: "Is there a minimum rental period?",
    a: "We offer flexible terms starting at one month. Longer commitments may qualify for lower monthly rates.",
  },
  {
    q: "Can I use the trailer for both storage and occasional transport?",
    a: "Our storage rentals are intended for stationary on-site use. If you also need a trailer for hauling, ask about our standard rental or leasing programs.",
  },
];

const RentForStorage = () => {
  useScrollDepthTracking("rent_for_storage");
  useTimeOnPageTracking("rent_for_storage");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Services", url: "https://crumsleasing.com/services" },
    { name: "Rent for Storage", url: "https://crumsleasing.com/services/rent-for-storage" },
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [rentForStorageServiceSchema, breadcrumbSchema],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Rent a Trailer for Storage – On-Site, Secure & Flexible"
        description="Need extra storage space? Rent a 53-foot dry van trailer from CRUMS Leasing. Delivered to your location, weather-protected, and available month-to-month. Get a quote."
        canonical="https://crumsleasing.com/services/rent-for-storage"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-6">
            <Warehouse className="h-4 w-4" />
            <span className="text-sm font-medium">Storage Trailer Rental</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure On-Site Storage, Delivered to You
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-primary-foreground/90 mb-8">
            A 53-foot dry van trailer gives you 3,500+ cubic feet of lockable, weather-protected
            space—right where you need it, for as long as you need it.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick("Get a Quote", "storage_hero", "/contact")}
            >
              Get a Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Why Rent a Trailer for Storage?
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Skip the warehouse lease. Get flexible, affordable covered storage delivered straight to your door.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((b) => (
              <Card key={b.title} className="border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg h-fit">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-muted-foreground">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Popular Use Cases
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Businesses across industries use trailer storage to solve space problems fast.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((uc) => (
              <Card key={uc.title} className="border-border">
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <uc.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground">{uc.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            No hidden fees. No long-term contracts required.
          </p>
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {[
                    "53-foot enclosed dry van trailer",
                    "Delivery to your location",
                    "Pickup when your rental ends",
                    "Lockable rear doors",
                    "Weather-tight construction",
                    "Month-to-month flexibility",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center text-center bg-muted/50 rounded-xl p-8">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Pricing starts at
                </p>
                <p className="text-4xl font-bold text-foreground mb-1">Custom Quote</p>
                <p className="text-muted-foreground text-sm mb-6">
                  Based on location &amp; rental duration
                </p>
                <Link to="/contact">
                  <Button
                    onClick={() => trackCtaClick("Request Pricing", "storage_pricing", "/contact")}
                  >
                    Request Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Extra Space? We'll Bring It to You.
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Tell us where and when you need a storage trailer. We'll handle delivery, and you only pay for the time you use it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => trackCtaClick("Get a Quote", "storage_cta", "/contact")}
              >
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RentForStorage;
