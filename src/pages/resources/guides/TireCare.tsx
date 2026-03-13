import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GuideRelatedContent } from "@/components/GuideRelatedContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Gauge,
  CircleDot,
  Ruler,
  ThermometerSun,
  DollarSign,
  Shield,
  TrendingUp
} from "lucide-react";

// Article metadata
const articleData = {
  title: "Commercial Trailer Tire Care & Inspection Guide",
  description: "Complete guide to trailer tire maintenance, inspection, pressure, tread depth, and replacement timing. Prevent blowouts and maximize tire life.",
  publishedDate: "2026-01-29",
  updatedDate: "2026-01-29",
  readTime: "10 min read",
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
    "@id": "https://crumsleasing.com/resources/guides/tire-care"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the correct tire pressure for semi-trailer tires?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most semi-trailer tires require 95-110 PSI when cold, though the exact specification is printed on the tire sidewall. Always check pressure before driving when tires are cold (driven less than 1 mile). Underinflation by 20% can reduce tire life by 30%."
      }
    },
    {
      "@type": "Question",
      "name": "What is the minimum legal tread depth for trailer tires?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FMCSA regulations require a minimum of 2/32\" tread depth for trailer tires in any major groove. However, most experts recommend replacing trailer tires at 4/32\" for safety, especially for highway driving. Steer tires on the truck require 4/32\" minimum by law."
      }
    },
    {
      "@type": "Question",
      "name": "How often should I check trailer tire pressure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check tire pressure before every trip (daily if in regular use) and whenever temperature changes significantly. A 10°F temperature change causes roughly 1 PSI change in tire pressure. Weekly calibrated gauge checks are essential for accuracy."
      }
    },
    {
      "@type": "Question",
      "name": "How long do semi-trailer tires last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Semi-trailer tires typically last 3-5 years or 50,000-100,000 miles depending on load weights, road conditions, and maintenance. Age matters too—tires older than 6 years should be inspected carefully or replaced, regardless of tread depth."
      }
    },
    {
      "@type": "Question",
      "name": "What causes trailer tire blowouts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The leading causes of trailer tire blowouts are: underinflation (40% of failures), overloading (25%), road hazard damage (20%), and age/dry rot (15%). Regular pressure checks and pre-trip inspections prevent most blowouts."
      }
    }
  ]
};

// HowTo Schema
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Inspect Commercial Trailer Tires",
  "description": "Step-by-step guide to performing a thorough trailer tire inspection.",
  "totalTime": "PT15M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Check Tire Pressure",
      "text": "Using a calibrated gauge, check each tire's pressure when cold. Compare to sidewall specification (typically 95-110 PSI). Adjust as needed."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Measure Tread Depth",
      "text": "Insert a tread depth gauge into the main grooves. Minimum legal depth is 2/32\", but replace at 4/32\" for safety. Check multiple points across the tread."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Inspect Sidewalls",
      "text": "Look for cuts, bulges, cracks, or weathering on both inner and outer sidewalls. Any bulge indicates internal damage—replace immediately."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Check for Wear Patterns",
      "text": "Uneven wear indicates alignment, suspension, or inflation issues. Center wear = overinflation. Edge wear = underinflation. One-sided wear = alignment."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Verify Valve Stems",
      "text": "Ensure valve stems are straight, have caps, and are not cracked or leaking. Replace damaged stems immediately."
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Tire Care Guide", url: "https://crumsleasing.com/resources/guides/tire-care" }
]);

const guideNavigation = {
  previous: {
    title: "Maintenance Schedules",
    href: "/resources/guides/maintenance-schedules"
  },
  next: {
    title: "Pre-Trip Inspection",
    href: "/resources/guides/pre-trip-inspection"
  }
};

// Tire specs data
const tireSpecifications = [
  { label: "Standard Size", value: "295/75R22.5 or 11R22.5", note: "Most common for trailers" },
  { label: "Recommended Pressure", value: "95-110 PSI", note: "Check sidewall for exact spec" },
  { label: "Legal Tread Minimum", value: "2/32\"", note: "Replace at 4/32\" for safety" },
  { label: "Maximum Age", value: "6 years", note: "From DOT manufacture date" },
  { label: "Expected Mileage", value: "50,000-100,000 mi", note: "Varies by conditions" }
];

const pressureChart = [
  { condition: "Cold (< 1 mile driven)", action: "Check and adjust to spec", icon: Gauge },
  { condition: "Hot (highway driving)", action: "Expect 10-15 PSI higher—don't release", icon: ThermometerSun },
  { condition: "Temperature drop 20°F", action: "Pressure drops ~2 PSI—recheck", icon: ThermometerSun },
  { condition: "Heavy load", action: "Ensure maximum rated pressure", icon: TrendingUp }
];

const wearPatterns = [
  { pattern: "Center wear", cause: "Overinflation", fix: "Reduce pressure to specification" },
  { pattern: "Edge wear (both sides)", cause: "Underinflation", fix: "Increase pressure to specification" },
  { pattern: "One-sided wear", cause: "Alignment issue", fix: "Have axle alignment checked" },
  { pattern: "Cupping/scalloping", cause: "Suspension problem", fix: "Inspect shocks and bearings" },
  { pattern: "Flat spots", cause: "Brake lock-up", fix: "Replace tire, check brakes" }
];

