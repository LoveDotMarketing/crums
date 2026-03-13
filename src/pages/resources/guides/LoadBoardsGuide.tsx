import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  CheckCircle, 
  Star,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Users,
  Globe,
  Smartphone
} from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Load Boards Guide: DAT, Truckstop & More",
  "description": "Compare DAT, Truckstop, 123Loadboard, Convoy and more. Learn how to find freight, evaluate loads, and avoid scams as a new driver.",
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
  "datePublished": "2026-01-29",
  "dateModified": "2026-01-29",
  "mainEntityOfPage": "https://crumsleasing.com/resources/guides/load-boards-guide"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a load board?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A load board is an online marketplace where shippers, brokers, and freight forwarders post available loads, and carriers and owner-operators search for freight to haul. It connects supply (available cargo) with demand (available trucks)."
      }
    },
    {
      "@type": "Question",
      "name": "Is DAT Load Board worth the cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DAT is the industry leader with the most load postings and rate data. For serious owner-operators, the $50-200/month cost is typically worth it for access to more loads and better rate negotiation tools. Many drivers consider it essential for their business."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between a broker and a shipper?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A shipper is the company that owns the freight and needs it transported. A broker is a middleman who connects shippers with carriers. Brokers take a percentage of the rate. Working directly with shippers typically pays better but is harder to find."
      }
    },
    {
      "@type": "Question",
      "name": "How do I know if a broker is legitimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check their MC number on FMCSA's website, verify their credit rating on DAT or Truckstop, and look for reviews from other carriers. Red flags include rates that seem too good, requests for upfront fees, or pressure to book immediately without details."
      }
    },
    {
      "@type": "Question",
      "name": "Are free load boards worth using?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free load boards can work for finding occasional loads, but they have fewer postings, less accurate data, and no credit check features. Most professional owner-operators find paid boards essential for consistent work and avoiding bad brokers."
      }
    },
    {
      "@type": "Question",
      "name": "What rate per mile should I accept?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your acceptable rate depends on your operating costs (typically $1.50-$2.50/mile). A good rule is to aim for at least $2.50-$3.00/mile all-in for dry van freight. Use our Cost Per Mile Calculator to determine your break-even point."
      }
    }
  ]
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Load Boards Guide", url: "https://crumsleasing.com/resources/guides/load-boards-guide" },
]);

