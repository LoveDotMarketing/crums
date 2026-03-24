import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, DollarSign, Shield, TrendingUp, Truck, Construction, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const FlatbedTrailerLeasing = () => {
  useTimeOnPageTracking('flatbed-trailer-leasing');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Flatbed Trailer Leasing", url: "https://crumsleasing.com/flatbed-trailer-leasing" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Flatbed Trailer Leasing",
    "description": "Lease flatbed trailers with flexible terms starting at 12 months. Heavy-duty construction, 48,000 lb capacity, and nationwide service.",
    "provider": { "@type": "Organization", "name": "CRUMS Leasing", "url": "https://crumsleasing.com" },
    "areaServed": { "@type": "Country", "name": "United States" },
    "serviceType": "Flatbed Trailer Leasing",
    "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "priceCurrency": "USD" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to lease a flatbed trailer?",
        "acceptedAnswer": { "@type": "Answer", "text": "Flatbed trailer lease rates depend on trailer length, condition, and lease term. CRUMS offers competitive monthly rates with terms starting at 12 months. Contact us for a personalized quote." }
      },
      {
        "@type": "Question",
        "name": "What can you haul on a flatbed trailer?",
        "acceptedAnswer": { "@type": "Answer", "text": "Flatbed trailers are ideal for construction materials (steel, lumber, pipes), heavy machinery, vehicles, oversized items, and any cargo that requires crane or forklift loading from the side or top." }
      },
      {
        "@type": "Question",
        "name": "What is the weight capacity of a flatbed trailer?",
        "acceptedAnswer": { "@type": "Answer", "text": "A standard 48-foot flatbed trailer can carry approximately 48,000 lbs of cargo, keeping the gross vehicle weight under the 80,000 lb federal limit." }
      },
      {
        "@type": "Question",
        "name": "Do I need special endorsements to haul flatbed?",
        "acceptedAnswer": { "@type": "Answer", "text": "You need a standard Class A CDL to operate a flatbed trailer. Oversize or overweight loads may require special permits depending on the state and load dimensions." }
      },
      {
        "@type": "Question",
        "name": "Is leasing a flatbed trailer better than buying?",
        "acceptedAnswer": { "@type": "Answer", "text": "Leasing preserves capital, provides predictable costs, and eliminates depreciation risk. It's ideal for operators who want to start hauling without a large down payment. Use our Lease vs Buy Calculator to compare." }
      }
    ]
  };

  const combinedSchema = { "@context": "https://schema.org", "@graph": [serviceSchema, breadcrumbSchema, faqSchema] };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Flatbed Trailer Leasing — Flexible Terms"
        description="Lease flatbed trailers from CRUMS. 48,000 lb capacity, flexible 12-month+ terms, affordable monthly rates. Nationwide service for owner operators & fleets."
        canonical="https://crumsleasing.com/flatbed-trailer-leasing"
        structuredData={combinedSchema}
      />
      <Navigation />

      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Flatbed Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Heavy-duty flatbed trailers for construction, manufacturing, and oversized loads. Flexible lease terms with affordable monthly rates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Get A Lease Quote', 'flatbed-trailer-leasing-hero', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Get A Lease Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/flatbed-trailers">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-white">
                View Specs & Dimensions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Available Flatbed Trailers */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Available Flatbed Trailers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Brand-new equipment ready for lease today</p>
          </div>
          <div className="max-w-lg mx-auto">
            <Link to="/2027-great-dane-flatbed-trailer-for-lease" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src="/images/trailers/2027-great-dane-flatbed-01.jpg"
                    alt="2027 Great Dane Flatbed trailer available for lease"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={600}
                    height={400}
                  />
                  <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">Available Now</span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">2027 Great Dane Flatbed</h3>
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium w-28">Unit</span>
                      <span className="text-foreground font-semibold">901015</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium w-28">Suspension</span>
                      <span className="text-foreground font-semibold">Air Ride</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium w-28">Capacity</span>
                      <span className="text-foreground font-semibold">~48,000 lbs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium w-28">Condition</span>
                      <span className="text-foreground font-semibold">Brand New</span>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    View Trailer Details <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Why Lease a Flatbed Trailer?</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Get the heavy-duty equipment you need without the heavy price tag. Start hauling oversized loads with predictable monthly payments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: DollarSign, title: "Low Upfront Cost", desc: "No $40K+ purchase price. Keep your capital for fuel and permits.", color: "text-primary" },
              { icon: TrendingUp, title: "Predictable Payments", desc: "Fixed monthly costs. Budget with confidence.", color: "text-secondary" },
              { icon: Shield, title: "No Depreciation Risk", desc: "The trailer depreciates — your balance sheet doesn't.", color: "text-primary" },
              { icon: Clock, title: "Flexible Terms", desc: "12-month minimum. Options up to 8+ years for lower rates.", color: "text-secondary" },
              { icon: Construction, title: "Heavy-Duty Equipment", desc: "Steel construction, multiple tie-down points, 48,000 lb capacity.", color: "text-primary" },
              { icon: Truck, title: "DOT-Inspected", desc: "Every trailer professionally inspected before release.", color: "text-secondary" }
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
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What's Included in Every Flatbed Lease</h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "48' or 53' flatbed trailer",
              "Steel main beams & heavy-duty suspension",
              "Multiple D-rings & rub rail tie-downs",
              "Headache rack / bulkhead",
              "Stake pockets throughout",
              "GPS tracking included",
              "DOT inspection before release",
              "24/7 support access"
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Flatbed Leasing FAQ</h2>
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
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Explore More Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Flatbed Specs & Dimensions</h3>
                <p className="text-sm text-muted-foreground mb-4">Deck height, weight capacity, and tie-down configurations.</p>
                <Link to="/flatbed-trailers" className="text-primary hover:underline font-medium text-sm">View Specs →</Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Lease vs Buy Calculator</h3>
                <p className="text-sm text-muted-foreground mb-4">Compare the true costs of leasing versus buying a trailer.</p>
                <Link to="/resources/tools/lease-vs-buy" className="text-secondary hover:underline font-medium text-sm">Calculate Now →</Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Dry Van Leasing</h3>
                <p className="text-sm text-muted-foreground mb-4">Need enclosed trailers? Explore our dry van leasing options.</p>
                <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-medium text-sm">Learn More →</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Flatbed Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started with flexible lease terms on heavy-duty flatbed equipment. No large down payment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Get A Quote', 'flatbed-trailer-leasing-cta', '/contact')}>
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

export default FlatbedTrailerLeasing;
