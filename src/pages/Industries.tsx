import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, User, Building2, UtensilsCrossed, ShoppingCart, Factory, Calendar } from "lucide-react";

const industries = [
  {
    title: "Fleet Leasing",
    description: "Scalable trailer solutions for growing fleets of all sizes.",
    icon: Truck,
    href: "/industries/fleet-leasing",
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Owner Operators",
    description: "Flexible leasing options designed for independent carriers.",
    icon: User,
    href: "/industries/owner-operators",
    color: "bg-secondary/10 text-secondary-foreground"
  },
  {
    title: "Logistics Companies",
    description: "Comprehensive trailer solutions for 3PL and freight brokers.",
    icon: Building2,
    href: "/industries/logistics-companies",
    color: "bg-accent/10 text-accent-foreground"
  },
  {
    title: "Food Distribution",
    description: "Temperature-controlled and dry van trailers for food transport.",
    icon: UtensilsCrossed,
    href: "/industries/food-distribution",
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Retail Distribution",
    description: "Reliable trailer capacity for retail supply chains.",
    icon: ShoppingCart,
    href: "/industries/retail-distribution",
    color: "bg-secondary/10 text-secondary-foreground"
  },
  {
    title: "Manufacturing",
    description: "Dedicated trailer solutions for manufacturing logistics.",
    icon: Factory,
    href: "/industries/manufacturing",
    color: "bg-accent/10 text-accent-foreground"
  },
  {
    title: "Seasonal Demand",
    description: "Flexible short-term rentals for peak season capacity.",
    icon: Calendar,
    href: "/industries/seasonal-demand",
    color: "bg-primary/10 text-primary"
  }
];

const Industries = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Industries We Serve | CRUMS Leasing"
        description="CRUMS Leasing provides trailer solutions for fleet operators, owner operators, logistics companies, food distribution, retail, manufacturing, and seasonal demand."
        canonical="https://crumsleasing.com/industries"
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Industries We Serve
              </h1>
              <p className="text-lg text-muted-foreground">
                From independent owner operators to large fleet operations, CRUMS Leasing provides 
                tailored trailer solutions for every segment of the transportation industry.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry) => (
                <Link key={industry.href} to={industry.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${industry.color} flex items-center justify-center mb-4`}>
                        <industry.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{industry.title}</CardTitle>
                      <CardDescription>{industry.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-primary font-medium text-sm">
                        Learn more →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See Your Industry?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              We work with carriers across all sectors. Contact us to discuss your specific trailer needs.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-background text-foreground font-semibold rounded-lg hover:bg-background/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Industries;
