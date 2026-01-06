import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Thermometer, Snowflake, Shield, ArrowRight, Gauge, Timer, Truck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const RefrigeratedTrailers = () => {
  useTimeOnPageTracking('refrigerated-trailers');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Services", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Refrigerated Trailers", url: "https://crumsleasing.com/refrigerated-trailers" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Refrigerated Trailer Leasing",
    "description": "Reefer trailer leasing with multi-temperature zones, premium insulation, and latest refrigeration units. Flexible lease terms starting at 12 months.",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Refrigerated Trailer Leasing"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a refrigerated trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A refrigerated trailer, also known as a reefer, is a temperature-controlled semi-trailer used to transport perishable goods like food, pharmaceuticals, and flowers. It maintains specific temperatures ranging from frozen (-20°F) to cool (65°F)."
        }
      },
      {
        "@type": "Question",
        "name": "What temperature range can refrigerated trailers maintain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS refrigerated trailers can maintain temperatures from -20°F for frozen goods up to 65°F for temperature-sensitive items. Multi-temperature zone units can maintain different temperatures in separate compartments."
        }
      },
      {
        "@type": "Question",
        "name": "What products are typically transported in reefer trailers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Refrigerated trailers transport perishable goods including fresh produce, frozen foods, dairy products, meat and poultry, seafood, pharmaceuticals, flowers, and other temperature-sensitive cargo."
        }
      },
      {
        "@type": "Question",
        "name": "How long can a reefer trailer maintain temperature?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With proper fuel supply, our refrigerated trailers can maintain temperature indefinitely during transit. Modern units are designed for continuous operation and feature fuel-efficient technology for extended runs."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a refrigerated trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers refrigerated trailer leases starting at a 12-month minimum term. Longer terms are available with more competitive monthly rates."
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
        title="Refrigerated Trailer Leasing | Reefer Trailers for Lease"
        description="Lease refrigerated reefer trailers from CRUMS. Multi-temperature zones, premium insulation, and latest refrigeration units. Flexible terms starting at 12 months."
        canonical="https://crumsleasing.com/refrigerated-trailers"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Refrigerated Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Temperature-controlled transport for your perishable cargo. Keep it cold, keep it fresh, keep it moving.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('Request A Quote', 'refrigerated-trailers-hero', '/contact')}>
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
              Premium Temperature Control for Perishable Freight
            </h2>
            <p className="text-lg text-muted-foreground">
              Our refrigerated trailers—also known as reefers—are equipped with the latest refrigeration technology 
              to ensure your temperature-sensitive cargo arrives in perfect condition. From frozen goods to fresh 
              produce, we have the equipment you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Precise Temperature</h3>
                <p className="text-sm text-muted-foreground">
                  Maintain exact temperatures from -20°F to 65°F
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Snowflake className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Multi-Zone Capable</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple temperature zones in one trailer
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Premium Insulation</h3>
                <p className="text-sm text-muted-foreground">
                  Superior insulation for maximum efficiency
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Timer className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Continuous Operation</h3>
                <p className="text-sm text-muted-foreground">
                  Reliable units for extended transit times
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Refrigeration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Snowflake className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Temperature Range</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Frozen: -20°F to 0°F</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Chilled: 28°F to 38°F</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Cool: 40°F to 65°F</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Precise digital controls</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Gauge className="h-8 w-8 text-secondary" />
                  <h3 className="text-xl font-bold">Technology</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Latest refrigeration units</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Fuel-efficient operation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Temperature monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Alarm systems</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold">Ideal For</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span>Fresh produce</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span>Frozen foods</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span>Dairy & meat products</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span>Pharmaceuticals</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is a refrigerated trailer?</h3>
                <p className="text-muted-foreground">
                  A refrigerated trailer, also known as a reefer, is a temperature-controlled semi-trailer used to 
                  transport perishable goods like food, pharmaceuticals, and flowers. It maintains specific temperatures 
                  ranging from frozen (-20°F) to cool (65°F).
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What temperature range can refrigerated trailers maintain?</h3>
                <p className="text-muted-foreground">
                  CRUMS refrigerated trailers can maintain temperatures from -20°F for frozen goods up to 65°F for 
                  temperature-sensitive items. Multi-temperature zone units can maintain different temperatures in 
                  separate compartments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What products are typically transported in reefer trailers?</h3>
                <p className="text-muted-foreground">
                  Refrigerated trailers transport perishable goods including fresh produce, frozen foods, dairy products, 
                  meat and poultry, seafood, pharmaceuticals, flowers, and other temperature-sensitive cargo.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How long can a reefer trailer maintain temperature?</h3>
                <p className="text-muted-foreground">
                  With proper fuel supply, our refrigerated trailers can maintain temperature indefinitely during transit. 
                  Modern units are designed for continuous operation and feature fuel-efficient technology for extended runs.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the minimum lease term?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers refrigerated trailer leases starting at a 12-month minimum term. Longer terms 
                  are available with more competitive monthly rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Decision Support */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            Make an Informed Decision
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use our free resources to determine if a reefer is right for your operation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Thermometer className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Trailer Specifications Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete dimensions and temperature specs for reefer trailers.
                </p>
                <Link to="/resources/guides/trailer-specifications" className="text-primary hover:underline font-medium text-sm">
                  View Specs →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Snowflake className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Lease vs Buy Calculator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compare costs of leasing versus purchasing a reefer trailer.
                </p>
                <Link to="/resources/tools/lease-vs-buy" className="text-secondary hover:underline font-medium text-sm">
                  Calculate Now →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Why Choose CRUMS</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See why carriers trust CRUMS for refrigerated trailer leasing.
                </p>
                <Link to="/why-choose-crums" className="text-primary hover:underline font-medium text-sm">
                  Learn More →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6 text-foreground">
            Explore Other Trailer Types
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Need non-temperature-controlled transport? Check out our{" "}
              <Link to="/dry-van-trailers" className="text-secondary hover:underline font-semibold">
                dry van trailer leasing
              </Link>{" "}
              for general freight. For oversized or open cargo, explore our{" "}
              <Link to="/flatbed-trailers" className="text-secondary hover:underline font-semibold">
                flatbed trailer leasing
              </Link>{" "}
              solutions.
            </p>
            <p className="text-sm text-muted-foreground">
              Not sure which trailer is right for your operation? Read our{" "}
              <Link to="/resources/guides/choosing-trailer" className="text-primary hover:underline font-medium">
                comprehensive guide to choosing the right trailer
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Refrigerated Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started with flexible lease terms on our temperature-controlled reefer fleet.
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

export default RefrigeratedTrailers;
