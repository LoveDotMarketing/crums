import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, TrendingUp, Shield, Truck, Calculator, ArrowRight } from "lucide-react";

const Resources = () => {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Industry Guides",
      description: "Comprehensive guides covering trucking regulations, best practices, and industry standards.",
      items: ["FMCSA Compliance Guide", "Hours of Service Regulations", "ELD Requirements"],
      comingSoon: true
    },
    {
      icon: FileText,
      title: "Documentation & Forms",
      description: "Essential forms and documentation templates for carriers and owner-operators.",
      items: ["Bill of Lading Templates", "Inspection Checklists", "Maintenance Logs"],
      comingSoon: true
    },
    {
      icon: TrendingUp,
      title: "Business Tips",
      description: "Strategies and insights to help grow your trucking business and maximize profitability.",
      items: ["Fuel Cost Management", "Route Optimization", "Load Board Tips"],
      comingSoon: true
    },
    {
      icon: Shield,
      title: "Safety Resources",
      description: "Safety guidelines, training materials, and best practices for safe operations.",
      items: ["Pre-Trip Inspection Guide", "Weather Driving Tips", "Cargo Securement"],
      comingSoon: true
    },
    {
      icon: Truck,
      title: "Equipment Knowledge",
      description: "Learn about trailer types, maintenance schedules, and equipment specifications.",
      items: ["Trailer Types Explained", "Maintenance Schedules", "Tire Care Guide"],
      comingSoon: true
    },
    {
      icon: Calculator,
      title: "Financial Tools",
      description: "Calculators and tools to help you manage costs and plan your business finances.",
      items: [
        { name: "Cost Per Mile Calculator", href: "/resources/cost-per-mile", available: true },
        { name: "Lease vs Buy Analysis", available: false },
        { name: "Tax Deduction Guide", available: false }
      ],
      comingSoon: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Carrier Resources - Educational Guides for the Trucking Industry"
        description="Access free educational resources for carriers and the trucking industry. Guides on FMCSA compliance, safety, business tips, and equipment maintenance from CRUMS Leasing."
        canonical="https://crumsleasing.com/resources"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Carrier Resources</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Educational information and tools to help carriers succeed in the trucking industry.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Resources Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Knowledge Center
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of resources designed to help you run a more efficient, compliant, and profitable operation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => {
                      const isObject = typeof item === 'object';
                      const itemName = isObject ? item.name : item;
                      const itemHref = isObject && item.available ? item.href : null;
                      
                      return (
                        <li key={itemIndex} className="text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2" />
                          {itemHref ? (
                            <Link to={itemHref} className="text-primary hover:underline flex items-center gap-1">
                              {itemName}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">{itemName}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {category.comingSoon && (
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      Coming soon
                    </p>
                  )}
                  {!category.comingSoon && category.title === "Financial Tools" && (
                    <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                      <Link to="/resources/cost-per-mile">
                        <Calculator className="h-4 w-4 mr-2" />
                        Try Cost Per Mile Calculator
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Our team is here to help. Contact us for personalized guidance on leasing, compliance, or any trucking-related questions.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
