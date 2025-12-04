import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Box, Shield, Truck, ArrowRight, Package, DoorOpen, Ruler } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const DryVanTrailers = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Dry Van Trailers", url: "https://crumsleasing.com/dry-van-trailers" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dry Van Trailer Leasing",
    "description": "53-foot and 48-foot dry van trailer leasing with swing doors, roll-up doors, and logistic posts. Flexible lease terms starting at 12 months.",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Dry Van Trailer Leasing"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A dry van trailer is an enclosed, non-temperature-controlled trailer used for transporting dry goods and general freight. It's the most common type of semi-trailer in the trucking industry, protecting cargo from weather and theft."
        }
      },
      {
        "@type": "Question",
        "name": "What sizes of dry van trailers does CRUMS offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers 53-foot and 48-foot dry van trailers. The 53-foot trailers are the industry standard for maximum cargo capacity, while 48-foot trailers are ideal for routes with length restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "What door options are available on dry van trailers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our dry van trailers come with either swing doors or roll-up doors. Swing doors provide easier access for loading and unloading, while roll-up doors are ideal for tight dock spaces."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers dry van trailer leases starting at a 12-month minimum term, with flexible options extending up to 8+ years for the lowest monthly payments."
        }
      },
      {
        "@type": "Question",
        "name": "What types of cargo can be hauled in a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dry van trailers are versatile and can haul a wide variety of non-perishable goods including consumer products, electronics, clothing, furniture, building materials, packaged foods, and industrial equipment."
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
        title="Dry Van Trailer Leasing | 53' & 48' Enclosed Trailers"
        description="Lease dry van trailers from CRUMS. 53-foot and 48-foot options with swing or roll-up doors, logistic posts, and flexible terms starting at 12 months. Get a quote today!"
        canonical="https://crumsleasing.com/dry-van-trailers"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Dry Van Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            The industry standard for enclosed freight. Protect your cargo with our premium 53' and 48' dry van trailers.
          </p>
          <Link to="/contact">
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
              The Most Versatile Trailer on the Road
            </h2>
            <p className="text-lg text-muted-foreground">
              Dry van trailers are the backbone of the American trucking industry, hauling everything from consumer goods 
              to industrial equipment. Our fleet of well-maintained dry vans provides the protection and reliability 
              your freight deserves.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Box className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Weather Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Fully enclosed design keeps cargo safe from rain, snow, and sun
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cargo Security</h3>
                <p className="text-sm text-muted-foreground">
                  Lockable doors protect high-value shipments during transit
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Maximum Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  53' trailers offer up to 3,500+ cubic feet of cargo space
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Versatile Hauling</h3>
                <p className="text-sm text-muted-foreground">
                  Ideal for general freight, retail goods, and palletized cargo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Specifications */}
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
                  <h3 className="text-2xl font-bold">53' Dry Van</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  The industry standard for maximum cargo capacity and efficiency on long-haul routes.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Length: 53 feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Width: 102 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Height: 110 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Cargo Capacity: 3,500+ cubic feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Payload Capacity: Up to 45,000 lbs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-secondary" />
                  <h3 className="text-2xl font-bold">48' Dry Van</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Perfect for routes with length restrictions or lighter freight loads.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Length: 48 feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Width: 102 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Height: 110 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Better maneuverability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Compliant with all state regulations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Door Options */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Door Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <DoorOpen className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Swing Doors</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>270-degree opening for easy access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Better seal against weather</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Ideal for live loading/unloading</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <DoorOpen className="h-8 w-8 text-secondary" />
                  <h3 className="text-xl font-bold">Roll-Up Doors</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Space-saving design</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Perfect for tight dock spaces</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Quick operation</span>
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
                <h3 className="text-lg font-bold mb-2">What is a dry van trailer?</h3>
                <p className="text-muted-foreground">
                  A dry van trailer is an enclosed, non-temperature-controlled trailer used for transporting dry goods 
                  and general freight. It's the most common type of semi-trailer in the trucking industry, protecting 
                  cargo from weather and theft.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What sizes of dry van trailers does CRUMS offer?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers 53-foot and 48-foot dry van trailers. The 53-foot trailers are the industry 
                  standard for maximum cargo capacity, while 48-foot trailers are ideal for routes with length restrictions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What door options are available?</h3>
                <p className="text-muted-foreground">
                  Our dry van trailers come with either swing doors or roll-up doors. Swing doors provide easier 
                  access for loading and unloading, while roll-up doors are ideal for tight dock spaces.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the minimum lease term?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers dry van trailer leases starting at a 12-month minimum term, with flexible 
                  options extending up to 8+ years for the lowest monthly payments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What types of cargo can be hauled?</h3>
                <p className="text-muted-foreground">
                  Dry van trailers are versatile and can haul a wide variety of non-perishable goods including 
                  consumer products, electronics, clothing, furniture, building materials, packaged foods, and 
                  industrial equipment.
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
              Need temperature-controlled transport? Check out our{" "}
              <Link to="/refrigerated-trailers" className="text-secondary hover:underline font-semibold">
                refrigerated trailer leasing
              </Link>{" "}
              options. For oversized or open cargo, explore our{" "}
              <Link to="/flatbed-trailers" className="text-secondary hover:underline font-semibold">
                flatbed trailer leasing
              </Link>{" "}
              solutions.
            </p>
            <p className="text-muted-foreground">
              Not sure which trailer is right for your operation? Read our{" "}
              <Link to="/guides/choosing-trailer" className="text-primary hover:underline font-medium">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Dry Van Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started with flexible lease terms and competitive rates on our premium dry van fleet.
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

export default DryVanTrailers;
