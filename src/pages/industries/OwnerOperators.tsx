import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Wrench, FileText, Heart, ArrowRight, Calculator, BookOpen, Truck } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { ownerOperatorsServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" },
  { name: "Owner Operators", url: "https://crumsleasing.com/industries/owner-operators" }
]);

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
        structuredData={[ownerOperatorsServiceSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Owner Operator Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              At CRUMS Leasing, we believe every hardworking carrier deserves the freedom and 
              stability to build a better life. Our trailer leasing programs are designed with 
              owner operators in mind.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started" onClick={() => trackCtaClick('Apply Now', 'industry_owner_operators', '/get-started')}>Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
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

        {/* Resources for Owner Operators */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Resources for Owner Operators</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Dry Van Trailers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our most popular option for owner operators hauling general freight.
                  </p>
                  <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium text-sm">
                    View Dry Vans →
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Calculator className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Cost Per Mile Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Calculate your true operating costs per mile.
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
                    Learn how to select the perfect trailer for your freight.
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
            <h2 className="text-3xl font-bold mb-4">Start Your Journey with CRUMS</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join the CRUMS family and get the trailer you need to succeed on the road.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/get-started" onClick={() => trackCtaClick('Apply Today', 'industry_owner_operators', '/get-started')}>Apply Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default OwnerOperators;
