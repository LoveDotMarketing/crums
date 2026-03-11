import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield, Clock, Leaf, ArrowRight, Calculator, BookOpen, Box } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { foodDistributionServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" },
  { name: "Food Distribution", url: "https://crumsleasing.com/industries/food-distribution" }
]);

const FoodDistribution = () => {
  const benefits = [
    { icon: Box, title: "Dry Van Transport", description: "Enclosed trailers for packaged and shelf-stable food products." },
    { icon: Shield, title: "Food Safety", description: "Clean, well-maintained trailers meeting food transport standards." },
    { icon: Clock, title: "Reliable Equipment", description: "Dependable trailers to keep your deliveries on schedule." },
    { icon: Leaf, title: "Fresh Delivery", description: "Ensure product quality from warehouse to destination." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Food Distribution — 53' Dry Van Trailer Leasing"
        description="Trailer leasing for food distribution companies. CRUMS Leasing offers dry van trailers for safe, reliable food transport."
        canonical="https://crumsleasing.com/industries/food-distribution"
        structuredData={[foodDistributionServiceSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Food Distribution Solutions
            </h1>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            From packaged goods to shelf-stable products, CRUMS Leasing provides the trailer 
            solutions food distributors need to keep America fed safely and efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started" onClick={() => trackCtaClick('Get a Quote', 'industry_food_distribution', '/get-started')}>Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/dry-van-trailers">View Dry Van Options</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Food Transport Excellence</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold text-lg mb-2">{benefit.title}</p>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Trailer Options for Food Distribution</h2>
              <ul className="space-y-4">
                {[
                  "Dry van trailers for packaged and shelf-stable goods",
                  "Flatbed trailers for palletized shipments",
                  "Clean, sanitized trailers ready for food transport",
                  "Flexible lease terms to match distribution contracts",
                  "Quick turnaround for seasonal demand spikes",
                  "Reliable equipment to maintain delivery schedules"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Resources for Food Distribution */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Resources for Food Distributors</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Box className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Dry Van Trailers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enclosed transport for packaged food products.
                  </p>
                  <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium text-sm">
                    View Dry Vans →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Trailer Specifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete trailer dimensions and capacities.
                  </p>
                  <Link to="/resources/guides/trailer-specifications" className="text-secondary hover:underline font-medium text-sm">
                    View Specs →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Calculator className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Lease vs Buy Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare costs for your distribution fleet.
                  </p>
                  <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline font-medium text-sm">
                    Calculate Now →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Keep Your Supply Chain Moving</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Partner with CRUMS Leasing for reliable trailer solutions that support your food distribution operations.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/get-started" onClick={() => trackCtaClick('Get Started', 'industry_food_distribution', '/get-started')}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodDistribution;
