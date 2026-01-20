import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, TrendingUp, Shield, DollarSign, ArrowRight } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { trailerLeasingServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";
const dryVanTrailerImg = "/images/dry-van-trailer.webp";
const flatbedTrailerImg = "/images/flatbed-trailer.webp";
const trailerPickupImg = "/images/crums-leasing-trailer-pickup.webp";

const TrailerLeasing = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [trailerLeasingServiceSchema, breadcrumbSchema]
  };

  return <div className="min-h-screen flex flex-col">
      <SEO
        title="Trailer Leasing Solutions - 53-Foot Dry Van & Flatbed"
        description="Long-term trailer leasing starting at 12 months. 53-foot dry van and flatbed trailers with flexible terms, predictable payments, and modern equipment. Get a quote today!"
        canonical="https://crumsleasing.com/services/trailer-leasing"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trailer Leasing Solutions</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Long-term equipment solutions designed to optimize your fleet composition and maximize
            your return on investment.
          </p>
          <Link to="/contact">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick('Request A Quote', 'trailer_leasing', '/contact')}
            >
              Request A Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Why Choose Leasing - Image Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={trailerPickupImg} 
                alt="Customer picking up a CRUMS Leasing trailer at our yard with team assistance" 
                className="rounded-lg shadow-2xl"
                loading="lazy"
                width="800"
                height="533"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Why Choose Leasing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Leasing gives you the equipment you need without the burden of ownership. 
                Keep your capital working for you while we handle the maintenance, compliance, 
                and equipment lifecycle management.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Lower Upfront Costs</h3>
                    <p className="text-sm text-muted-foreground">
                      Preserve capital for other business needs
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Predictable Payments</h3>
                    <p className="text-sm text-muted-foreground">
                      Fixed monthly costs for better budgeting
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Flexible Terms</h3>
                    <p className="text-sm text-muted-foreground">
                      Lease lengths tailored to your needs
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Modern Equipment</h3>
                    <p className="text-sm text-muted-foreground">
                      Access to latest trailer technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Types */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Available Equipment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/dry-van-trailers" className="block hover:opacity-80 transition-opacity">
                  <img 
                    src={dryVanTrailerImg} 
                    alt="CRUMS Leasing 53-foot dry van trailer - enclosed cargo protection for general freight" 
                    className="w-full h-40 object-contain mb-4"
                    loading="lazy"
                    width="300"
                    height="160"
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Dry Van Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>53' and 48' options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Swing and roll-up doors</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Logistic posts available</span>
                  </li>
                </ul>
                <Link to="/dry-van-trailers" className="text-secondary hover:underline font-medium inline-flex items-center">
                  Learn more about dry van trailers
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/flatbed-trailers" className="block hover:opacity-80 transition-opacity">
                  <img 
                    src={flatbedTrailerImg} 
                    alt="CRUMS Leasing flatbed trailer - open-deck design for oversized and heavy cargo hauling" 
                    className="w-full h-40 object-contain mb-4"
                    loading="lazy"
                    width="300"
                    height="160"
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Flatbed Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Standard and step deck</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Heavy-duty construction</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple tie-down points</span>
                  </li>
                </ul>
                <Link to="/flatbed-trailers" className="text-secondary hover:underline font-medium inline-flex items-center">
                  Learn more about flatbed trailers
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lease Terms */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Flexible Lease Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">1-3 Years</div>
                <div className="text-lg font-semibold mb-2">Short Term</div>
                <p className="text-sm text-muted-foreground">Perfect for testing new markets</p>
              </div>
              <div className="text-center p-6 bg-secondary/10 rounded-lg border-2 border-secondary">
                <div className="text-4xl font-bold text-secondary mb-2">4-7 Years</div>
                <div className="text-lg font-semibold mb-2">Standard Term</div>
                <p className="text-sm text-muted-foreground">Most popular option</p>
              </div>
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">8+ Years</div>
                <div className="text-lg font-semibold mb-2">Long Term</div>
                <p className="text-sm text-muted-foreground">Lowest monthly payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Support */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            Make an Informed Decision
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use our free tools and guides to determine if leasing is right for your operation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Lease vs Buy Calculator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compare the true costs of leasing versus buying a trailer.
                </p>
                <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline font-medium text-sm">
                  Calculate Now →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Choosing the Right Trailer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to select the perfect trailer for your freight needs.
                </p>
                <Link to="/resources/guides/choosing-trailer" className="text-secondary hover:underline font-medium text-sm">
                  Read Guide →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Why Choose CRUMS</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See why carriers trust CRUMS for their trailer leasing needs.
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
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6 text-foreground">
            Explore More Services
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Need something different? Check out our{" "}
              <Link to="/services/trailer-rentals" className="text-secondary hover:underline font-semibold">
                short-term trailer rentals
              </Link>{" "}
              for flexible, commitment-free options, or explore our{" "}
              <Link to="/services/fleet-solutions" className="text-secondary hover:underline font-semibold">
                comprehensive fleet management solutions
              </Link>{" "}
              for businesses managing multiple trailers.
            </p>
            <p className="text-sm text-muted-foreground">
              We serve trucking professionals across the nation — view our{" "}
              <Link to="/locations" className="text-primary hover:underline font-medium">
                trailer leasing locations
              </Link>{" "}
              including{" "}
              <Link to="/locations/houston-tx" className="text-primary hover:underline">Houston</Link>,{" "}
              <Link to="/locations/dallas-tx" className="text-primary hover:underline">Dallas</Link>,{" "}
              <Link to="/locations/los-angeles-ca" className="text-primary hover:underline">Los Angeles</Link>, and{" "}
              <Link to="/locations/chicago-il" className="text-primary hover:underline">Chicago</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Let our team help you find the perfect leasing solution for your fleet.
          </p>
          <Link to="/contact">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick('Request A Quote Today', 'trailer_leasing', '/contact')}
            >
              Request A Quote Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};
export default TrailerLeasing;