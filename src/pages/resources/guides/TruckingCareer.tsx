import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GuideRelatedContent } from "@/components/GuideRelatedContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { GraduationCap, TrendingUp, Users, Award, Target, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TruckingCareer = () => {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Build a Successful Career in Trucking",
      "description": "Complete guide to advancing your trucking career. Learn about networking, certifications, specializations, and long-term success strategies.",
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
      "mainEntityOfPage": "https://crumsleasing.com/resources/guides/trucking-career"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What certifications can help advance my trucking career?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Key certifications include HAZMAT endorsement, Tanker endorsement, Doubles/Triples, and specialized training for oversized loads. Each certification opens new freight opportunities and typically increases earning potential by 10-20%."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to become an owner-operator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most successful owner-operators spend 2-5 years as company drivers first to learn the industry, build savings, and establish a clean driving record. This foundation is essential for securing financing and contracts."
          }
        },
        {
          "@type": "Question",
          "name": "What's the earning potential in trucking?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Earnings vary widely: company drivers average $50,000-$75,000 annually, experienced specialized drivers can earn $80,000-$100,000+, and successful owner-operators may gross $150,000-$300,000+ depending on their operation."
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
        { "@type": "ListItem", "position": 4, "name": "Trucking Career", "item": "https://crumsleasing.com/resources/guides/trucking-career" }
      ]
    }
  ];

  const careerPaths = [
    {
      title: "Company Driver",
      years: "Year 1-3",
      description: "Learn the industry, build experience, establish clean record",
      earnings: "$50,000 - $65,000"
    },
    {
      title: "Specialized Driver",
      years: "Year 3-5",
      description: "Add endorsements, specialize in HAZMAT, tanker, or oversized",
      earnings: "$70,000 - $90,000"
    },
    {
      title: "Owner-Operator",
      years: "Year 5+",
      description: "Run your own truck, build business relationships",
      earnings: "$100,000 - $200,000+"
    },
    {
      title: "Fleet Owner",
      years: "Year 8+",
      description: "Multiple trucks, hire drivers, scale operations",
      earnings: "$200,000 - $500,000+"
    }
  ];

  const endorsements = [
    { name: "HAZMAT (H)", benefit: "+15-25% per mile", description: "Transport hazardous materials" },
    { name: "Tanker (N)", benefit: "+10-20% per mile", description: "Haul liquid cargo" },
    { name: "Doubles/Triples (T)", benefit: "+5-15% per mile", description: "Pull multiple trailers" },
    { name: "Passenger (P)", benefit: "New opportunities", description: "Drive buses and passenger vehicles" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Build a Career in Trucking"
        description="Complete guide to advancing your trucking career. Learn about networking, certifications, specializations, and strategies for long-term success."
        canonical="https://crumsleasing.com/resources/guides/trucking-career"
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
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Career Development
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Build a Career in Trucking
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl">
              Trucking offers real opportunities for advancement—from new driver to fleet owner. 
              Learn the strategies successful professionals use to build lasting careers and 
              financial independence.
            </p>
          </div>
        </section>

        {/* Career Path Timeline */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">The Trucking Career Ladder</h2>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {careerPaths.map((path, index) => (
                  <div key={index} className="relative">
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="text-sm text-primary font-medium mb-2">{path.years}</div>
                        <h3 className="text-xl font-bold mb-3">{path.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{path.description}</p>
                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground">Earning Potential</div>
                          <div className="font-semibold text-green-700 dark:text-green-400">{path.earnings}</div>
                        </div>
                      </CardContent>
                    </Card>
                    {index < careerPaths.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications & Endorsements */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Award className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Certifications That Pay Off</h2>
              </div>

              <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
                Additional endorsements and certifications open doors to higher-paying freight 
                and specialized opportunities. Each investment in your credentials pays dividends 
                throughout your career.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {endorsements.map((endorsement, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold">{endorsement.name}</h3>
                          <span className="text-green-600 text-sm font-medium">{endorsement.benefit}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{endorsement.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-accent">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Additional Valuable Certifications</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Safety & Compliance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Smith System Training</li>
                        <li>• OSHA Safety Certification</li>
                        <li>• First Aid/CPR</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Specialized Skills</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Oversized Load Certification</li>
                        <li>• Refrigerated Transport</li>
                        <li>• Flatbed Securement</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Business Skills</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Freight Broker Training</li>
                        <li>• Small Business Management</li>
                        <li>• Bookkeeping Basics</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Networking */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Users className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Building Your Network</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Why Networking Matters</h3>
                  <p className="text-muted-foreground mb-6">
                    In trucking, relationships drive success. The best loads, lease deals, and 
                    business opportunities often come through personal connections rather than 
                    public listings.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Direct shipper relationships bypass broker fees</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Experienced drivers share route knowledge and tips</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Industry contacts provide job leads and references</span>
                    </li>
                  </ul>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Where to Connect</h3>
                    <ul className="space-y-4">
                      <li>
                        <h4 className="font-medium">Industry Events</h4>
                        <p className="text-sm text-muted-foreground">MATS, Great American Trucking Show, regional expos</p>
                      </li>
                      <li>
                        <h4 className="font-medium">Online Communities</h4>
                        <p className="text-sm text-muted-foreground">TruckersReport, Reddit r/truckers, Facebook groups</p>
                      </li>
                      <li>
                        <h4 className="font-medium">Professional Associations</h4>
                        <p className="text-sm text-muted-foreground">OOIDA, state trucking associations, local groups</p>
                      </li>
                      <li>
                        <h4 className="font-medium">Truck Stops & Rest Areas</h4>
                        <p className="text-sm text-muted-foreground">Some of the best connections happen over coffee</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Setting Goals */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Setting Career Goals</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Year 1 Goals</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Build 100,000+ safe miles
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Maintain clean CSA score
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Save 3-6 months expenses
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Add first endorsement
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Year 3 Goals</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        300,000+ accident-free miles
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Multiple endorsements
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Established shipper relationships
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Plan for owner-operator transition
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Year 5+ Goals</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Own or lease your equipment
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Profitable owner-operator business
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Consider fleet expansion
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Retirement savings on track
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CRUMS Partnership */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-6">CRUMS Believes in Your Success</h2>
              <p className="text-xl text-primary-foreground/90 mb-8">
                At CRUMS Leasing, we're invested in your long-term success. We provide flexible 
                lease terms, well-maintained equipment, and support services that help you focus 
                on building your career and your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/get-started">Start Your Journey</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/guides/owner-operator-basics">Owner-Operator Guide</Link>
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
                <Link to="/resources/guides/getting-your-cdl" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Getting Your CDL</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step guide to getting your Commercial Driver's License</p>
                </Link>
                <Link to="/resources/guides/owner-operator-basics" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Owner-Operator Basics</h3>
                  <p className="text-sm text-muted-foreground">Essential guide for starting your trucking business</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <GuideRelatedContent currentSlug="trucking-career" />
      <Footer />
    </div>
  );
};

export default TruckingCareer;
