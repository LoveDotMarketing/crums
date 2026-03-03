import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Key,
  TrendingUp,
  DollarSign,
  Shield,
  CheckCircle,
  ArrowRight,
  Truck,
  FileText,
  Calendar,
} from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema, leaseToOwnServiceSchema } from "@/lib/structuredData";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const benefits = [
  {
    icon: TrendingUp,
    title: "Build Real Equity",
    description:
      "Every monthly payment moves you closer to full ownership. Unlike a standard lease, your money isn't just renting—it's investing in an asset you'll own outright.",
  },
  {
    icon: DollarSign,
    title: "Predictable Payments",
    description:
      "Lock in a fixed monthly rate for the life of your agreement. No balloon payments, no surprises—just a clear path to ownership with payments you can plan around.",
  },
  {
    icon: Shield,
    title: "No Large Down Payment",
    description:
      "Skip the massive upfront cost of buying a trailer. Get behind the wheel with a manageable deposit and start earning immediately while you pay toward ownership.",
  },
  {
    icon: Truck,
    title: "Late-Model Equipment",
    description:
      "Choose from well-maintained, road-ready 53' dry van trailers. Every unit passes a full DOT inspection before release so you can haul with confidence from day one.",
  },
];

const steps = [
  {
    step: 1,
    icon: FileText,
    title: "Apply Online",
    description:
      "Complete our simple application with your DOT information, insurance, and driver's license. Most applications are reviewed within 24 hours.",
  },
  {
    step: 2,
    icon: Calendar,
    title: "Choose Your Terms",
    description:
      "Work with our team to select a trailer and agree on a lease-to-own term and monthly payment that fits your budget.",
  },
  {
    step: 3,
    icon: DollarSign,
    title: "Make Monthly Payments",
    description:
      "Payments are automatically collected each billing cycle. Track your equity balance and projected payoff date in your customer portal.",
  },
  {
    step: 4,
    icon: Key,
    title: "Own Your Trailer",
    description:
      "Once your balance is paid in full, the title transfers to you. The trailer is yours—free and clear, no buyout fee.",
  },
];

const faqs = [
  {
    q: "What types of trailers are available for lease-to-own?",
    a: "We currently offer 53-foot dry van trailers through our lease-to-own program. All units are late-model, well-maintained, and DOT-inspected before release.",
  },
  {
    q: "How long does a lease-to-own agreement last?",
    a: "Terms are flexible and determined during the application process. We'll work with you to find a payment schedule that balances affordability with a realistic payoff timeline.",
  },
  {
    q: "Can I pay off early?",
    a: "Yes. There are no prepayment penalties. You can make extra payments or pay off your remaining balance at any time to take ownership sooner.",
  },
  {
    q: "What happens if I miss a payment?",
    a: "We understand that cash flow can fluctuate. Reach out to our team as soon as possible—we'll work with you to find a solution before any late fees or further action.",
  },
  {
    q: "Do I need a CDL and MC/DOT authority?",
    a: "Yes. Applicants must have a valid CDL and active motor carrier authority. We also require proof of insurance and a driver's license.",
  },
  {
    q: "How do I track my progress toward ownership?",
    a: "Once approved, you'll have access to your customer portal where you can view your remaining balance, payment history, projected payoff date, and DOT inspection status in real time.",
  },
];

const LeaseToOwn = () => {
  useScrollDepthTracking("lease_to_own");
  useTimeOnPageTracking("lease_to_own");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Services", url: "https://crumsleasing.com/services" },
    { name: "Lease to Own", url: "https://crumsleasing.com/services/lease-to-own" },
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [leaseToOwnServiceSchema, breadcrumbSchema],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Lease to Own a Trailer – Build Equity Every Month"
        description="Own your trailer through CRUMS Leasing's lease-to-own program. Fixed monthly payments, no balloon fees, and full ownership at payoff. Apply today."
        canonical="https://crumsleasing.com/services/lease-to-own"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-6">
            <Key className="h-4 w-4" />
            <span className="text-sm font-medium">Lease-to-Own Program</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Every Payment Brings You Closer to Ownership
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-primary-foreground/90 mb-8">
            Stop renting. Start building equity with every monthly payment toward a trailer you'll own outright—no balloon payments, no buyout fees.
          </p>
          <Link to="/get-started">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick("Apply Now", "lease_to_own_hero", "/get-started")}
            >
              Apply Now
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
            Why Lease to Own?
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            For owner-operators and small carriers who want to build assets instead of paying rent indefinitely.
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

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Four simple steps from application to full trailer ownership.
          </p>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Step {s.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Who Is This For?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Owner-operators ready to stop paying rent and start building equity",
              "Small fleet owners expanding without a large capital outlay",
              "New authorities who need reliable equipment on day one",
              "Experienced drivers transitioning from company driving to running their own truck",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
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
            Ready to Own Your Trailer?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Apply today and start building equity with your very first payment. No large down payment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => trackCtaClick("Get Started", "lease_to_own_cta", "/get-started")}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => trackCtaClick("Contact Us", "lease_to_own_cta", "/contact")}
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LeaseToOwn;
