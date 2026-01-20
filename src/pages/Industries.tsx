import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, User, Building2, UtensilsCrossed, ShoppingCart, Factory, Calendar, ArrowRight } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";

const industries = [
  {
    title: "Fleet Leasing",
    description: "Scalable trailer solutions for growing fleets of all sizes. From small operations to enterprise-level fleet management.",
    icon: Truck,
    href: "/industries/fleet-leasing",
    linkText: "Fleet leasing solutions"
  },
  {
    title: "Owner Operators",
    description: "Flexible leasing options designed for independent carriers. Build your business with reliable equipment.",
    icon: User,
    href: "/industries/owner-operators",
    linkText: "Owner operator programs"
  },
  {
    title: "Logistics Companies",
    description: "Comprehensive trailer solutions for 3PL providers and freight brokers seeking scalable capacity.",
    icon: Building2,
    href: "/industries/logistics-companies",
    linkText: "Logistics trailer solutions"
  },
  {
    title: "Food Distribution",
    description: "Dry van trailers for safe, compliant food transport operations.",
    icon: UtensilsCrossed,
    href: "/industries/food-distribution",
    linkText: "Food distribution trailers"
  },
  {
    title: "Retail Distribution",
    description: "Reliable trailer capacity for retail supply chains. Meet consumer demand with flexible equipment.",
    icon: ShoppingCart,
    href: "/industries/retail-distribution",
    linkText: "Retail distribution options"
  },
  {
    title: "Manufacturing",
    description: "Dedicated trailer solutions for manufacturing logistics and just-in-time delivery requirements.",
    icon: Factory,
    href: "/industries/manufacturing",
    linkText: "Manufacturing logistics"
  },
  {
    title: "Seasonal Demand",
    description: "Flexible short-term rentals for peak season capacity. Scale up when you need it most.",
    icon: Calendar,
    href: "/industries/seasonal-demand",
    linkText: "Seasonal rental programs"
  }
];

const industriesSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Industries We Serve - CRUMS Leasing",
  "description": "CRUMS Leasing provides specialized trailer leasing and rental solutions for fleet operators, owner operators, logistics companies, food distribution, retail, manufacturing, and seasonal demand.",
  "url": "https://crumsleasing.com/industries",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": industries.map((industry, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": industry.title,
      "description": industry.description,
      "url": `https://crumsleasing.com${industry.href}`
    }))
  }
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" }
]);

const Industries = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Industries We Serve | Trailer Leasing for Every Sector | CRUMS Leasing"
        description="CRUMS Leasing provides specialized trailer solutions for fleet operators, owner operators, logistics companies, food distribution, retail, manufacturing, and seasonal demand across the United States."
        canonical="https://crumsleasing.com/industries"
        structuredData={[industriesSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Industries We Serve
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              From independent owner operators to large fleet operations, CRUMS Leasing provides 
              tailored trailer solutions for every segment of the transportation industry.
            </p>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry) => (
                <Link key={industry.href} to={industry.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 group">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <industry.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{industry.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">{industry.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-primary font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        {industry.linkText}
                        <ArrowRight className="h-4 w-4" />
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
              onClick={() => trackCtaClick('Contact Us', 'industries-cta', '/contact')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Industries;
