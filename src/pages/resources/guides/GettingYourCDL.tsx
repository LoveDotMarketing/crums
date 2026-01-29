import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Heart,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Truck
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
  "headline": "How to Get Your CDL License: Complete Guide for New Truck Drivers",
  "description": "Step-by-step guide to getting your Commercial Driver's License (CDL). Learn about CDL classes, ELDT requirements, DOT physicals, training costs, and timeline expectations.",
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
  "mainEntityOfPage": "https://crumsleasing.com/resources/guides/getting-your-cdl"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does it take to get a CDL license?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most CDL training programs take 3-8 weeks to complete. After training, you'll need to pass your skills and knowledge tests, which can add another 1-2 weeks. Total time from start to license is typically 4-10 weeks depending on your program and state."
      }
    },
    {
      "@type": "Question",
      "name": "How much does CDL training cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CDL training costs range from $3,000 to $10,000 for private schools. Community college programs may cost $1,500-$5,000. Company-sponsored training is often free but requires a work commitment of 1-2 years with that carrier."
      }
    },
    {
      "@type": "Question",
      "name": "What is the ELDT requirement for CDL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Since February 2022, FMCSA requires Entry Level Driver Training (ELDT) from a registered training provider before taking CDL skills tests. This includes theory and behind-the-wheel training from an FMCSA-registered school."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between CDL Class A and Class B?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Class A CDL allows you to drive combination vehicles (tractor-trailers) over 26,001 lbs with a towed unit over 10,000 lbs. Class B covers single vehicles over 26,001 lbs like buses and dump trucks. Class A offers more job opportunities and higher pay."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need a DOT physical to get my CDL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you must pass a DOT physical exam from a certified medical examiner. This exam checks your vision, hearing, blood pressure, and overall health. The medical certificate is valid for up to 2 years and must be renewed before expiration."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get my CDL with a DUI on my record?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A DUI doesn't automatically disqualify you from getting a CDL, but it can affect employment. Most carriers require a clean record for 3-7 years. If you have a DUI while holding a CDL, you'll face a 1-year disqualification (3 years for hazmat)."
      }
    }
  ]
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Get Your CDL License",
  "description": "Complete guide to obtaining your Commercial Driver's License",
  "totalTime": "P8W",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "3000-10000"
  },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Get Your CDL Learner's Permit",
      "text": "Study for and pass the CDL knowledge tests at your local DMV. This includes general knowledge and any endorsement tests you need.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Pass Your DOT Physical",
      "text": "Complete a physical examination with a certified medical examiner to obtain your DOT medical certificate.",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Complete ELDT Training",
      "text": "Enroll in and complete Entry Level Driver Training from an FMCSA-registered training provider.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Pass the CDL Skills Test",
      "text": "Take and pass the three-part CDL skills test: pre-trip inspection, basic controls, and road test.",
      "position": 4
    },
    {
      "@type": "HowToStep",
      "name": "Receive Your CDL",
      "text": "After passing all tests, receive your Commercial Driver's License from your state DMV.",
      "position": 5
    }
  ]
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Getting Your CDL", url: "https://crumsleasing.com/resources/guides/getting-your-cdl" },
]);

