import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, AlertTriangle, Calculator } from "lucide-react";
import { tools as sharedTools, getToolHref } from "@/lib/tools";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

// Map shared tools to the format needed for this page with features
const toolFeatures: Record<string, string[]> = {
  "cost-per-mile": ["Comprehensive expense tracking", "Visual cost breakdown", "Per-mile analysis"],
  "lease-vs-buy": ["Side-by-side comparison", "Resale value analysis", "Monthly payment breakdown"],
  "profit-calculator": ["Load profitability analysis", "Deadhead mile tracking", "Expense breakdown"],
  "per-diem-calculator": ["2024 IRS rates", "Full & partial day rates", "Tax savings estimate"],
  "ifta-calculator": ["State-by-state tracking", "Tax rate database", "Credit/liability calculation"],
  "fuel-calculator": ["Trip planning", "Cost estimation", "MPG-based calculations"],
  "tax-deductions": ["Common deductions list", "Per diem rates", "Record-keeping tips"]
};

const tools = sharedTools
  .filter(t => t.available)
  .map(tool => ({
    icon: tool.icon,
    title: tool.title,
    description: tool.description,
    href: getToolHref(tool.slug),
    features: toolFeatures[tool.slug] || []
  }));

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

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Tools", url: "https://crumsleasing.com/resources/tools" },
]);

const Tools = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Free Trucking Calculators & Financial Tools"
        description="Free calculators and tools for carriers and owner-operators. Cost per mile, lease vs buy, profit per load, IFTA tax estimator, and more. Plan your trucking business finances."
        canonical="https://crumsleasing.com/resources/tools"
        structuredData={[toolsCollectionSchema, breadcrumbSchema]}
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

      {/* Legal Disclaimer */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              These calculators provide estimates for informational purposes only and do not constitute financial, tax, or legal advice. 
              Results are based on the information you provide and may not reflect actual costs, taxes, or outcomes. 
              Always consult with a qualified accountant, tax professional, or financial advisor before making business decisions. 
              CRUMS Leasing is not responsible for decisions made based on these estimates.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Definition Blocks */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
            <p>
              <strong className="text-foreground">Profitability</strong> in trucking comes down to understanding your numbers. Every mile you drive, every load you haul, and every expense you incur affects your bottom line. Our calculators help you analyze real operating costs so you can set rates that ensure sustainable profit margins rather than just covering expenses.
            </p>
            <p>
              <strong className="text-foreground">Cost efficiency</strong> separates successful owner-operators from those who struggle. Knowing your exact cost per mile—including fuel, maintenance, insurance, and depreciation—allows you to identify which loads are profitable and which routes maximize your earnings. These tools turn guesswork into strategic planning.
            </p>
            <p>
              <strong className="text-foreground">Tax optimization</strong> is often overlooked by carriers. Per diem deductions, IFTA credits, and equipment depreciation can significantly reduce your tax burden when properly tracked. Our calculators help you estimate these benefits and maintain the records needed for tax season.
            </p>
            <p>
              <strong className="text-foreground">Leasing economics</strong> play a crucial role in fleet decisions. Whether to lease or buy a trailer involves analyzing monthly cash flow, maintenance responsibilities, resale value, and tax implications. Understanding these trade-offs helps you make equipment decisions that align with your business goals.
            </p>
          </div>
        </div>
      </section>

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