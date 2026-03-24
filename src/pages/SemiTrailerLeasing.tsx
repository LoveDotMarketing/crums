import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, DollarSign, Shield, Users, Truck, TrendingUp, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const SemiTrailerLeasing = () => {
  useTimeOnPageTracking('semi-trailer-leasing');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Semi Trailer Leasing", url: "https://crumsleasing.com/semi-trailer-leasing" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Semi Trailer Leasing",
    "description": "Commercial semi trailer leasing for owner operators, carriers, and fleets. Dry van and flatbed trailers with flexible terms starting at 12 months.",
    "provider": { "@type": "Organization", "name": "CRUMS Leasing", "url": "https://crumsleasing.com" },
    "areaServed": { "@type": "Country", "name": "United States" },
    "serviceType": "Commercial Trailer Leasing",
    "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "priceCurrency": "USD" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of semi trailers can I lease from CRUMS?",
        "acceptedAnswer": { "@type": "Answer", "text": "CRUMS Leasing offers 53-foot and 48-foot dry van trailers as well as flatbed trailers. Dry vans are available with swing doors or roll-up doors, logistic posts, and air ride suspension." }
      },
      {
        "@type": "Question",
        "name": "How does commercial trailer leasing work?",
        "acceptedAnswer": { "@type": "Answer", "text": "You choose a trailer type, select a lease term (12 months minimum), and make predictable monthly payments. CRUMS handles the DOT inspection before release. You focus on hauling — we handle the equipment." }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a semi trailer?",
        "acceptedAnswer": { "@type": "Answer", "text": "Our minimum lease term is 12 months. We offer terms up to 8+ years with lower monthly rates for longer commitments." }
      },
      {
        "@type": "Question",
        "name": "Do you offer trailer leasing for owner operators?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! CRUMS Leasing specializes in serving owner operators. We offer flexible terms, work with all credit backgrounds, and provide a people-first leasing experience." }
      },
      {
        "@type": "Question",
        "name": "Where can I pick up a leased trailer?",
        "acceptedAnswer": { "@type": "Answer", "text": "Our main yard is in San Antonio, Texas. We also offer trailer delivery to major cities nationwide including Houston, Dallas, Atlanta, Chicago, Los Angeles, and more." }
      },
      {
        "@type": "Question",
        "name": "What makes CRUMS different from other trailer leasing companies?",
        "acceptedAnswer": { "@type": "Answer", "text": "CRUMS is family-owned and operated. We provide personal service, flexible terms, transparent pricing, and DOT-inspected equipment. We treat every customer like family — not just an account number." }
      }
    ]
  };

  const combinedSchema = { "@context": "https://schema.org", "@graph": [serviceSchema, breadcrumbSchema, faqSchema] };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Semi Trailer Leasing — Commercial Trailers"
        description="Lease commercial semi trailers from CRUMS. Dry van & flatbed trailers, flexible 12-month+ terms, affordable rates. Serving owner operators & fleets nationwide."
        canonical="https://crumsleasing.com/semi-trailer-leasing"
        structuredData={combinedSchema}
      />
      <Navigation />

      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Semi Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Commercial dry van and flatbed trailer leasing for owner operators, carriers, and growing fleets. Flexible terms. Affordable rates. Family-owned service.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('Get A Lease Quote', 'semi-trailer-leasing-hero', '/contact')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Get A Lease Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/dry-van-trailers">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-white">
              View Specs & Dimensions
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Trailer Types */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Available Semi Trailers for Lease</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Choose the right trailer type for your operation. Both options include DOT inspection, GPS tracking, and 24/7 support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Dry Van Trailers</h3>
                <p className="text-muted-foreground mb-6">
                  Enclosed 53' and 48' trailers for general freight. The most versatile option for most hauling needs.
                </p>
                <ul className="space-y-3 mb-6">
                  {["53' and 48' lengths", "3,489+ cubic feet capacity", "Swing or roll-up doors", "Air ride suspension", "Logistic posts included"].map((item) => (
                    <li key={item} className="flex items-start text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-semibold inline-flex items-center">
                  Lease a dry van trailer <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Flatbed Trailers</h3>
                <p className="text-muted-foreground mb-6">
                  Open-deck trailers for oversized, heavy, and irregularly shaped cargo. Load from any angle.
                </p>
                <ul className="space-y-3 mb-6">
                  {["48' deck length", "48,000 lb payload capacity", "Steel main beams", "Multiple tie-down points", "Headache rack included"].map((item) => (
                    <li key={item} className="flex items-start text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/flatbed-trailer-leasing" className="text-secondary hover:underline font-semibold inline-flex items-center">
                  Lease a flatbed trailer <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why CRUMS */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose CRUMS for Trailer Leasing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, title: "Family-Owned", desc: "We're not a corporation. We know your name and we care about your success.", color: "text-primary" },
              { icon: DollarSign, title: "Affordable Rates", desc: "Competitive monthly pricing. No hidden fees. Transparent contracts.", color: "text-secondary" },
              { icon: Shield, title: "All Credit Welcome", desc: "We work with owner operators of all credit backgrounds.", color: "text-primary" },
              { icon: Truck, title: "DOT-Ready Equipment", desc: "Every trailer inspected and road-ready before you pick it up.", color: "text-secondary" },
              { icon: TrendingUp, title: "Grow With Us", desc: "Start with one trailer. Scale to a fleet. We grow with you.", color: "text-primary" },
              { icon: Clock, title: "Fast Turnaround", desc: "Apply today, get approved quickly, and start hauling.", color: "text-secondary" }
            ].map(({ icon: Icon, title, desc, color }) => (
           <Card key={title} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Icon className={`h-10 w-10 ${color} mb-4`} />
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              See what DOT-ready equipment looks like — <Link to="/commercial-dry-van-trailer-for-lease-56171" className="text-primary hover:underline font-medium">view a trailer profile for Unit 56171</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Semi Trailer Leasing FAQ</h2>
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

      {/* Internal Links */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">For Owner Operators</h3>
                <p className="text-sm text-muted-foreground mb-4">Flexible leasing designed for independent operators.</p>
                <Link to="/industries/owner-operators" className="text-primary hover:underline font-medium text-sm">Learn More →</Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Fleet Leasing</h3>
                <p className="text-sm text-muted-foreground mb-4">Scale your fleet with multi-trailer leasing solutions.</p>
                <Link to="/industries/fleet-leasing" className="text-secondary hover:underline font-medium text-sm">Learn More →</Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Why Choose CRUMS</h3>
                <p className="text-sm text-muted-foreground mb-4">See why carriers trust CRUMS over the big leasing companies.</p>
                <Link to="/why-choose-crums" className="text-primary hover:underline font-medium text-sm">Compare →</Link>
              </CardContent>
            </Card>
          </div>
          <div className="max-w-3xl mx-auto text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Serving trucking professionals in{" "}
              <Link to="/locations/san-antonio-tx" className="text-primary hover:underline">San Antonio</Link>,{" "}
              <Link to="/locations/houston-tx" className="text-primary hover:underline">Houston</Link>,{" "}
              <Link to="/locations/dallas-tx" className="text-primary hover:underline">Dallas</Link>,{" "}
              <Link to="/locations/atlanta-ga" className="text-primary hover:underline">Atlanta</Link>,{" "}
              <Link to="/locations/chicago-il" className="text-primary hover:underline">Chicago</Link>,{" "}
              <Link to="/locations/columbus-oh" className="text-primary hover:underline">Columbus</Link>,{" "}
              and <Link to="/locations" className="text-primary hover:underline">16+ more cities</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Semi Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started today. Flexible terms, competitive rates, and a team that treats you like family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Get A Quote', 'semi-trailer-leasing-cta', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">Get A Quote <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
            <Link to="/get-started">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90">Apply Now</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SemiTrailerLeasing;
