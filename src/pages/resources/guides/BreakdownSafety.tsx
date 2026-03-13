import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Shield,
  MapPin,
  Flashlight,
  Car,
  Triangle,
  Wrench,
  FileText,
  Users,
  Radio,
  PhoneCall,
  Navigation2,
  Package,
  Truck
} from "lucide-react";

// Article metadata
const articleData = {
  title: "How to Handle a Breakdown Safely",
  description: "Step-by-step emergency guide for truck breakdowns. Learn safety protocols, who to call first, and how CRUMS Leasing supports carriers through roadside emergencies.",
  publishedDate: "2026-02-04",
  updatedDate: "2026-02-04",
  readTime: "8 min read",
  author: "Eric",
  authorSlug: "eric"
};

// Structured data for SEO
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": articleData.title,
  "description": articleData.description,
  "datePublished": articleData.publishedDate,
  "dateModified": articleData.updatedDate,
  "author": {
    "@type": "Person",
    "name": "Eric",
    "url": "https://crumsleasing.com/about/eric",
    "jobTitle": "CEO / Principal"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://crumsleasing.com/resources/guides/breakdown-safety"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What should I do first when my truck breaks down on the highway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Activate your hazard lights immediately and safely maneuver to the right shoulder or nearest safe area. If possible, get completely off the roadway. Once stopped, set your parking brake and place reflective triangles at 10 feet, 100 feet, and 200 feet behind your vehicle."
      }
    },
    {
      "@type": "Question",
      "name": "Who should I call first during a truck breakdown?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Call 911 if there's any danger to yourself or others. Otherwise, contact roadside assistance first, then notify your leasing company (CRUMS Leasing at 888-570-4564), and finally inform your dispatcher about delays."
      }
    },
    {
      "@type": "Question",
      "name": "How long should I wait inside my truck after a breakdown?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If your truck is safely positioned on the shoulder and you can exit safely from the passenger side away from traffic, you may exit to place triangles. However, if traffic is heavy or visibility is poor, it may be safer to stay inside with your seatbelt on until help arrives."
      }
    },
    {
      "@type": "Question",
      "name": "What emergency equipment should I keep in my truck?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Essential emergency equipment includes: 3 reflective triangles (DOT requirement), high-visibility vest, flashlight with extra batteries, first aid kit, fire extinguisher (5 lb minimum), basic tools, jumper cables, water and non-perishable snacks, warm blankets, and a charged phone backup battery."
      }
    },
    {
      "@type": "Question",
      "name": "Does CRUMS Leasing help with trailer breakdowns?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CRUMS Leasing provides 24/7 emergency support for leased trailers at (888) 570-4564. Services include roadside assistance coordination, replacement trailer arrangement when needed, and GPS location sharing for faster response."
      }
    }
  ]
};

// HowTo Schema
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Safely Handle a Truck Breakdown",
  "description": "Step-by-step emergency procedure for truck drivers experiencing a roadside breakdown.",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Activate Hazard Lights",
      "text": "Turn on your four-way flashers immediately when you notice a problem. This alerts other drivers to your situation."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Move to Safety",
      "text": "Safely maneuver to the right shoulder, exit ramp, or rest area. Get as far off the roadway as possible. Avoid stopping on curves or hills."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Secure the Vehicle",
      "text": "Set your parking brake. If safe to exit, put on your high-visibility vest before leaving the cab."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Place Warning Triangles",
      "text": "Set reflective triangles at 10 feet, 100 feet, and 200 feet behind your vehicle. On curves, place one at the curve beginning."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Make Emergency Calls",
      "text": "Call 911 if in danger. Then call roadside assistance, your leasing company (CRUMS: 888-570-4564), and your dispatcher."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Document the Situation",
      "text": "Take photos of your location, mile markers, and any visible damage. Note the time and circumstances for insurance."
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Breakdown Safety", url: "https://crumsleasing.com/resources/guides/breakdown-safety" }
]);

const guideNavigation = {
  previous: {
    title: "Pre-Trip Inspection",
    href: "/resources/guides/pre-trip-inspection"
  },
  next: {
    title: "Tire Care Guide",
    href: "/resources/guides/tire-care"
  }
};

