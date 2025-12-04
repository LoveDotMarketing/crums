import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, TrendingUp, Clock, DollarSign, Repeat, ArrowRight } from "lucide-react";

const SeasonalDemand = () => {
  const benefits = [
    { icon: TrendingUp, title: "Peak Capacity", description: "Scale up quickly for holiday and seasonal rushes." },
    { icon: Clock, title: "Short-Term Rentals", description: "Flexible rental periods without long-term commitments." },
    { icon: DollarSign, title: "Cost Effective", description: "Pay only for the capacity you need, when you need it." },
    { icon: Repeat, title: "Recurring Support", description: "Build a relationship for predictable seasonal needs." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Seasonal Trailer Rentals | CRUMS Leasing"
        description="Short-term trailer rentals for seasonal demand spikes. CRUMS Leasing offers flexible capacity solutions for holiday seasons, harvest, and peak shipping periods."
        canonical="https://crumsleasing.com/industries/seasonal-demand"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Seasonal Demand Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Don't let peak season catch you short on capacity. CRUMS Leasing provides flexible 
              short-term trailer rentals to help you handle seasonal demand spikes efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started">Reserve Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/trailer-rentals">View Rental Options</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Flexible Seasonal Capacity</h2>
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
              <h2 className="text-3xl font-bold mb-8">Common Seasonal Needs</h2>
              <ul className="space-y-4">
                {[
                  "Holiday retail surge (Q4 peak shipping season)",
                  "Agricultural harvest and produce transport",
                  "Back-to-school retail distribution",
                  "Construction season equipment transport",
                  "Event and festival logistics",
                  "Year-end inventory movements"
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

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">How Seasonal Rentals Work</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-lg">Plan Ahead</h3>
                    <p className="text-muted-foreground">Contact us in advance of your peak season to discuss capacity needs and reserve trailers.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-lg">Quick Deployment</h3>
                    <p className="text-muted-foreground">We prepare trailers and deliver them when you need them, ready to roll.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-lg">Flexible Returns</h3>
                    <p className="text-muted-foreground">Return trailers when your peak season ends - no long-term commitment required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for Peak Season?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Don't wait until the last minute. Contact us now to plan your seasonal trailer capacity.
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

export default SeasonalDemand;
