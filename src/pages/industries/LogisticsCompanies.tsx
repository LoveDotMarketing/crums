import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Network, Clock, BarChart3, Handshake, ArrowRight, Calculator, BookOpen, Truck } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { logisticsServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" },
  { name: "Logistics Companies", url: "https://crumsleasing.com/industries/logistics-companies" }
]);

const LogisticsCompanies = () => {
  const benefits = [
    { icon: Network, title: "Capacity on Demand", description: "Scale trailer capacity up or down based on customer needs." },
    { icon: Clock, title: "Quick Turnaround", description: "Fast approval and deployment to meet tight deadlines." },
    { icon: BarChart3, title: "Asset-Light Model", description: "Expand capabilities without heavy capital investment." },
    { icon: Handshake, title: "Partnership Approach", description: "We work as an extension of your logistics team." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Logistics Company 53' Dry Van & Flatbed Trailer Solutions"
        description="Trailer leasing solutions for 3PL providers, freight brokers, and logistics companies. CRUMS Leasing offers flexible capacity to match your customer demands."
        canonical="https://crumsleasing.com/industries/logistics-companies"
        structuredData={[logisticsServiceSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Logistics Company Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Whether you're a 3PL provider, freight broker, or logistics company, CRUMS Leasing 
              provides the trailer capacity you need to serve your customers effectively.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started" onClick={() => trackCtaClick('Request Quote', 'industry_logistics', '/get-started')}>Request Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/fleet-solutions">Fleet Solutions</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Solutions for Logistics Providers</h2>
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
              <h2 className="text-3xl font-bold mb-8">How We Support Logistics Operations</h2>
              <ul className="space-y-4">
                {[
                  "Flexible lease and rental options for varying contract lengths",
                  "Multiple trailer types to match diverse freight requirements",
                  "Quick deployment for new customer contracts",
                  "Scalable capacity for seasonal fluctuations",
                  "Dedicated support for logistics partners",
                  "Competitive rates for volume commitments"
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

        {/* Resources for Logistics Companies */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Resources for Logistics Providers</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Dry Van & Flatbed Leasing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Lease dry vans and flatbeds for diverse customer needs.
                  </p>
                  <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-medium text-sm">
                    Dry Van Leasing →
                  </Link>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <Link to="/flatbed-trailer-leasing" className="text-primary hover:underline font-medium text-sm">
                    Flatbed Leasing →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Calculator className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Profit Per Load Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze profitability for your customers' freight.
                  </p>
                  <Link to="/resources/tools/profit-per-load" className="text-secondary hover:underline font-medium text-sm">
                    Calculate Now →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Trailer Specifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed dimensions and capacity specs.
                  </p>
                  <Link to="/resources/guides/trailer-specifications" className="text-primary hover:underline font-medium text-sm">
                    View Specs →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Partner with CRUMS Leasing</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can support your logistics operations with reliable trailer solutions.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/contact" onClick={() => trackCtaClick('Contact Us', 'industry_logistics', '/contact')}>Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LogisticsCompanies;
