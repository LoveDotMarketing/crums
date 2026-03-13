import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Fuel, Gauge, Wind, Weight, Timer, TrendingDown, CheckCircle2, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FuelEfficiency = () => {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Boost Your Fuel Efficiency as a Truck Driver",
      "description": "Proven strategies to reduce fuel costs including tire pressure, weight distribution, idle reduction, and driving techniques for owner-operators.",
      "author": {
        "@type": "Organization",
        "name": "CRUMS Leasing"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CRUMS Leasing",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crumsleasing.com/logo.png"
        }
      },
      "datePublished": "2026-02-01",
      "dateModified": "2026-02-01",
      "mainEntityOfPage": "https://crumsleasing.com/resources/guides/fuel-efficiency"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much can proper tire pressure improve fuel economy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Maintaining proper tire pressure can improve fuel economy by 0.5% to 3%. Under-inflated tires create more rolling resistance, forcing the engine to work harder and burn more fuel."
          }
        },
        {
          "@type": "Question",
          "name": "Does idling really waste that much fuel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, a semi-truck can burn 0.8 to 1 gallon of fuel per hour while idling. Over a year, reducing idle time by just 2 hours per day can save $2,000-$3,000 in fuel costs."
          }
        },
        {
          "@type": "Question",
          "name": "What speed is most fuel-efficient for trucks?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most trucks achieve optimal fuel efficiency between 55-65 mph. Above 65 mph, aerodynamic drag increases significantly—every 1 mph increase above 55 can reduce fuel economy by 0.1 mpg."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://crumsleasing.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://crumsleasing.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Guides", "item": "https://crumsleasing.com/resources/guides" },
        { "@type": "ListItem", "position": 4, "name": "Fuel Efficiency", "item": "https://crumsleasing.com/resources/guides/fuel-efficiency" }
      ]
    }
  ];

  const quickWins = [
    { icon: Gauge, title: "Check Tire Pressure Daily", savings: "Up to 3% better MPG" },
    { icon: Timer, title: "Reduce Idle Time", savings: "Save 1 gal/hour" },
    { icon: Wind, title: "Maintain Speed 55-65 MPH", savings: "0.1 MPG per MPH saved" },
    { icon: Weight, title: "Optimize Load Distribution", savings: "Better handling & efficiency" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Boost Your Fuel Efficiency"
        description="Proven strategies to reduce fuel costs for truck drivers. Learn about tire pressure, weight distribution, idle reduction, and driving techniques."
        canonical="https://crumsleasing.com/resources/guides/fuel-efficiency"
        structuredData={structuredData}
        article={{
          publishedTime: "2026-02-01",
          modifiedTime: "2026-02-01",
          section: "Resources",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-lg">
                <Fuel className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Cost Savings Guide
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Boost Your Fuel Efficiency
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl">
              Fuel is one of your biggest expenses as a truck driver. These proven strategies 
              can save you thousands of dollars each year while reducing your environmental impact.
            </p>
          </div>
        </section>

        {/* Quick Wins */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Quick Wins for Better Fuel Economy</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickWins.map((item, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <item.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-green-600 font-medium">{item.savings}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tire Pressure Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Gauge className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Tire Pressure: Your First Line of Defense</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="prose prose-lg">
                  <p className="text-muted-foreground">
                    Under-inflated tires are one of the biggest fuel wasters in trucking. When tires 
                    don't have enough air, they create more rolling resistance—your engine has to 
                    work harder to move the same load.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-4">The Numbers</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Every 10 PSI under-inflation reduces fuel economy by 1%</li>
                    <li>At $4/gallon and 6 MPG, that's $400-$600/year lost</li>
                    <li>Under-inflation also causes faster tire wear</li>
                  </ul>
                </div>

                <Card className="bg-accent">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Daily Tire Check Routine</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                        <span className="text-muted-foreground">Check pressure when tires are cold (before driving)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                        <span className="text-muted-foreground">Use a calibrated gauge—don't rely on visual inspection</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                        <span className="text-muted-foreground">Check all 18 wheels including trailer tires</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                        <span className="text-muted-foreground">Inflate to manufacturer specs (usually 100-110 PSI)</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Idle Reduction */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Timer className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Idle Reduction: Stop Burning Money</h2>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-lg mb-2 text-destructive">The True Cost of Idling</h3>
                <p className="text-muted-foreground mb-4">
                  A semi-truck burns approximately 0.8-1 gallon of diesel per hour while idling. 
                  If you idle 8 hours a day for rest stops, that's potentially $3,000+ per year in wasted fuel.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">APU Systems</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Auxiliary Power Units run A/C and heat without idling the main engine. 
                      Uses 0.1-0.2 gallons/hour vs 0.8-1 gallon.
                    </p>
                    <p className="text-green-600 font-medium text-sm">ROI: 12-18 months</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Truck Stop Electrification</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      IdleAir and similar services provide A/C, heat, and power through your window. 
                      Costs $2-3/hour but saves more in fuel.
                    </p>
                    <p className="text-green-600 font-medium text-sm">Immediate savings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Battery-Powered HVAC</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Modern battery systems can run climate control for 8-10 hours. 
                      Zero fuel consumption during rest periods.
                    </p>
                    <p className="text-green-600 font-medium text-sm">ROI: 18-24 months</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Driving Techniques */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <TrendingDown className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Driving Techniques That Save Fuel</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Speed Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Sweet Spot: 55-65 MPH</p>
                        <p className="text-sm text-muted-foreground">Aerodynamic drag increases exponentially above 65</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Use Cruise Control</p>
                        <p className="text-sm text-muted-foreground">Maintains consistent speed and throttle position</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Progressive Shifting</p>
                        <p className="text-sm text-muted-foreground">Shift at lower RPMs to reduce fuel consumption</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Momentum Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Look Ahead</p>
                        <p className="text-sm text-muted-foreground">Anticipate stops to coast instead of braking hard</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Maintain Following Distance</p>
                        <p className="text-sm text-muted-foreground">More space = smoother driving = less fuel</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Use Gravity</p>
                        <p className="text-sm text-muted-foreground">Build speed before hills, coast down the other side</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weight Distribution */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Weight className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Weight Distribution & Load Planning</h2>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-muted-foreground">
                  How you load your trailer affects both fuel efficiency and safety. Proper weight 
                  distribution reduces tire wear, improves handling, and optimizes fuel consumption.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Do This</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Distribute weight evenly across axles</li>
                      <li>• Place heavier items low and centered</li>
                      <li>• Secure loads to prevent shifting</li>
                      <li>• Check axle weights before departure</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Avoid This</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Overloading any single axle</li>
                      <li>• Top-heavy loads that affect stability</li>
                      <li>• Unbalanced side-to-side weight</li>
                      <li>• Running empty when you could backhaul</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Calculate Your Savings */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Calculator className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-6">Calculate Your Potential Savings</h2>
              <p className="text-xl text-primary-foreground/90 mb-8">
                Use our free Fuel Cost Calculator to see how small improvements in MPG 
                can lead to significant annual savings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/resources/tools/fuel-cost-calculator">Fuel Cost Calculator</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/tools/cost-per-mile-calculator">Cost Per Mile Calculator</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/resources/guides/tire-care" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Tire Care Guide</h3>
                  <p className="text-sm text-muted-foreground">Complete guide to tire maintenance and inspection</p>
                </Link>
                <Link to="/resources/guides/pre-trip-inspection" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Pre-Trip Inspection</h3>
                  <p className="text-sm text-muted-foreground">Daily checks that catch efficiency issues early</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <GuideRelatedContent currentSlug="fuel-efficiency" />
      <Footer />
    </div>
  );
};

export default FuelEfficiency;
