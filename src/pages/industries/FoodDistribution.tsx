import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, CheckCircle, Thermometer, Shield, Clock, Leaf, ArrowRight } from "lucide-react";

const FoodDistribution = () => {
  const benefits = [
    { icon: Thermometer, title: "Temperature Control", description: "Refrigerated trailers for temperature-sensitive goods." },
    { icon: Shield, title: "Food Safety", description: "Clean, well-maintained trailers meeting food transport standards." },
    { icon: Clock, title: "Reliable Equipment", description: "Dependable trailers to keep your deliveries on schedule." },
    { icon: Leaf, title: "Fresh Delivery", description: "Ensure product freshness from farm to table." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Food Distribution Trailer Leasing | CRUMS Leasing"
        description="Trailer leasing for food distribution companies. CRUMS Leasing offers refrigerated and dry van trailers for safe, reliable food transport."
        canonical="https://crumsleasing.com/industries/food-distribution"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Food Distribution Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              From farm-fresh produce to packaged goods, CRUMS Leasing provides the trailer 
              solutions food distributors need to keep America fed safely and efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started">Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/refrigerated-trailers">View Reefer Options</Link>
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
                  "Refrigerated trailers for temperature-controlled transport",
                  "Dry van trailers for packaged and shelf-stable goods",
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

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Keep Your Supply Chain Moving</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Partner with CRUMS Leasing for reliable trailer solutions that support your food distribution operations.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/get-started">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodDistribution;
