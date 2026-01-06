import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Clock, DollarSign, Repeat, ArrowRight, Calculator, BookOpen, Truck } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";
import { seasonalDemandServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Industries", url: "https://crumsleasing.com/industries" },
  { name: "Seasonal Demand", url: "https://crumsleasing.com/industries/seasonal-demand" }
]);

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Rent Trailers for Seasonal Demand",
  "description": "A step-by-step guide to renting trailers for peak season capacity with CRUMS Leasing.",
  "totalTime": "P1D",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Plan Ahead",
      "text": "Contact us in advance of your peak season to discuss capacity needs and reserve trailers.",
      "url": "https://crumsleasing.com/industries/seasonal-demand#step-1"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Quick Deployment",
      "text": "We prepare trailers and deliver them when you need them, ready to roll.",
      "url": "https://crumsleasing.com/industries/seasonal-demand#step-2"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Flexible Returns",
      "text": "Return trailers when your peak season ends - no long-term commitment required.",
      "url": "https://crumsleasing.com/industries/seasonal-demand#step-3"
    }
  ]
};

const SeasonalDemand = () => {
  const benefits = [
    { icon: TrendingUp, title: "Peak Capacity", description: "Scale up quickly for holiday and seasonal rushes." },
    { icon: Clock, title: "Short-Term Rentals", description: "Flexible rental periods without long-term commitments." },
    { icon: DollarSign, title: "Cost Effective", description: "Pay only for the capacity you need, when you need it." },
    { icon: Repeat, title: "Recurring Support", description: "Build a relationship for predictable seasonal needs." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Seasonal Trailer Rentals | CRUMS Leasing"
        description="Short-term trailer rentals for seasonal demand spikes. CRUMS Leasing offers flexible capacity solutions for holiday seasons, harvest, and peak shipping periods."
        canonical="https://crumsleasing.com/industries/seasonal-demand"
        structuredData={[seasonalDemandServiceSchema, breadcrumbSchema, howToSchema]}
      />
      <Navigation />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Seasonal Demand Solutions
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Don't let peak season catch you short on capacity. CRUMS Leasing provides flexible 
              short-term trailer rentals to help you handle seasonal demand spikes efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/get-started" onClick={() => trackCtaClick('Reserve Now', 'industry_seasonal_demand', '/get-started')}>Reserve Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                <Link to="/trailer-rentals">View Rental Options</Link>
              </Button>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Flexible Seasonal Capacity</h2>
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
              <h2 className="text-3xl font-bold mb-8">Common Seasonal Needs</h2>
              <ul className="space-y-4">
                {[
                  "Holiday retail surge (Q4 peak shipping season)",
                  "Agricultural harvest and produce transport",
                  "Back-to-school retail distribution",
                  "Construction season equipment transport",
                  "Event and festival logistics",
                  "Year-end inventory movements"
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

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">How Seasonal Rentals Work</h2>
              <div className="space-y-6">
                <div id="step-1" className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-lg">Plan Ahead</h3>
                    <p className="text-muted-foreground">Contact us in advance of your peak season to discuss capacity needs and reserve trailers.</p>
                  </div>
                </div>
                <div id="step-2" className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-lg">Quick Deployment</h3>
                    <p className="text-muted-foreground">We prepare trailers and deliver them when you need them, ready to roll.</p>
                  </div>
                </div>
                <div id="step-3" className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-lg">Flexible Returns</h3>
                    <p className="text-muted-foreground">Return trailers when your peak season ends - no long-term commitment required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources for Seasonal Planning */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Resources for Seasonal Planning</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Dry Van Trailers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Most popular for seasonal shipping needs.
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
                    Plan seasonal operating costs.
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
                    Match trailer types to seasonal freight.
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
            <h2 className="text-3xl font-bold mb-4">Ready for Peak Season?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Don't wait until the last minute. Contact us now to plan your seasonal trailer capacity.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/contact" onClick={() => trackCtaClick('Contact Us', 'industry_seasonal_demand', '/contact')}>Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SeasonalDemand;