const inspectionChecklist = [
  { category: "Pressure", items: ["Check with calibrated gauge when cold", "Compare to sidewall spec", "All tires on axle within 5 PSI of each other"] },
  { category: "Tread", items: ["Minimum 2/32\" in all major grooves", "Even wear across tread face", "No foreign objects embedded"] },
  { category: "Sidewalls", items: ["No cuts deeper than 1/16\"", "No bulges or bubbles", "No dry rot or cracking"] },
  { category: "Hardware", items: ["All lug nuts present and tight", "Valve stems straight with caps", "No cracks in rims or wheels"] }
];

const TireCare = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/tire-care"
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
              <CircleDot className="h-3 w-3 mr-1" />
              Equipment Knowledge
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Tires account for 40% of roadside service calls. Learn proper inspection, pressure management, and replacement timing to prevent blowouts and maximize tire life.
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
              <div className="text-3xl font-bold text-primary">40%</div>
              <div className="text-sm text-muted-foreground">Of roadside calls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$400-600</div>
              <div className="text-sm text-muted-foreground">Per tire cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2/32"</div>
              <div className="text-sm text-muted-foreground">Legal minimum tread</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100 PSI</div>
              <div className="text-sm text-muted-foreground">Typical pressure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your trailer rides on eight tires that carry tens of thousands of pounds mile after mile. A single blowout can cost you a load, damage cargo, or cause an accident. Yet tire failures are almost entirely preventable with proper maintenance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This guide covers everything you need to know about commercial trailer tire care—from daily pressure checks to reading wear patterns that signal suspension problems. Whether you own your equipment or lease from CRUMS, these practices protect your investment and your safety.
            </p>
          </div>
        </div>
      </section>

      {/* Tire Specifications */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">Trailer Tire Specifications</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tireSpecifications.map((spec, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{spec.label}</div>
                    <div className="text-xl font-bold text-foreground">{spec.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{spec.note}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pressure Management */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Gauge className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tire Pressure Management</h2>
                <p className="text-muted-foreground">The #1 factor in tire longevity</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {pressureChart.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{item.condition}</div>
                        <div className="text-sm text-muted-foreground">{item.action}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Underinflation is a Silent Killer</p>
                  <p className="text-sm text-muted-foreground">A tire running 20% under specification loses 30% of its life expectancy. The tire flexes more, generates heat, and weakens the internal structure—often without visible signs until it's too late.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wear Patterns */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Ruler className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Reading Wear Patterns</h2>
                <p className="text-muted-foreground">What your tires are telling you</p>
              </div>
            </div>

            <div className="space-y-4">
              {wearPatterns.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="font-semibold text-foreground">{item.pattern}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Cause: </span>
                        <span className="text-sm font-medium text-foreground">{item.cause}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{item.fix}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inspection Checklist */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tire Inspection Checklist</h2>
                <p className="text-muted-foreground">What to check every trip</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {inspectionChecklist.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
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

      {/* Cost of Neglect */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">The Real Cost of Tire Neglect</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Blowout Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roadside service call</span>
                    <span className="font-semibold">$150-400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New tire + installation</span>
                    <span className="font-semibold">$400-600</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lost time (4-6 hours)</span>
                    <span className="font-semibold">$200-500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fender/trailer damage</span>
                    <span className="font-semibold">$500-2,000+</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total per incident</span>
                    <span className="text-destructive">$1,250-3,500+</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Prevention Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality tire gauge</span>
                    <span className="font-semibold">$25 (one-time)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tread depth gauge</span>
                    <span className="font-semibold">$10 (one-time)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily check time</span>
                    <span className="font-semibold">5 min/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled replacement</span>
                    <span className="font-semibold">$400-500/tire</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Annual savings</span>
                    <span className="text-primary">$1,000-5,000+</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
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
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-foreground">Related Equipment Guides</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/resources/guides/maintenance-schedules" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <Wrench className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Maintenance Schedules</h4>
                    <p className="text-sm text-muted-foreground">Complete maintenance timeline</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/resources/guides/pre-trip-inspection" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <Shield className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Pre-Trip Inspection</h4>
                    <p className="text-sm text-muted-foreground">Interactive daily checklist</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/resources/guides/trailer-specifications" className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary">
                  <CardContent className="p-4">
                    <Ruler className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Trailer Specifications</h4>
                    <p className="text-sm text-muted-foreground">Dimensions and capacity guide</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Navigation */}
      <section className="py-8 bg-background border-t">
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
            Ready for Road-Ready Equipment?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-primary-foreground/90">
            CRUMS Leasing trailers come with properly maintained tires and regular inspections. Focus on driving—we handle the upkeep.
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

      <GuideRelatedContent currentSlug="tire-care" />
      <Footer />
    </div>
  );
};

export default TireCare;