// Emergency contact priority list
const emergencyContacts = [
  { 
    priority: 1, 
    name: "911", 
    when: "If there's immediate danger, injuries, or fire", 
    icon: Phone,
    color: "bg-destructive text-destructive-foreground"
  },
  { 
    priority: 2, 
    name: "Roadside Assistance", 
    when: "For mechanical service or towing", 
    icon: Wrench,
    color: "bg-primary text-primary-foreground"
  },
  { 
    priority: 3, 
    name: "CRUMS Leasing: (888) 570-4564", 
    when: "For trailer issues, replacement coordination", 
    icon: Truck,
    color: "bg-secondary text-secondary-foreground"
  },
  { 
    priority: 4, 
    name: "Your Dispatcher", 
    when: "For load status and ETA updates", 
    icon: Radio,
    color: "bg-muted text-muted-foreground"
  }
];

// Immediate safety steps
const immediateSteps = [
  {
    step: 1,
    title: "Hazard Lights ON",
    description: "Activate four-way flashers immediately—even before you fully stop.",
    icon: Flashlight
  },
  {
    step: 2,
    title: "Move to Safety",
    description: "Steer to the right shoulder, exit ramp, or rest area. Get completely off the road if possible.",
    icon: Car
  },
  {
    step: 3,
    title: "Secure & Protect",
    description: "Set parking brake, put on high-vis vest, exit from passenger side if safe.",
    icon: Shield
  },
  {
    step: 4,
    title: "Place Triangles",
    description: "Set at 10 ft, 100 ft, and 200 ft behind your truck. Required by DOT.",
    icon: Triangle
  }
];

// Emergency kit essentials
const emergencyKit = [
  { category: "Safety", items: ["3 reflective triangles (DOT required)", "High-visibility vest", "Flashlight + extra batteries", "LED road flares", "First aid kit", "Fire extinguisher (5 lb ABC)"] },
  { category: "Tools", items: ["Basic socket set", "Screwdrivers (flat & Phillips)", "Pliers and adjustable wrench", "Jumper cables", "Tire pressure gauge", "Duct tape and zip ties"] },
  { category: "Survival", items: ["2 gallons drinking water", "Non-perishable snacks", "Warm blanket", "Rain gear", "Charged phone backup battery", "Paper maps (backup to GPS)"] },
  { category: "Documentation", items: ["Insurance cards", "Registration documents", "Emergency contact list", "Lease agreement copy", "Pen and notepad for notes", "Camera (phone works)"] }
];

// Common breakdown scenarios
const breakdownScenarios = [
  {
    problem: "Flat Tire",
    doThis: "Pull to safe area, engage hazards, place triangles. Call for tire service—do not attempt to change trailer tires roadside.",
    dontDo: "Never attempt to change a tire on the traffic side of your vehicle."
  },
  {
    problem: "Engine Overheating",
    doThis: "Turn off A/C, turn on heater to dissipate heat. Pull over safely. Let engine cool 30+ minutes before opening hood.",
    dontDo: "Never open the radiator cap while hot—steam can cause severe burns."
  },
  {
    problem: "Brake Failure",
    doThis: "Downshift gradually, use engine braking. Apply parking brake slowly. Aim for uphill grade or soft shoulder if needed.",
    dontDo: "Don't pump ABS brakes rapidly. Don't turn off the engine—you'll lose power steering."
  },
  {
    problem: "Electrical Issues",
    doThis: "Check battery connections first. If lights fail at night, pull over immediately and wait for daylight or assistance.",
    dontDo: "Don't continue driving without working lights—it's illegal and extremely dangerous."
  }
];

// CRUMS support features
const crumsSupport = [
  {
    feature: "24/7 Emergency Line",
    description: "Reach our team anytime at (888) 570-4564 for immediate assistance with leased trailers.",
    icon: PhoneCall
  },
  {
    feature: "Replacement Trailer Coordination",
    description: "If your trailer is disabled, we'll coordinate a replacement to keep your freight moving.",
    icon: Truck
  },
  {
    feature: "GPS Location Sharing",
    description: "Share your exact location through your phone so help arrives faster.",
    icon: Navigation2
  },
  {
    feature: "Roadside Partner Network",
    description: "We work with trusted service providers across Texas for faster response times.",
    icon: Users
  }
];

