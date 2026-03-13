import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  CheckCircle, 
  DollarSign,
  ArrowRight,
  AlertTriangle,
  Phone,
  Calculator,
  Shield,
  Target,
  Users,
  Clock
} from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Find Your First Trucking Loads: A New Driver's Guide",
  "description": "Step-by-step guide for new owner-operators on finding and booking their first loads. Learn rate negotiation, broker communication, scam avoidance, and building repeat customers.",
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
  "mainEntityOfPage": "https://crumsleasing.com/resources/guides/finding-first-loads"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I negotiate rates with freight brokers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Know your minimum rate before calling. When the broker quotes a rate, counter with your target. Be professional but firm. Mention your on-time delivery record, equipment quality, and availability. If they won't budge, thank them and move on — there are always more loads."
      }
    },
    {
      "@type": "Question",
      "name": "How do I avoid freight broker scams?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Verify broker MC numbers on FMCSA SAFER, check credit ratings on load boards, never pay upfront fees, get rate confirmations in writing before loading, and be wary of rates that seem too good. Trust your instincts — if something feels off, it probably is."
      }
    },
    {
      "@type": "Question",
      "name": "Should I haul cheap loads just to get started?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Avoid this trap. Hauling below your cost leads to burnout and business failure. It's better to wait for a profitable load or reposition to a better market. Know your break-even rate and don't go below it, even as a new driver."
      }
    },
    {
      "@type": "Question",
      "name": "How do I build relationships with brokers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Deliver on time, communicate proactively about delays, be professional on the phone, and follow up after successful loads. Over time, good brokers will call you first with premium loads before posting them on load boards."
      }
    },
    {
      "@type": "Question",
      "name": "What should I ask before booking a load?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ask about pickup and delivery times, detention pay policy, who's loading/unloading, appointment requirements, weight and commodity, any special equipment needed, and payment terms. Get everything in the rate confirmation before picking up."
      }
    },
    {
      "@type": "Question",
      "name": "How do I find direct shipper freight?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Direct shipper relationships take time to build. Start by performing well for brokers who work with specific shippers. Join industry associations, attend trade shows, and network with other drivers. Some shippers post directly on load boards or have carrier portals."
      }
    }
  ]
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Book Your First Trucking Load",
  "description": "Step-by-step process for finding and booking freight as a new owner-operator",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Calculate Your Minimum Rate",
      "text": "Use a cost-per-mile calculator to determine your break-even rate. Add your target profit margin.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Search Load Boards",
      "text": "Filter for loads matching your equipment, preferred lanes, and minimum rate requirements.",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Verify the Broker",
      "text": "Check MC number, credit rating, and reviews before calling about any load.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Call and Negotiate",
      "text": "Be professional, state your rate, and negotiate. Get all details in writing.",
      "position": 4
    },
    {
      "@type": "HowToStep",
      "name": "Get Rate Confirmation",
      "text": "Review the rate confirmation carefully before picking up. Ensure all terms are correct.",
      "position": 5
    },
    {
      "@type": "HowToStep",
      "name": "Execute and Follow Up",
      "text": "Deliver on time, communicate any issues, and send paperwork promptly for quick payment.",
      "position": 6
    }
  ]
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Finding First Loads", url: "https://crumsleasing.com/resources/guides/finding-first-loads" },
]);

