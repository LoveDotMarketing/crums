import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, CheckCircle, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";

const FleetLeasing = () => {
  const benefits = [
    { icon: TrendingUp, title: "Scalable Solutions", description: "Easily expand or reduce your fleet based on business demands." },
    { icon: Shield, title: "Maintained Equipment", description: "Well-maintained trailers that keep your operations running smoothly." },
    { icon: Clock, title: "Flexible Terms", description: "Lease terms from 12 months that adapt to your business cycle." },
    { icon: Truck, title: "Multiple Trailer Types", description: "Dry vans and flatbeds available to match your freight needs." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Fleet Leasing Solutions | CRUMS Leasing"
        description="Scalable trailer leasing solutions for growing fleets. CRUMS Leasing offers flexible terms, maintained equipment, and multiple trailer types for fleet operators."
        canonical="https://crumsleasing.com/industries/fleet-leasing"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Fleet Leasing Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Whether you're managing 5 trailers or 500, CRUMS Leasing provides the scalable 
              trailer solutions your fleet needs to grow and succeed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started">Get a Fleet Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Fleets Choose CRUMS</h2>
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
              <h2 className="text-3xl font-bold mb-8">Fleet Leasing Benefits</h2>
              <ul className="space-y-4">
                {[
                  "Preserve capital for core business operations",
                  "Predictable monthly expenses for easier budgeting",
                  "No depreciation risk on your balance sheet",
                  "Access to newer equipment without large upfront costs",
                  "Dedicated account management for fleet customers",
                  "Volume pricing available for larger fleets"
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
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Fleet?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Contact us today to discuss your fleet trailer needs and get a customized quote.
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

export default FleetLeasing;
