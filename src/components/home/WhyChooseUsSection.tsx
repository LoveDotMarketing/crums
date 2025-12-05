import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Shield, Users, TrendingUp, ArrowRight } from "lucide-react";
import fleetImage from "@/assets/crums-trailer.png";

export const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-muted content-deferred">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose CRUMS Leasing?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not just a leasing company — we're your partner on the road to success.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative">
            <img
              src={fleetImage}
              alt="CRUMS Leasing professional trailer fleet"
              className="w-full rounded-lg shadow-xl"
              loading="lazy"
              decoding="async"
              width="600"
              height="400"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Quality Equipment</p>
                  <p className="text-muted-foreground text-sm">
                    Every trailer is thoroughly inspected and maintained to the highest standards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-6 flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Flexible Terms</p>
                  <p className="text-muted-foreground text-sm">
                    Leasing options starting at 12 months, designed to fit your business needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6 flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Family Values</p>
                  <p className="text-muted-foreground text-sm">
                    We treat every customer like family, with respect, integrity, and genuine care.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Nationwide Service</p>
                  <p className="text-muted-foreground text-sm">
                    Based in Texas, serving carriers across the entire United States.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="pt-4">
              <Link to="/about">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Learn More About CRUMS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
