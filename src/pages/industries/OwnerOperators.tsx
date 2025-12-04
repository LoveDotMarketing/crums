import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, CheckCircle, DollarSign, Wrench, FileText, Heart, ArrowRight } from "lucide-react";

const OwnerOperators = () => {
  const benefits = [
    { icon: DollarSign, title: "Affordable Payments", description: "Competitive lease rates designed for independent carriers." },
    { icon: Wrench, title: "Maintenance Support", description: "Access to our network of trusted mechanics and service providers." },
    { icon: FileText, title: "Simple Contracts", description: "Straightforward lease agreements without hidden fees." },
    { icon: Heart, title: "People-First Approach", description: "We treat every owner operator like family." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Owner Operator Trailer Leasing | CRUMS Leasing"
        description="Flexible trailer leasing for independent owner operators. CRUMS Leasing offers affordable rates, simple contracts, and a people-first approach for independent carriers."
        canonical="https://crumsleasing.com/industries/owner-operators"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Owner Operator Solutions
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              At CRUMS Leasing, we believe every hardworking carrier deserves the freedom and 
              stability to build a better life. Our trailer leasing programs are designed with 
              owner operators in mind.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/trailer-leasing">View Lease Options</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Built for Owner Operators</h2>
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
              <h2 className="text-3xl font-bold mb-8">Why Owner Operators Choose CRUMS</h2>
              <ul className="space-y-4">
                {[
                  "No large down payment required to get started",
                  "Flexible 12-month minimum lease terms",
                  "Keep your capital for fuel, insurance, and other expenses",
                  "Quality 53-foot dry vans and flatbeds available",
                  "Earn $250 credit for each successful referral",
                  "Direct communication with our team - no call centers"
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
            <h2 className="text-3xl font-bold mb-4">Start Your Journey with CRUMS</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join the CRUMS family and get the trailer you need to succeed on the road.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/get-started">Apply Today</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default OwnerOperators;