const BreakdownSafety = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/breakdown-safety"
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
        article={{
          publishedTime: articleData.publishedDate,
          modifiedTime: articleData.updatedDate,
          section: "Safety & Operations",
          author: articleData.author
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-destructive via-destructive to-destructive/90 text-destructive-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Emergency Guide
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-destructive-foreground/90 mb-8 max-w-3xl mx-auto">
              A breakdown on the highway is stressful—but staying calm and following the right steps keeps you safe. This guide covers exactly what to do, who to call, and how CRUMS Leasing supports you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-destructive-foreground/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {articleData.readTime}
              </span>
              <span>•</span>
              <span>By <Link to={`/about/${articleData.authorSlug}`} className="underline hover:text-destructive-foreground transition-colors">{articleData.author}</Link></span>
              <span>•</span>
              <span>Updated {new Date(articleData.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Emergency Banner */}
      <section className="py-6 bg-destructive/10 border-b border-destructive/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <Phone className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-bold text-lg text-foreground">In an emergency? Call 911 first.</p>
              <p className="text-muted-foreground">For CRUMS trailer support: <a href="tel:+18885704564" className="font-semibold text-primary hover:underline">(888) 570-4564</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Immediate Safety Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-destructive-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Immediate Safety Steps</h2>
                <p className="text-muted-foreground">Do these FIRST—before making any calls</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {immediateSteps.map((step) => (
                <Card key={step.step} className="hover:shadow-md transition-shadow border-l-4 border-l-destructive">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-destructive">{step.step}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <step.icon className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Triangle Placement is Law</p>
                  <p className="text-sm text-muted-foreground">FMCSR 392.22 requires reflective triangles within 10 minutes of stopping. Placement: 10 feet, 100 feet, and 200 feet behind your vehicle. On curves or hills, place additional triangles where they'll be seen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Priority */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Who to Call & When</h2>
                <p className="text-muted-foreground">Follow this priority order</p>
              </div>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <Card key={contact.priority} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${contact.color}`}>
                        <span className="text-lg font-bold">{contact.priority}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <contact.icon className="h-5 w-5 text-foreground" />
                          <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
                        </div>
                        <p className="text-muted-foreground">{contact.when}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CRUMS Support Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">CRUMS Leasing Support</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How We Help During Breakdowns</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                When you lease from CRUMS, you're never alone on the road. Our team provides around-the-clock support to get you moving again.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {crumsSupport.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">{item.feature}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="lg" className="gap-2">
                <a href="tel:+18885704564">
                  <Phone className="h-5 w-5" />
                  Call CRUMS: (888) 570-4564
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Common Breakdown Scenarios */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Common Breakdown Scenarios</h2>
                <p className="text-muted-foreground">Quick reference for specific situations</p>
              </div>
            </div>

            <div className="space-y-4">
              {breakdownScenarios.map((scenario, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-4">{scenario.problem}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Do This:</p>
                          <p className="text-muted-foreground text-sm">{scenario.doThis}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Don't Do:</p>
                          <p className="text-muted-foreground text-sm">{scenario.dontDo}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Kit Checklist */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Emergency Kit Essentials</h2>
                <p className="text-muted-foreground">Keep these in your truck at all times</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {emergencyKit.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              {faqSchema.mainEntity.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.name}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Guide Navigation */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button asChild variant="outline" className="gap-2">
                <Link to={guideNavigation.previous.href}>
                  <ArrowLeft className="h-4 w-4" />
                  {guideNavigation.previous.title}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to={guideNavigation.next.href}>
                  {guideNavigation.next.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Lease with Confidence
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              When you lease from CRUMS, you get more than a trailer—you get a partner who's there when things go wrong. Our 24/7 support ensures you're never stranded.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/get-started">
                  Get Started Today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <GuideRelatedContent currentSlug="breakdown-safety" />
      <Footer />
    </div>
  );
};

export default BreakdownSafety;