const FindingFirstLoads = () => {
  const firstLoadChecklist = [
    "Know your cost per mile (use our calculator)",
    "Set up load board subscriptions",
    "Have your MC number ready",
    "Prepare insurance certificate (COI)",
    "Set up a professional voicemail",
    "Have a factoring company ready (for cash flow)",
    "Create a simple rate sheet for reference"
  ];

  const questionsToAsk = [
    { question: "What are the pickup and delivery windows?", why: "Know if you can make it on time" },
    { question: "Is it live load/unload or drop and hook?", why: "Affects your time and scheduling" },
    { question: "What's the detention policy?", why: "Get paid if you're stuck waiting" },
    { question: "What's the commodity and weight?", why: "Ensure your equipment handles it" },
    { question: "Is there any special equipment needed?", why: "Avoid showing up unprepared" },
    { question: "What are your payment terms?", why: "Know when you'll get paid" }
  ];

  const negotiationTips = [
    {
      tip: "Know Your Number",
      details: "Calculate your minimum acceptable rate before calling. Never go below your cost-per-mile plus profit margin."
    },
    {
      tip: "Be Professional, Not Desperate",
      details: "Brokers can sense desperation. Speak confidently about your rate and be willing to walk away."
    },
    {
      tip: "Counter, Don't Accept",
      details: "The first rate offered is rarely the best. Counter with your target rate or meet in the middle."
    },
    {
      tip: "Mention Your Value",
      details: "Highlight on-time delivery, good equipment, communication, and availability. These matter to quality brokers."
    },
    {
      tip: "Get Everything in Writing",
      details: "Never load without a signed rate confirmation showing all agreed terms, rates, and accessorials."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Find Your First Trucking Loads: A New Driver's Guide"
        description="Step-by-step guide for new owner-operators on finding and booking their first loads. Learn rate negotiation, broker communication, scam avoidance, and building repeat customers."
        canonical="https://crumsleasing.com/resources/guides/finding-first-loads"
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
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
              <Package className="h-12 w-12" />
            </div>
            <p className="text-sm uppercase tracking-wider mb-2 text-primary-foreground/80">New Driver Roadmap — Step 3 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Finding Your First Loads
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              You've got your CDL and understand load boards. Now it's time to book freight. This guide covers the practical steps of finding, negotiating, and securing profitable loads.
            </p>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your first load is a milestone moment. It proves you can do this business — find freight, negotiate a rate, pick it up, and deliver it safely. But booking that first load can feel intimidating. What do you say when you call a broker? How do you know if a rate is fair? What if you get scammed?
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This guide walks through the entire process, from calculating your minimum rate to building relationships that lead to repeat business. Follow these steps and you'll be running loads with confidence in no time.
              </p>
            </div>

            {/* First Load Checklist */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <CheckCircle className="h-6 w-6 text-primary" />
                First Load Checklist
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    Before you start searching for loads, make sure you have these essentials ready:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {firstLoadChecklist.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Start here:</strong>{" "}
                      <Link to="/resources/tools/cost-per-mile" className="text-primary hover:underline">
                        Calculate your cost per mile
                      </Link>{" "}
                      — this is the foundation of every rate decision.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Know Your Numbers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Calculator className="h-6 w-6 text-primary" />
                Know Your Numbers First
              </h2>
              <p className="text-muted-foreground mb-6">
                The biggest mistake new drivers make is booking loads without knowing their break-even rate. Before you search for freight, you need to understand your true operating costs.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Fixed Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Truck payment</li>
                      <li>• Trailer lease</li>
                      <li>• Insurance</li>
                      <li>• Permits & licenses</li>
                      <li>• ELD subscription</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Variable Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Fuel</li>
                      <li>• Maintenance</li>
                      <li>• Tires</li>
                      <li>• Tolls</li>
                      <li>• Lumper fees</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Target</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Total costs/mile</li>
                      <li>• + Profit margin</li>
                      <li>• = Minimum rate</li>
                      <li className="pt-2 font-medium text-foreground">
                        Typical: $2.50-$3.50/mile
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="default">
                  <Link to="/resources/tools/cost-per-mile">
                    <Calculator className="h-4 w-4 mr-2" />
                    Cost Per Mile Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/resources/tools/profit-calculator">
                    Profit Per Load Calculator
                  </Link>
                </Button>
              </div>
            </div>

            {/* Questions to Ask */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Phone className="h-6 w-6 text-primary" />
                What to Ask Before Booking
              </h2>
              <p className="text-muted-foreground mb-6">
                When you call about a load, get all the details upfront. Missing information leads to surprises that cost you time and money.
              </p>
              <div className="space-y-4">
                {questionsToAsk.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start bg-muted/30 rounded-lg p-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.question}</p>
                      <p className="text-sm text-muted-foreground">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Tips */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <DollarSign className="h-6 w-6 text-primary" />
                Rate Negotiation Tips
              </h2>
              <div className="space-y-4">
                {negotiationTips.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {item.tip}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      {item.details}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Avoiding Scams */}
            <div className="mb-12 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Avoiding Broker Scams
              </h2>
              <p className="text-muted-foreground mb-4">
                Unfortunately, scams exist in trucking. Protect yourself by following these rules:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Always Do This</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      Verify MC number on FMCSA SAFER
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      Check broker credit rating
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      Get signed rate confirmation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      Call the shipper to verify pickup
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Red Flags</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      Rate seems too good to be true
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      Request for upfront payment
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      Broker has new/no authority
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      Won't provide rate confirmation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Building Relationships */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Users className="h-6 w-6 text-primary" />
                Building Repeat Business
              </h2>
              <p className="text-muted-foreground mb-6">
                The best loads don't come from load boards — they come from relationships. Here's how to build them:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Deliver On Your Promises
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Be on time. Every time. If you're going to be late, call immediately. Communication builds trust, and trust leads to repeat business.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Be Professional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Answer your phone professionally, respond to emails promptly, and treat every interaction as a job interview for future loads.
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Pro Tip:</strong> After delivering a good load, ask the broker if they have regular lanes. Many will put you on their preferred carrier list for consistent freight.
                </p>
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
                You know how to find loads — but what about your equipment? <Link to="/dry-van-trailer-leasing" className="underline font-medium">Leasing a dry van trailer</Link> gives you flexibility without the huge upfront cost. The next guide explains why leasing makes sense for new drivers and what to look for in a lease provider.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/resources/guides/lease-first-trailer">
                    Next: Why Lease Your First Trailer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/guides/load-boards-guide">
                    Previous: Understanding Load Boards
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GuideRelatedContent currentSlug="finding-first-loads" />
      <Footer />
    </div>
  );
};

export default FindingFirstLoads;
