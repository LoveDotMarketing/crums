import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, CheckCircle, Package, Zap, TrendingUp, Store, ArrowRight } from "lucide-react";

const RetailDistribution = () => {
  const benefits = [
    { icon: Package, title: "High-Volume Capacity", description: "53-foot trailers for maximum retail freight capacity." },
    { icon: Zap, title: "Quick Turnaround", description: "Fast deployment to meet retail delivery windows." },
    { icon: TrendingUp, title: "Scalable Fleet", description: "Easily add capacity during peak retail seasons." },
    { icon: Store, title: "Store-Ready", description: "Reliable equipment for consistent store deliveries." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Retail Distribution Trailer Leasing | CRUMS Leasing"
        description="Trailer leasing solutions for retail distribution and e-commerce fulfillment. CRUMS Leasing offers scalable capacity for retail supply chains."
        canonical="https://crumsleasing.com/industries/retail-distribution"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Retail Distribution Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              From distribution centers to store shelves, CRUMS Leasing provides the trailer 
              capacity retail operations need to keep products moving and customers satisfied.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started">Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/dry-van-trailers">View Dry Vans</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Retail Logistics Support</h2>
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
              <h2 className="text-3xl font-bold mb-8">Supporting Retail Supply Chains</h2>
              <ul className="space-y-4">
                {[
                  "53-foot dry van trailers for high-volume retail freight",
                  "Flatbed trailers for oversized retail fixtures and displays",
                  "Flexible capacity for holiday and seasonal peaks",
                  "Reliable equipment for tight delivery windows",
                  "Quick deployment for new distribution contracts",
                  "Cost-effective leasing to optimize logistics budgets"
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
            <h2 className="text-3xl font-bold mb-4">Power Your Retail Logistics</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Contact us to discuss trailer solutions that keep your retail supply chain running smoothly.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default RetailDistribution;
