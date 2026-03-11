import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Cog, Shield, Clock, Layers, ArrowRight, Calculator, BookOpen, Truck } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { manufacturingServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" },
  { name: "Manufacturing", url: "https://crumsleasing.com/industries/manufacturing" }
]);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What trailers does CRUMS Leasing offer for manufacturing logistics?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CRUMS Leasing offers 53-foot dry van trailers for finished goods and components, plus flatbed trailers for machinery, equipment, and raw materials transport."
      }
    },
    {
      "@type": "Question",
      "name": "Can CRUMS trailers support just-in-time manufacturing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Our reliable 53' dry vans and flatbeds are available on flexible terms to support just-in-time delivery requirements and dedicated manufacturing routes."
      }
    },
    {
      "@type": "Question",
      "name": "Does CRUMS Leasing offer long-term leases for manufacturing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We offer long-term leasing for dedicated manufacturing routes as well as flexible capacity for production schedule changes and new contracts."
      }
    }
  ]
};

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
        title="Manufacturing Logistics — 53' Dry Van & Flatbed Trailers"
        description="Trailer leasing for manufacturing companies. CRUMS Leasing offers dry van and flatbed trailers to support manufacturing logistics and supply chains."
        canonical="https://crumsleasing.com/industries/manufacturing"
        structuredData={[manufacturingServiceSchema, breadcrumbSchema, faqSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Manufacturing Logistics Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Keep your production lines running with reliable trailer solutions from CRUMS Leasing. 
              We support manufacturers with the equipment needed for efficient supply chain operations.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started" onClick={() => trackCtaClick('Get a Quote', 'industry_manufacturing', '/get-started')}>Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/flatbed-trailers">View Flatbeds</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

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

        {/* Resources for Manufacturing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Resources for Manufacturers</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Flatbed Trailers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Heavy-duty hauling for machinery and materials.
                  </p>
                  <Link to="/flatbed-trailers" className="text-primary hover:underline font-medium text-sm">
                    View Flatbeds →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Calculator className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Cost Per Mile Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Optimize manufacturing logistics costs.
                  </p>
                  <Link to="/resources/tools/cost-per-mile" className="text-secondary hover:underline font-medium text-sm">
                    Calculate Now →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Choosing the Right Trailer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Match trailer types to your manufacturing freight.
                  </p>
                  <Link to="/resources/guides/choosing-trailer" className="text-primary hover:underline font-medium text-sm">
                    Read Guide →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Optimize Your Manufacturing Logistics</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Partner with CRUMS Leasing for trailer solutions that keep your manufacturing operations efficient.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/get-started" onClick={() => trackCtaClick('Get Started', 'industry_manufacturing', '/get-started')}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Manufacturing;
