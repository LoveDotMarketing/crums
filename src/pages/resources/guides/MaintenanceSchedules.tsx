import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Shield,
  Truck,
  CircleDot,
  Gauge,
  Lightbulb,
  FileCheck,
  CalendarDays,
  CalendarCheck
} from "lucide-react";

// Article metadata
const articleData = {
  title: "Trailer Maintenance Schedules: Keep Your Equipment Road-Ready",
  description: "Complete maintenance schedule guide for dry van and flatbed trailers. Daily, weekly, monthly, and annual inspection checklists to maximize uptime and prevent breakdowns.",
  publishedDate: "2026-01-29",
  updatedDate: "2026-01-29",
  readTime: "12 min read",
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
    "@id": "https://crumsleasing.com/resources/guides/maintenance-schedules"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How often should I inspect my trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trailers require daily pre-trip inspections before each use, weekly checks of key components like tires and brakes, monthly detailed inspections of all systems, and a comprehensive annual DOT inspection. Consistent maintenance prevents 80% of roadside breakdowns."
      }
    },
    {
      "@type": "Question",
      "name": "What maintenance is required for leased trailers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Leased trailer maintenance typically includes daily pre-trip inspections (driver responsibility), tire pressure checks, lighting verification, and reporting any issues promptly. Major repairs like brake replacements and annual DOT inspections are usually handled by the leasing company under full-service agreements."
      }
    },
    {
      "@type": "Question",
      "name": "How much does trailer maintenance cost per year?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Average annual maintenance costs for a semi-trailer range from $1,500 to $3,500 depending on age, mileage, and type. This includes tires ($1,200-2,400 for replacement), brakes ($300-800), lighting repairs ($50-200), and DOT inspection fees ($50-150). Preventive maintenance reduces these costs significantly."
      }
    },
    {
      "@type": "Question",
      "name": "What are the most common trailer maintenance issues?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The most common trailer maintenance issues are: tire problems (40% of roadside calls), lighting failures (25%), brake system issues (20%), and door/seal problems (10%). Regular inspection and timely repairs prevent most of these issues from becoming roadside emergencies."
      }
    },
    {
      "@type": "Question",
      "name": "When is the annual DOT inspection due?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Annual DOT inspections must be completed within 12 months of the previous inspection. The inspection sticker shows the month and year it expires. Operating with an expired inspection can result in fines up to $8,000 and out-of-service orders."
      }
    }
  ]
};

// HowTo Schema
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Trailer Maintenance Schedule",
  "description": "Step-by-step guide to establishing an effective maintenance schedule for commercial trailers.",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Establish Daily Checks",
      "text": "Create a daily pre-trip inspection routine covering tires, lights, brakes, and coupling equipment. Document findings before each trip."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Schedule Weekly Inspections",
      "text": "Set aside time each week for thorough tire pressure checks, brake inspections, and lighting system verification."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Plan Monthly Maintenance",
      "text": "Conduct comprehensive monthly inspections including lubrication, suspension check, floor inspection, and documentation review."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Track Annual Requirements",
      "text": "Schedule annual DOT inspections, wheel bearing service, and comprehensive brake overhaul before they're due."
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Maintenance Schedules", url: "https://crumsleasing.com/resources/guides/maintenance-schedules" }
]);

const guideNavigation = {
  previous: {
    title: "Trailer Specifications Guide",
    href: "/resources/guides/trailer-specifications"
  },
  next: {
    title: "Tire Care Guide",
    href: "/resources/guides/tire-care"
  }
};

// Maintenance schedule data
const dailyChecks = [
  { icon: CircleDot, title: "Tires", items: ["Visual inspection for damage", "Check for obvious low pressure", "Look for debris in tread"] },
  { icon: Lightbulb, title: "Lights", items: ["All marker lights working", "Brake lights functional", "Turn signals operational"] },
  { icon: Gauge, title: "Brakes", items: ["Air system builds pressure", "No audible air leaks", "Glad hands connected"] },
  { icon: FileCheck, title: "Coupling", items: ["Fifth wheel locked", "Landing gear raised", "Kingpin secure"] }
];

const weeklyChecks = [
  { icon: CircleDot, title: "Tires & Wheels", items: ["Measure tire pressure with gauge", "Check tread depth", "Inspect lug nuts for tightness", "Look for cracks in rims"] },
  { icon: Gauge, title: "Brakes", items: ["Check brake pad thickness", "Inspect slack adjusters", "Test parking brake", "Look for leaking seals"] },
  { icon: Shield, title: "Body & Frame", items: ["Inspect floor for damage", "Check sidewall panels", "Verify mud flaps secure", "Look for frame cracks"] }
];

const monthlyChecks = [
  { icon: Wrench, title: "Suspension", items: ["Inspect air bags/springs", "Check shock absorbers", "Lubricate pivot points", "Verify axle alignment"] },
  { icon: ClipboardCheck, title: "Doors & Seals", items: ["Test door operation", "Lubricate hinges", "Inspect weather seals", "Check latch mechanisms"] },
  { icon: Lightbulb, title: "Electrical", items: ["Test all light circuits", "Check wiring condition", "Inspect ABS system", "Verify ground connections"] },
  { icon: FileCheck, title: "Documentation", items: ["Update maintenance log", "Review inspection records", "Check registration expiry", "Verify insurance docs"] }
];

