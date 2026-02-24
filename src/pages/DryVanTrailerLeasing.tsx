import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, DollarSign, Shield, TrendingUp, Truck, Users, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const DryVanTrailerLeasing = () => {
  useTimeOnPageTracking('dry-van-trailer-leasing');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Dry Van Trailer Leasing", url: "https://crumsleasing.com/dry-van-trailer-leasing" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dry Van Trailer Leasing",
    "description": "Lease 53-foot and 48-foot dry van trailers with flexible terms starting at 12 months. No credit check, affordable rates, and nationwide pickup & delivery.",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "areaServed": { "@type": "Country", "name": "United States" },
    "serviceType": "Dry Van Trailer Leasing",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD",
      "description": "Monthly lease rates for 53' and 48' dry van trailers"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to lease a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dry van trailer lease rates vary based on trailer age, condition, and lease term length. CRUMS Leasing offers competitive monthly rates with flexible terms starting at 12 months. Contact us for a personalized quote."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need good credit to lease a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing works with owner operators and carriers of all credit backgrounds. We evaluate each application individually and focus on your ability to operate, not just your credit score."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our minimum dry van trailer lease term is 12 months. We also offer 2-3 year, 4-7 year, and 8+ year terms with lower monthly rates for longer commitments."
        }
      },
      {
        "@type": "Question",
        "name": "Can I lease a dry van trailer near me?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing serves owner operators and carriers nationwide. We offer trailer pickup at our San Antonio, TX yard and delivery to major cities including Houston, Dallas, Atlanta, Chicago, and more."
        }
      },
      {
        "@type": "Question",
        "name": "What's included in a dry van trailer lease?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every CRUMS dry van trailer lease includes a DOT-inspected trailer, GPS tracking, 24/7 support, and flexible payment options. Our trailers come with logistic posts, LED lighting, and your choice of swing or roll-up doors."
        }
      },
      {
        "@type": "Question",
        "name": "Is leasing a dry van trailer better than buying?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Leasing preserves your capital, provides predictable monthly payments, and eliminates depreciation risk. It's ideal for owner operators who want to start hauling quickly without a large down payment. Use our Lease vs Buy Calculator to compare costs."
        }
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [serviceSchema, breadcrumbSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Dry Van Trailer Leasing — Flexible Terms"
        description="Lease a 53' dry van trailer from CRUMS. Flexible 12-month+ terms, no credit check, affordable monthly rates. Nationwide pickup & delivery. Get a quote today."
        canonical="https://crumsleasing.com/dry-van-trailer-leasing"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Dry Van Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Affordable monthly rates on 53' and 48' dry van trailers. Flexible lease terms, no large down payment, and nationwide service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Get A Lease Quote', 'dry-van-trailer-leasing-hero', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Get A Lease Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dry-van-trailers">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                View Specs & Dimensions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Why Lease a Dry Van */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Why Lease a Dry Van Trailer?
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Leasing gives you access to quality equipment without tying up your capital. Start hauling loads faster with predictable monthly payments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <DollarSign className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">Lower Upfront Costs</h3>
                <p className="text-sm text-muted-foreground">
                  No massive down payment. Keep your cash for fuel, insurance, and permits.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2">Predictable Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Fixed monthly costs make budgeting simple. No surprise repair bills.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">No Depreciation Risk</h3>
                <p className="text-sm text-muted-foreground">
                  The trailer depreciates — your business doesn't. Focus on hauling, not assets.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Clock className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2">Flexible Terms</h3>
                <p className="text-sm text-muted-foreground">
                  12-month minimum with options up to 8+ years. Choose what fits your business.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Truck className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">DOT-Ready Equipment</h3>
                <p className="text-sm text-muted-foreground">
                  Every trailer is professionally inspected before release. LED lights, logistic posts, air ride.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2">People-First Service</h3>
                <p className="text-sm text-muted-foreground">
                  Family-owned company. We answer the phone. We know your name. We care about your success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lease vs Buy vs Rent Comparison */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Lease vs. Buy vs. Rent
          </h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">Lease</th>
                  <th className="p-4 text-center">Buy</th>
                  <th className="p-4 text-center">Rent</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Upfront Cost</td>
                  <td className="p-4 text-center text-primary font-semibold">Low</td>
                  <td className="p-4 text-center text-destructive">High ($30K-$60K+)</td>
                  <td className="p-4 text-center text-secondary">Moderate</td>
                </tr>
                <tr className="border-b border-border bg-muted/50">
                  <td className="p-4 font-medium">Monthly Cost</td>
                  <td className="p-4 text-center text-primary font-semibold">Predictable</td>
                  <td className="p-4 text-center">Loan payments + maintenance</td>
                  <td className="p-4 text-center text-destructive">Highest per month</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Commitment</td>
                  <td className="p-4 text-center">12 months+</td>
                  <td className="p-4 text-center">Permanent</td>
                  <td className="p-4 text-center text-primary">Short-term</td>
                </tr>
                <tr className="border-b border-border bg-muted/50">
                  <td className="p-4 font-medium">Depreciation Risk</td>
                  <td className="p-4 text-center text-primary font-semibold">None</td>
                  <td className="p-4 text-center text-destructive">Yes</td>
                  <td className="p-4 text-center text-primary">None</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Tax Deductible</td>
                  <td className="p-4 text-center text-primary font-semibold">100% payments</td>
                  <td className="p-4 text-center">Depreciation only</td>
                  <td className="p-4 text-center text-primary">100% payments</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Best For</td>
                  <td className="p-4 text-center font-semibold text-primary">Owner operators & growing fleets</td>
                  <td className="p-4 text-center">Established large fleets</td>
                  <td className="p-4 text-center">Seasonal or emergency needs</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline font-medium">
              Use our Lease vs Buy Calculator to compare your actual costs →
            </Link>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            What's Included in Every Dry Van Lease
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "DOT-inspected 53' or 48' trailer",
                "Swing doors or roll-up doors",
                "Air ride suspension",
                "Logistic posts for load securement",
                "LED lighting throughout",
                "GPS tracking included",
                "24/7 roadside support access",
                "Flexible payment schedules"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Dry Van Leasing FAQ
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqSchema.mainEntity.map((faq) => (
              <Card key={faq.name} className="border-2">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">{faq.name}</h3>
                  <p className="text-muted-foreground">{faq.acceptedAnswer.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links Hub */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Explore Dry Van Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-foreground mb-2">53' Dry Van Dimensions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interior length, width, height, cubic feet, and pallet capacity specs.
                </p>
                <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium text-sm">
                  View Dimensions →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-foreground mb-2">Why Lease a Dry Van?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deep dive into the business case for leasing over buying.
                </p>
                <Link to="/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision" className="text-secondary hover:underline font-medium text-sm">
                  Read Guide →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-foreground mb-2">Owner Operator Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Everything you need to know about starting as an owner operator.
                </p>
                <Link to="/resources/guides/owner-operator-basics" className="text-primary hover:underline font-medium text-sm">
                  Read Guide →
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="max-w-3xl mx-auto text-center mt-8">
            <p className="text-sm text-muted-foreground">
              We serve trucking professionals across the nation — view{" "}
              <Link to="/locations/atlanta-ga" className="text-primary hover:underline">Atlanta</Link>,{" "}
              <Link to="/locations/houston-tx" className="text-primary hover:underline">Houston</Link>,{" "}
              <Link to="/locations/dallas-tx" className="text-primary hover:underline">Dallas</Link>,{" "}
              <Link to="/locations/chicago-il" className="text-primary hover:underline">Chicago</Link>,{" "}
              and <Link to="/locations" className="text-primary hover:underline">all locations</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Dry Van Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started today with flexible lease terms and competitive monthly rates. No large down payment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Get A Quote', 'dry-van-trailer-leasing-cta', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Get A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/get-started">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DryVanTrailerLeasing;
