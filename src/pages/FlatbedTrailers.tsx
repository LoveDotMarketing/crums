import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Construction, Ruler, ArrowRight, Weight, Anchor, Truck, Wrench } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const FlatbedTrailers = () => {
  useTimeOnPageTracking('flatbed-trailers');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Services", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Flatbed Trailers", url: "https://crumsleasing.com/flatbed-trailers" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Flatbed Trailer Leasing",
    "description": "Flatbed and step deck trailer leasing with heavy-duty construction and multiple tie-down points. Flexible lease terms starting at 12 months.",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Flatbed Trailer Leasing"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a flatbed trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A flatbed trailer is an open platform trailer without sides or roof, designed for hauling oversized, heavy, or irregularly shaped cargo. They offer easy loading from any side and are essential for construction materials, machinery, and equipment transport."
        }
      },
      {
        "@type": "Question",
        "name": "How much weight can a 48 ft flatbed carry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot flatbed trailer can carry approximately 48,000 lbs of cargo. This assumes a standard tractor weight, keeping the gross vehicle weight under the 80,000 lb federal limit. Actual capacity varies based on trailer weight and axle configuration."
        }
      },
      {
        "@type": "Question",
        "name": "What is the deck height of a flatbed trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A standard flatbed trailer has a deck height of approximately 60 inches (5 feet) from the ground. Step deck trailers have a lower rear section at about 42 inches, providing an extra 12-18 inches of height clearance for taller cargo."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a flatbed and step deck trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A standard flatbed has a uniform deck height, while a step deck (or drop deck) has a lower rear section. Step decks can haul taller cargo while staying within height limits, making them ideal for equipment that exceeds standard flatbed height restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "What types of cargo are best suited for flatbed trailers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Flatbed trailers are ideal for construction materials (steel, lumber, pipes), heavy machinery and equipment, vehicles, oversized items, and any cargo that won't fit in enclosed trailers or requires crane loading."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a flatbed trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers flatbed trailer leases starting at a 12-month minimum term, with flexible options for longer commitments at reduced monthly rates."
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
        title="Flatbed Trailer Leasing | 48' & 53' Deck Height & Weight Capacity"
        description="Lease flatbed and step deck trailers from CRUMS. 48,000 lb capacity, 60 inch deck height, multiple tie-down points. Flexible terms starting at 12 months."
        canonical="https://crumsleasing.com/flatbed-trailers"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Flatbed Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Heavy-duty hauling for oversized and open cargo. Load from any angle with our versatile flatbed fleet.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('Request A Quote', 'flatbed-trailers-hero', '/contact')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Request A Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              The Workhorse for Heavy & Oversized Loads
            </h2>
            <p className="text-lg text-muted-foreground">
              Flatbed trailers are the go-to choice for hauling construction materials, heavy equipment, and 
              oversized cargo. With no walls or roof to limit access, you can load from any direction using 
              forklifts, cranes, or overhead equipment. For complete deck heights and weight capacities, see our{" "}
              <Link to="/resources/guides/trailer-specifications" className="text-primary hover:underline font-medium">
                trailer specifications guide
              </Link>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Construction className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Heavy-Duty Build</h3>
                <p className="text-sm text-muted-foreground">
                  Steel construction designed for demanding loads
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Anchor className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Tie-Downs</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple anchor points for safe cargo securement
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Weight className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">High Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  Up to 48,000 lbs payload capacity
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Easy Loading</h3>
                <p className="text-sm text-muted-foreground">
                  Load from any side with forklifts or cranes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trailer Types */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Available Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-primary" />
                  <h3 className="text-2xl font-bold">Standard Flatbed</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  The classic workhorse for general flatbed hauling with a uniform deck height.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Deck Length: 48' or 53'</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Deck Width: 102 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Deck Height: ~60 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Payload: Up to 48,000 lbs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Ideal for: Lumber, steel, pipes, machinery</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-secondary" />
                  <h3 className="text-2xl font-bold">Step Deck (Drop Deck)</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Lower deck section allows for taller cargo while staying within height limits.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Upper Deck: ~11 feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Lower Deck: ~37 feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Lower Deck Height: ~42 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Extra height clearance: ~12 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Ideal for: Tall equipment, vehicles, machinery</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Standard Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Anchor className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Tie-Down System</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple D-rings throughout</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Rub rail tie-down points</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Chain hooks at deck edges</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Construction className="h-8 w-8 text-secondary" />
                  <h3 className="text-xl font-bold">Construction</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Steel main beams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Hardwood or aluminum deck</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Heavy-duty suspension</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold">Accessories</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Headache rack/bulkhead</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Stake pockets</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Winch tracks available</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is a flatbed trailer?</h3>
                <p className="text-muted-foreground">
                  A flatbed trailer is an open platform trailer without sides or roof, designed for hauling 
                  oversized, heavy, or irregularly shaped cargo. They offer easy loading from any side and 
                  are essential for construction materials, machinery, and equipment transport.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How much weight can a 48 ft flatbed carry?</h3>
                <p className="text-muted-foreground">
                  A 48-foot flatbed trailer can carry approximately 48,000 lbs of cargo. This assumes a standard 
                  tractor weight, keeping the gross vehicle weight under the 80,000 lb federal limit. Actual 
                  capacity varies based on trailer weight and axle configuration.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the deck height of a flatbed trailer?</h3>
                <p className="text-muted-foreground">
                  A standard flatbed trailer has a deck height of approximately 60 inches (5 feet) from the ground. 
                  Step deck trailers have a lower rear section at about 42 inches, providing an extra 12-18 inches 
                  of height clearance for taller cargo.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the difference between a flatbed and step deck trailer?</h3>
                <p className="text-muted-foreground">
                  A standard flatbed has a uniform deck height, while a step deck (or drop deck) has a lower rear 
                  section. Step decks can haul taller cargo while staying within height limits, making them ideal 
                  for equipment that exceeds standard flatbed height restrictions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What types of cargo are best suited for flatbed trailers?</h3>
                <p className="text-muted-foreground">
                  Flatbed trailers are ideal for construction materials (steel, lumber, pipes), heavy machinery 
                  and equipment, vehicles, oversized items, and any cargo that won't fit in enclosed trailers 
                  or requires crane loading.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the minimum lease term?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers flatbed trailer leases starting at a 12-month minimum term, with 
                  flexible options for longer commitments at reduced monthly rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Explore Other Trailer Types
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Need enclosed transport? Check out our{" "}
              <Link to="/dry-van-trailers" className="text-secondary hover:underline font-semibold">
                dry van trailer leasing
              </Link>{" "}
              for general freight. For temperature-controlled cargo, explore our{" "}
              <Link to="/refrigerated-trailers" className="text-secondary hover:underline font-semibold">
                refrigerated trailer leasing
              </Link>{" "}
              options.
            </p>
            <p className="text-muted-foreground">
              Not sure which trailer is right for your operation? Read our{" "}
              <Link to="/resources/guides/choosing-trailer" className="text-primary hover:underline font-medium">
                comprehensive guide to choosing the right trailer for your haul
              </Link>{" "}
              or{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact our team
              </Link>{" "}
              for personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Flatbed Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started with flexible lease terms on our heavy-duty flatbed and step deck fleet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Request A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90">
              <Link to="/services/trailer-leasing">View All Leasing Options</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FlatbedTrailers;
