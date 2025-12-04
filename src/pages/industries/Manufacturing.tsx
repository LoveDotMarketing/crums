import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, CheckCircle, Cog, Shield, Clock, Layers } from "lucide-react";

const Manufacturing = () => {
  const benefits = [
    { icon: Cog, title: "Production Support", description: "Reliable trailers for just-in-time manufacturing logistics." },
    { icon: Shield, title: "Equipment Protection", description: "Secure transport for valuable manufacturing components." },
    { icon: Clock, title: "On-Time Delivery", description: "Dependable capacity to keep production lines running." },
    { icon: Layers, title: "Multiple Options", description: "Dry vans and flatbeds for diverse manufacturing needs." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Manufacturing Logistics Trailer Leasing | CRUMS Leasing"
        description="Trailer leasing for manufacturing companies. CRUMS Leasing offers dry van and flatbed trailers to support manufacturing logistics and supply chains."
        canonical="https://crumsleasing.com/industries/manufacturing"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Factory className="h-4 w-4" />
                Industrial & Manufacturing
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Manufacturing Logistics Solutions
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Keep your production lines running with reliable trailer solutions from CRUMS Leasing. 
                We support manufacturers with the equipment needed for efficient supply chain operations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">Get a Quote</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/flatbed-trailers">View Flatbeds</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Manufacturing Transport Solutions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
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
              <h2 className="text-3xl font-bold mb-8">Supporting Manufacturing Operations</h2>
              <ul className="space-y-4">
                {[
                  "Flatbed trailers for machinery, equipment, and raw materials",
                  "Dry van trailers for finished goods and components",
                  "Flexible capacity for production schedule changes",
                  "Reliable equipment for just-in-time delivery requirements",
                  "Long-term leasing for dedicated manufacturing routes",
                  "Quick deployment for new production contracts"
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
            <h2 className="text-3xl font-bold mb-4">Optimize Your Manufacturing Logistics</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Partner with CRUMS Leasing for trailer solutions that keep your manufacturing operations efficient.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Manufacturing;
