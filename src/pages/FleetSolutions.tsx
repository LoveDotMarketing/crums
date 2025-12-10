import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Users,
  BarChart,
  Headphones,
  Smartphone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const FleetSolutions = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Fleet Solutions", url: "https://crumsleasing.com/services/fleet-solutions" }
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Fleet Solutions - Comprehensive Fleet Management Services"
        description="Complete fleet management with 24/7 support, digital portal, GPS tracking, and maintenance coordination. Perfect for growing businesses with multiple trailers."
        canonical="https://crumsleasing.com/services/fleet-solutions"
        structuredData={breadcrumbSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-accent to-primary text-accent-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Comprehensive Fleet Solutions</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-8 text-accent-foreground/90">
            Complete fleet management services with nationwide support and advanced technology for
            growing businesses.
          </p>
          <Link to="/contact">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick('Discuss Your Fleet Needs', 'fleet_solutions', '/contact')}
            >
              Discuss Your Fleet Needs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* What We Offer */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Complete Fleet Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Fleet Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time insights into fleet performance, utilization, and costs to optimize your
                  operations.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Performance dashboards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cost analysis tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Utilization reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Digital Portal</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your entire fleet from one easy-to-use online platform, accessible 24/7.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Payment management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Toll tracking & payment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Document storage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Headphones className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">24/7 Support</h3>
                <p className="text-muted-foreground mb-4">
                  Dedicated account team and round-the-clock support to keep your fleet moving.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Account manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Emergency roadside assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Priority service</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Nationwide Coverage</h3>
                <p className="text-muted-foreground mb-4">
                  Access to equipment and service centers across all major markets in the US.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>25+ service locations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Coast-to-coast availability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Local market expertise</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Custom Solutions</h3>
                <p className="text-muted-foreground mb-4">
                  Tailored fleet programs designed around your unique business needs and goals.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Flexible terms & pricing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Mixed equipment types</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Scalable programs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Maintenance Support</h3>
                <p className="text-muted-foreground mb-4">
                  Proactive maintenance programs to minimize downtime and maximize equipment life.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Preventive maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Inspection coordination</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Repair network access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Ideal For Growing Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">50+</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Large Fleets</h3>
              <p className="text-muted-foreground">
                Enterprise-level support for major fleet operations
              </p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-secondary">10-50</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Mid-Size Fleets</h3>
              <p className="text-muted-foreground">
                Scalable solutions as your business grows
              </p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">Multi</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Multi-Company</h3>
              <p className="text-muted-foreground">
                Consolidated management across acquired companies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start with Individual Equipment */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Start with Individual Equipment
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Building your fleet? Start with{" "}
              <Link to="/services/trailer-leasing" className="text-primary hover:underline font-semibold">
                individual trailer leasing
              </Link>{" "}
              for long-term needs with predictable payments, or{" "}
              <Link to="/services/trailer-rentals" className="text-secondary hover:underline font-semibold">
                flexible trailer rentals
              </Link>{" "}
              for short-term projects and seasonal demands.
            </p>
            <p className="text-muted-foreground mb-6">
              Explore our equipment options:{" "}
              <Link to="/dry-van-trailers" className="text-secondary hover:underline font-medium">
                53-foot dry van trailers
              </Link>{" "}
              and{" "}
              <Link to="/flatbed-trailers" className="text-secondary hover:underline font-medium">
                flatbed trailers
              </Link>. Need help choosing? Read our{" "}
              <Link to="/resources/guides/choosing-trailer" className="text-secondary hover:underline font-medium">
                guide to selecting the right trailer
              </Link>.
            </p>
            <p className="text-muted-foreground">
              Learn more{" "}
              <Link to="/about" className="text-primary hover:underline font-medium">
                about CRUMS Leasing
              </Link>{" "}
              and our{" "}
              <Link to="/mission" className="text-primary hover:underline font-medium">
                mission and values
              </Link>{" "}
              that drive everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-accent to-primary text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Optimize Your Fleet?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-accent-foreground/90">
            Let's discuss how our fleet solutions can help you reduce costs, improve efficiency, and
            scale your operation.
          </p>
          <Link to="/contact">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => trackCtaClick('Schedule A Consultation', 'fleet_solutions', '/contact')}
            >
              Schedule A Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FleetSolutions;