const LoadBoardsGuide = () => {
  const loadBoards = [
    {
      name: "DAT Load Board",
      type: "Traditional",
      price: "$50-$200/month",
      loads: "500,000+/day",
      features: ["Largest load volume", "Rate analytics", "Broker credit checks", "Trip planning"],
      bestFor: "Serious owner-operators who need the most options",
      rating: 5
    },
    {
      name: "Truckstop.com",
      type: "Traditional",
      price: "$40-$150/month",
      loads: "300,000+/day",
      features: ["Strong rate tools", "Fuel optimization", "ELD integration", "Credit reports"],
      bestFor: "Carriers who want comprehensive business tools",
      rating: 4
    },
    {
      name: "123Loadboard",
      type: "Traditional",
      price: "$35-$80/month",
      loads: "200,000+/day",
      features: ["Budget-friendly", "Mobile app", "Mileage calculator", "Credit checks"],
      bestFor: "New owner-operators watching their budget",
      rating: 4
    },
    {
      name: "Convoy",
      type: "Digital Freight",
      price: "Free",
      loads: "Varies",
      features: ["No broker calls", "Instant booking", "Quick pay (1-2 days)", "Mobile-first"],
      bestFor: "Drivers who prefer app-based booking",
      rating: 4
    },
    {
      name: "Uber Freight",
      type: "Digital Freight",
      price: "Free",
      loads: "Varies",
      features: ["Transparent pricing", "Instant booking", "Good support", "Fuel discounts"],
      bestFor: "Drivers who want simple, no-negotiation loads",
      rating: 4
    },
    {
      name: "Amazon Freight",
      type: "Digital Freight",
      price: "Free",
      loads: "Amazon loads only",
      features: ["Consistent freight", "Fast pay", "Predictable routes", "No detention"],
      bestFor: "Carriers who want steady Amazon lanes",
      rating: 3
    }
  ];

  const whatToLookFor = [
    { term: "Rate/Mile", description: "Total pay divided by total miles (including deadhead). Aim for $2.50+/mile all-in." },
    { term: "Deadhead", description: "Empty miles to reach the load. Keep under 100 miles when possible, or factor into rate." },
    { term: "RPM (Rate Per Mile)", description: "What the load pays divided by loaded miles only. Doesn't include deadhead." },
    { term: "All-In Rate", description: "Includes all miles (deadhead + loaded). This is your true earnings per mile." },
    { term: "Detention", description: "Pay for waiting at shipper/receiver beyond free time (usually 2 hours)." },
    { term: "TONU", description: "Truck Ordered Not Used. Pay if you arrive and the load is cancelled." }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Load Boards Guide: DAT, Truckstop & More"
        description="Compare DAT, Truckstop, 123Loadboard, Convoy and more. Learn how to find freight, evaluate loads, and avoid scams as a new driver."
        canonical="https://crumsleasing.com/resources/guides/load-boards-guide"
        structuredData={[articleSchema, faqSchema, breadcrumbSchema]}
        article={{
          publishedTime: "2026-01-29",
          modifiedTime: "2026-01-29",
          section: "New Driver Guides",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Search className="h-12 w-12" />
            </div>
            <p className="text-sm uppercase tracking-wider mb-2 text-primary-foreground/80">New Driver Roadmap — Step 2 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Understanding Load Boards
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Load boards are where owner-operators and carriers find freight. Learn how they work, which platforms to use, and how to evaluate loads before booking.
            </p>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Quick Overview */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">500K+</p>
              <p className="text-sm text-muted-foreground">Daily Load Postings</p>
            </div>
            <div>
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">$0-$200</p>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
            </div>
            <div>
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">6+</p>
              <p className="text-sm text-muted-foreground">Major Platforms</p>
            </div>
            <div>
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Mobile Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* What is a Load Board */}
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">What is a Load Board?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A load board is an online marketplace that connects freight with trucks. Shippers and freight brokers post available loads — showing origin, destination, weight, equipment type, and rate — while carriers and owner-operators search for freight that matches their capacity and desired lanes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Think of it like a job board, but for trucking. Instead of employment listings, you're searching for individual loads to haul. Once you find a good match, you call the broker, negotiate the rate, and book the load.
              </p>
            </div>

            {/* Traditional vs Digital */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Traditional vs. Digital Freight Platforms</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Traditional Load Boards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <p className="mb-4">Platforms like DAT and Truckstop where you search listings, call brokers, and negotiate rates.</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        More loads and flexibility
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Room to negotiate rates
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        Requires calling brokers
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        Monthly subscription cost
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Digital Freight Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <p className="mb-4">Apps like Convoy and Uber Freight where you book loads instantly without calling.</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        No phone calls needed
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Usually free to use
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        Take-it-or-leave-it pricing
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        Less load variety
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Load Board Comparison */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Major Load Boards Compared</h2>
              <div className="space-y-6">
                {loadBoards.map((board, index) => (
                  <Card key={index} className={board.name === "DAT Load Board" ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {board.name}
                          {board.name === "DAT Load Board" && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Industry Leader</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(board.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                          {[...Array(5 - board.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-foreground block">Type</span>
                          <span className="text-muted-foreground">{board.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground block">Price</span>
                          <span className="text-primary font-medium">{board.price}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground block">Load Volume</span>
                          <span className="text-muted-foreground">{board.loads}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground block">Best For</span>
                          <span className="text-muted-foreground">{board.bestFor}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {board.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How to Read a Load Posting */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <TrendingUp className="h-6 w-6 text-primary" />
                How to Evaluate a Load
              </h2>
              <p className="text-muted-foreground mb-6">
                Understanding these terms will help you quickly evaluate whether a load is worth booking:
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Term</TableHead>
                      <TableHead>What It Means</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whatToLookFor.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.term}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Pro Tip:</strong> Use our{" "}
                  <Link to="/resources/tools/cost-per-mile" className="text-primary hover:underline">
                    Cost Per Mile Calculator
                  </Link>{" "}
                  to determine your break-even rate before booking loads.
                </p>
              </div>
            </div>

            {/* Broker Credit Checks */}
            <div className="mb-12 bg-muted/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-6 w-6 text-primary" />
                Checking Broker Credit & Legitimacy
              </h2>
              <p className="text-muted-foreground mb-4">
                Before booking with any broker, verify they're legitimate and have good credit. Many carriers have been burned by brokers who don't pay.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-foreground">Before You Book</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verify MC number on <a href="https://safer.fmcsa.dot.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FMCSA SAFER</a></li>
                    <li>• Check credit rating on DAT or Truckstop</li>
                    <li>• Look for reviews from other carriers</li>
                    <li>• Verify their bond amount (minimum $75K)</li>
                  </ul>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-foreground">Red Flags</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rate seems too good to be true</li>
                    <li>• Request for upfront payment</li>
                    <li>• New authority with no credit history</li>
                    <li>• Pressure to book immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqSchema.mainEntity.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.acceptedAnswer.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Next Steps */}
            <div className="bg-primary text-primary-foreground rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
              <p className="text-primary-foreground/90 mb-6">
                Now that you understand how load boards work, the next guide covers the practical steps of finding and booking your first loads — including rate negotiation, avoiding scams, and building relationships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/resources/guides/finding-first-loads">
                    Next: Finding Your First Loads
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/guides/getting-your-cdl">
                    Previous: Getting Your CDL
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GuideRelatedContent currentSlug="load-boards-guide" />
      <Footer />
    </div>
  );
};

export default LoadBoardsGuide;
