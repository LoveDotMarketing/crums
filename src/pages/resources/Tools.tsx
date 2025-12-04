import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight, Fuel, Scale, TrendingUp, Receipt, FileText, ArrowLeft } from "lucide-react";

const tools = [
  {
    icon: Calculator,
    title: "Cost Per Mile Calculator",
    description: "Calculate your true operating costs per mile including fuel, insurance, maintenance, lease payments, and more.",
    href: "/resources/cost-per-mile",
    features: ["Comprehensive expense tracking", "Visual cost breakdown", "Per-mile analysis"]
  },
  {
    icon: Scale,
    title: "Lease vs Buy Calculator",
    description: "Compare the total cost of leasing versus buying a trailer with multi-year projections.",
    href: "/resources/lease-vs-buy",
    features: ["Side-by-side comparison", "Resale value analysis", "Monthly payment breakdown"]
  },
  {
    icon: TrendingUp,
    title: "Profit Per Load Calculator",
    description: "Calculate the true profitability of each load by factoring in all expenses including deadhead miles.",
    href: "/resources/profit-calculator",
    features: ["Load profitability analysis", "Deadhead mile tracking", "Expense breakdown"]
  },
  {
    icon: Receipt,
    title: "IFTA Tax Estimator",
    description: "Estimate your fuel tax liability or credits by state for IFTA reporting.",
    href: "/resources/ifta-calculator",
    features: ["State-by-state tracking", "Tax rate database", "Credit/liability calculation"]
  },
  {
    icon: Fuel,
    title: "Fuel Cost Calculator",
    description: "Quickly estimate fuel costs for your next trip based on distance and fuel efficiency.",
    href: "/resources/fuel-calculator",
    features: ["Trip planning", "Cost estimation", "MPG-based calculations"]
  },
  {
    icon: FileText,
    title: "Tax Deduction Guide",
    description: "Comprehensive guide to tax deductions for carriers including per diem rates and depreciation rules.",
    href: "/resources/tax-deductions",
    features: ["Common deductions list", "Per diem rates", "Record-keeping tips"]
  }
];

const toolsCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Free Trucking Calculators & Tools",
  "description": "Free financial tools and calculators for carriers and owner-operators. Calculate cost per mile, compare lease vs buy, estimate IFTA taxes, and more.",
  "url": "https://crumsleasing.com/resources/tools",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": tools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": tool.title,
        "description": tool.description,
        "url": `https://crumsleasing.com${tool.href}`,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    }))
  }
};

const Tools = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Free Trucking Calculators & Financial Tools"
        description="Free calculators and tools for carriers and owner-operators. Cost per mile, lease vs buy, profit per load, IFTA tax estimator, and more. Plan your trucking business finances."
        canonical="https://crumsleasing.com/resources/tools"
        structuredData={toolsCollectionSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Financial Tools</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Free calculators and tools to help carriers manage costs and make informed business decisions.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Tools Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/resources" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ul className="space-y-2 mb-6 flex-grow">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link to={tool.href} className="flex items-center justify-center gap-2">
                      Open Tool
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
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
            Need More Resources?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore our full resource library including industry guides, safety tips, and business strategies.
          </p>
          <Button asChild variant="outline">
            <Link to="/resources">
              View All Resources
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tools;