const GettingYourCDL = () => {
  const cdlClasses = [
    {
      class: "Class A",
      description: "Combination vehicles (tractor-trailers)",
      weight: "Over 26,001 lbs with towed unit over 10,000 lbs",
      examples: "18-wheelers, tankers, flatbeds, livestock carriers",
      earnings: "$50,000 - $80,000+ first year"
    },
    {
      class: "Class B",
      description: "Single vehicles or towing under 10,000 lbs",
      weight: "Over 26,001 lbs single vehicle",
      examples: "Buses, dump trucks, delivery trucks, concrete mixers",
      earnings: "$35,000 - $55,000 first year"
    },
    {
      class: "Class C",
      description: "Vehicles under 26,001 lbs with special cargo",
      weight: "Under 26,001 lbs",
      examples: "Hazmat vehicles, passenger vans (16+ passengers)",
      earnings: "$30,000 - $45,000 first year"
    }
  ];

  const trainingOptions = [
    {
      type: "Private CDL Schools",
      duration: "3-8 weeks",
      cost: "$3,000 - $10,000",
      pros: ["Faster completion", "Flexible schedules", "Job placement assistance"],
      cons: ["Higher upfront cost", "Quality varies by school"]
    },
    {
      type: "Community College Programs",
      duration: "8-16 weeks",
      cost: "$1,500 - $5,000",
      pros: ["Lower cost", "Financial aid available", "Comprehensive curriculum"],
      cons: ["Longer program", "Less flexible scheduling"]
    },
    {
      type: "Company-Sponsored Training",
      duration: "4-8 weeks",
      cost: "Free (with commitment)",
      pros: ["No upfront cost", "Guaranteed job", "Paid training period"],
      cons: ["1-2 year commitment required", "Limited carrier choice"]
    }
  ];

  const timeline = [
    { week: "Week 1", task: "Study for CLP, pass knowledge test, get DOT physical" },
    { week: "Weeks 2-5", task: "Complete ELDT classroom and behind-the-wheel training" },
    { week: "Week 6", task: "Practice for skills test, pre-trip inspection" },
    { week: "Week 7", task: "Take CDL skills test (pre-trip, basic controls, road test)" },
    { week: "Week 8", task: "Receive CDL, start job search or begin company orientation" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Get Your CDL License: Complete Guide for New Truck Drivers"
        description="Step-by-step guide to getting your Commercial Driver's License (CDL). Learn about CDL classes, ELDT requirements, DOT physicals, training costs, and timeline expectations."
        canonical="https://crumsleasing.com/resources/guides/getting-your-cdl"
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
              <GraduationCap className="h-12 w-12" />
            </div>
            <p className="text-sm uppercase tracking-wider mb-2 text-primary-foreground/80">New Driver Roadmap — Step 1 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Get Your CDL License
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Your complete roadmap to earning a Commercial Driver's License — from studying for your permit to passing your skills test and hitting the road.
            </p>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Quick Stats */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">4-10 Weeks</p>
              <p className="text-sm text-muted-foreground">Average Timeline</p>
            </div>
            <div>
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">$3K-$10K</p>
              <p className="text-sm text-muted-foreground">Training Cost</p>
            </div>
            <div>
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">21+</p>
              <p className="text-sm text-muted-foreground">Minimum Age (Interstate)</p>
            </div>
            <div>
              <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">$50K+</p>
              <p className="text-sm text-muted-foreground">First Year Earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A Commercial Driver's License (CDL) is your ticket to a career that offers independence, solid pay, and job security. Whether you want to drive for a company, lease equipment and work with brokers, or eventually run your own trucking business, everything starts with getting your CDL.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This guide walks you through every step of the process — from understanding CDL classes to completing Entry Level Driver Training (ELDT) and passing your skills test. By the end, you'll have a clear roadmap to get behind the wheel.
              </p>
            </div>

            {/* CDL Classes */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Truck className="h-6 w-6 text-primary" />
                CDL Classes Explained
              </h2>
              <p className="text-muted-foreground mb-6">
                There are three CDL classes, each allowing you to operate different types of commercial vehicles. Most over-the-road truckers get a Class A CDL for the best job opportunities.
              </p>
              <div className="space-y-4">
                {cdlClasses.map((cdl, index) => (
                  <Card key={index} className={index === 0 ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>{cdl.class} CDL</span>
                        {index === 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Most Common</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-foreground mb-2">{cdl.description}</p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">Weight:</span> {cdl.weight}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Examples:</span> {cdl.examples}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Earnings:</span> {cdl.earnings}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* ELDT Requirements */}
            <div className="mb-12 bg-muted/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-6 w-6 text-primary" />
                ELDT Requirements (Since 2022)
              </h2>
              <p className="text-muted-foreground mb-4">
                As of February 7, 2022, the FMCSA requires all new CDL applicants to complete <strong>Entry Level Driver Training (ELDT)</strong> from a registered training provider before taking their skills test.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-foreground">Theory Training</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Federal regulations and compliance</li>
                    <li>• Safe operating procedures</li>
                    <li>• Vehicle systems and inspections</li>
                    <li>• Hours of Service rules</li>
                  </ul>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-foreground">Behind-the-Wheel Training</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Range driving (backing, turning)</li>
                    <li>• Public road driving</li>
                    <li>• Pre-trip inspection practice</li>
                    <li>• Coupling and uncoupling (Class A)</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Find registered training providers at <a href="https://tpr.fmcsa.dot.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FMCSA Training Provider Registry</a>.
              </p>
            </div>

            {/* DOT Physical */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Heart className="h-6 w-6 text-primary" />
                DOT Physical Requirements
              </h2>
              <p className="text-muted-foreground mb-4">
                You must pass a DOT physical exam from a certified medical examiner before getting your CDL. The exam verifies you're physically capable of safely operating a commercial vehicle.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">What's Checked</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Vision (20/40 in each eye, with correction)</p>
                    <p>• Hearing (forced whisper at 5 feet)</p>
                    <p>• Blood pressure (≤140/90)</p>
                    <p>• Urinalysis (diabetes, drugs)</p>
                    <p>• Physical examination (heart, lungs, spine)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">What to Bring</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Driver's license</p>
                    <p>• List of current medications</p>
                    <p>• Glasses or contacts (if needed)</p>
                    <p>• Hearing aids (if used)</p>
                    <p>• Medical records for any conditions</p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Find certified medical examiners at <a href="https://nationalregistry.fmcsa.dot.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FMCSA National Registry</a>. Exams cost $50-$150.
              </p>
            </div>

            {/* Training Options */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <BookOpen className="h-6 w-6 text-primary" />
                CDL Training Options
              </h2>
              <div className="space-y-6">
                {trainingOptions.map((option, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                        <span>{option.type}</span>
                        <div className="flex gap-4 text-sm font-normal text-muted-foreground">
                          <span>{option.duration}</span>
                          <span className="text-primary font-medium">{option.cost}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Pros:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {option.pros.map((pro, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Cons:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {option.cons.map((con, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Clock className="h-6 w-6 text-primary" />
                Typical CDL Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/30"></div>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0 z-10">
                        {index + 1}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 flex-1">
                        <p className="font-semibold text-foreground">{item.week}</p>
                        <p className="text-muted-foreground text-sm">{item.task}</p>
                      </div>
                    </div>
                  ))}
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
                Once you have your CDL, it's time to find loads and start earning. The next guide in our New Driver Roadmap covers load boards — the platforms where owner-operators and carriers find freight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/resources/guides/load-boards-guide">
                    Next: Understanding Load Boards
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/guides">
                    View All Guides
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GettingYourCDL;