const annualRequirements = [
  { title: "DOT Annual Inspection", description: "Comprehensive FMCSA-compliant inspection by certified inspector", deadline: "Every 12 months" },
  { title: "Wheel Bearing Service", description: "Repack or replace wheel bearings, inspect seals", deadline: "12-24 months or 100,000 miles" },
  { title: "Brake Overhaul", description: "Replace brake shoes/pads, drums/rotors if needed", deadline: "Annually or as needed" },
  { title: "Tire Replacement", description: "Replace tires approaching 4/32\" tread depth", deadline: "Every 3-5 years typical" }
];

const MaintenanceSchedules = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/maintenance-schedules"
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
        article={{
          publishedTime: articleData.publishedDate,
          modifiedTime: articleData.updatedDate,
          section: "Equipment Knowledge",
          author: articleData.author
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Wrench className="h-3 w-3 mr-1" />
              Equipment Knowledge
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              A structured maintenance schedule prevents 80% of roadside breakdowns. Follow these daily, weekly, monthly, and annual checklists to maximize uptime and extend equipment life.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {articleData.readTime}
              </span>
              <span>•</span>
              <span>By <Link to={`/about/${articleData.authorSlug}`} className="underline hover:text-primary-foreground transition-colors">{articleData.author}</Link></span>
              <span>•</span>
              <span>Updated {new Date(articleData.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Quick Stats */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">80%</div>
              <div className="text-sm text-muted-foreground">Breakdowns preventable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$2,500</div>
              <div className="text-sm text-muted-foreground">Avg annual maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15 min</div>
              <div className="text-sm text-muted-foreground">Daily inspection time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12 mo</div>
              <div className="text-sm text-muted-foreground">DOT inspection cycle</div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Consistent trailer maintenance is the difference between profitable operations and costly downtime. Whether you're an owner-operator or managing a fleet, following a structured maintenance schedule protects your investment, prevents violations, and keeps you earning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This guide breaks down exactly what to inspect and when—from the 15-minute daily pre-trip to annual DOT requirements. Each checklist is designed for 53-foot dry vans and 48-foot flatbeds, the workhorses of the freight industry.
            </p>
          </div>
        </div>
      </section>

      {/* Daily Checks */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Daily Pre-Trip Checks</h2>
                <p className="text-muted-foreground">Before every trip • 15-20 minutes</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {dailyChecks.map((check, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <check.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{check.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {check.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Required by Law</p>
                  <p className="text-sm text-muted-foreground">FMCSA regulations (49 CFR 396.13) require drivers to inspect their vehicles before each trip. Failure to perform pre-trip inspections can result in fines and CSA points.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Checks */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Weekly Detailed Inspections</h2>
                <p className="text-muted-foreground">Every 7 days • 30-45 minutes</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {weeklyChecks.map((check, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/30 rounded-lg flex items-center justify-center">
                        <check.icon className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <CardTitle className="text-lg">{check.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {check.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                          {item}
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

      {/* Monthly Checks */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Monthly Comprehensive Maintenance</h2>
                <p className="text-muted-foreground">Every 30 days • 1-2 hours</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {monthlyChecks.map((check, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <check.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{check.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {check.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {item}
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

      {/* Annual Requirements */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Annual Requirements</h2>
                <p className="text-muted-foreground">Critical compliance deadlines</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {annualRequirements.map((req, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{req.title}</h3>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                      </div>
                      <Badge variant="outline" className="self-start md:self-center whitespace-nowrap">
                        {req.deadline}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Don't Miss Your DOT Inspection</p>
                  <p className="text-sm text-muted-foreground">Operating with an expired annual inspection sticker can result in fines up to $8,000 and immediate out-of-service orders. Schedule your inspection 30 days before expiration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{faq.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.acceptedAnswer.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-foreground">Related Equipment Guides</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/resources/guides/pre-trip-inspection" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <ClipboardCheck className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Pre-Trip Inspection Checklist</h4>
                    <p className="text-sm text-muted-foreground">Interactive daily inspection guide</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/resources/guides/tire-care" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <CircleDot className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Tire Care Guide</h4>
                    <p className="text-sm text-muted-foreground">Complete tire maintenance guide</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/resources/guides/trailer-specifications" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <Truck className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Trailer Specifications</h4>
                    <p className="text-sm text-muted-foreground">Dimensions and capacity reference</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Navigation */}
      <section className="py-8 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between gap-4">
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
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Let Us Handle the Maintenance
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-primary-foreground/90">
            CRUMS Leasing provides well-maintained trailers ready for the road. Focus on hauling—we'll handle the upkeep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/get-started">Get a Trailer Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/resources/guides">
                <BookOpen className="h-4 w-4 mr-2" />
                More Equipment Guides
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaintenanceSchedules;
