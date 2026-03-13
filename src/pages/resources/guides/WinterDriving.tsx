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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Snowflake,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  AlertTriangle,
  Phone,
  CheckCircle2,
  ThermometerSnowflake,
  Eye,
  Fuel,
  Wrench,
  Shield,
  MapPin,
  Car,
  Gauge,
  PackageCheck,
  Lightbulb,
  Mountain,
  Wind
} from "lucide-react";

// Article metadata
const articleData = {
  title: "How to Handle Winter Roads Like a Pro",
  description: "Essential winter driving tips for truck drivers. Learn how to handle snow, black ice, and extreme cold while staying safe and avoiding breakdowns on winter roads.",
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
    "@id": "https://crumsleasing.com/resources/guides/winter-driving"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do you identify black ice on the road?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Black ice is nearly invisible because it's a thin, transparent layer of ice on pavement. Watch for glossy or wet-looking patches on otherwise dry roads, especially on bridges, overpasses, shaded areas, and during temperatures near 32°F. If spray stops coming from other vehicles' tires on wet-looking roads, it may be ice."
      }
    },
    {
      "@type": "Question",
      "name": "What speed should trucks travel in snow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Reduce your speed by at least one-third in light snow and by half or more in heavy snow. On icy roads, travel at 25-35 mph maximum regardless of posted speed limits. The key is maintaining a speed where you can stop safely within your sight distance."
      }
    },
    {
      "@type": "Question",
      "name": "How much following distance is needed in winter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Increase following distance to 8-10 seconds minimum in winter conditions, compared to the normal 4-5 seconds. On ice, you may need 15+ seconds of following distance. Your stopping distance can be 10x longer on ice than on dry pavement."
      }
    },
    {
      "@type": "Question",
      "name": "Should you use engine brakes on ice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Disable your engine brake (Jake brake) on ice and snow. Engine braking can cause the drive wheels to lock up and lead to jackknifing. Use gentle, steady pressure on the service brakes instead and downshift slowly."
      }
    },
    {
      "@type": "Question",
      "name": "What emergency supplies should trucks carry in winter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Essential winter supplies include: extra blankets or sleeping bag, non-perishable food and water, flashlight with extra batteries, jumper cables, tire chains (where legal/required), ice scraper and snow brush, bag of sand or cat litter for traction, extra windshield washer fluid rated for -20°F, warm clothing and gloves, and a fully charged phone with emergency numbers."
      }
    }
  ]
};

// HowTo Schema for rich snippets
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Drive a Semi-Truck Safely in Winter Conditions",
  "description": "Professional winter driving techniques for commercial truck drivers to navigate snow, ice, and extreme cold safely.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Prepare Your Equipment",
      "text": "Check tire pressure (cold weather drops PSI), antifreeze levels, diesel fuel treatment for gelling prevention, and ensure all lights and wipers are fully functional."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Check Weather and Road Conditions",
      "text": "Monitor weather forecasts and road condition reports. Plan your route to avoid mountain passes during storms when possible. Know chain-up locations in advance."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Reduce Speed Appropriately",
      "text": "Slow down by one-third to one-half of your normal speed. The posted limit is for ideal conditions—winter roads are not ideal conditions."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Increase Following Distance",
      "text": "Maintain 8-10 seconds minimum following distance in snow, and 15+ seconds on ice. This gives you time to brake gradually without jackknifing."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Use Proper Braking Technique",
      "text": "Disable engine brakes on ice. Apply service brakes gently and steadily. If wheels start to lock, ease off and reapply. Threshold braking is safer than ABS activation on ice."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Handle Slides Correctly",
      "text": "If the trailer starts to slide, stay off the brakes and steer gently in the direction you want to go. Accelerating slightly can help straighten the trailer."
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Winter Driving Tips", url: "https://crumsleasing.com/resources/guides/winter-driving" }
]);

const guideNavigation = {
  previous: {
    title: "Pre-Trip Inspection Checklist",
    href: "/resources/guides/pre-trip-inspection"
  },
  next: {
    title: "How to Budget as a Truck Driver",
    href: "/resources/guides/budgeting"
  }
};

interface TipCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}

const TipCard = ({ icon: Icon, title, children, variant = "default" }: TipCardProps) => {
  const bgColors = {
    default: "bg-muted/50",
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
  };
  
  const iconColors = {
    default: "text-primary",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400"
  };

  return (
    <Card className={`${bgColors[variant]} border`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
};

const WinterDriving = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/winter-driving"
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
        article={{
          publishedTime: articleData.publishedDate,
          modifiedTime: articleData.updatedDate,
          section: "Industry Guides",
          author: articleData.author
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-900 via-primary to-primary/90 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Snowflake className="h-3 w-3 mr-1" />
              Safety Guide
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Driving tips for snow, black ice awareness, and emergency prep — plus how CRUMS Leasing maintains equipment for winter safety.
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

      {/* Main Content */}
      <article className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Critical Warning */}
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Winter Driving is Serious</AlertTitle>
              <AlertDescription>
                According to the Federal Highway Administration, 24% of weather-related crashes occur on snowy, slushy, or icy pavement. 
                Taking shortcuts in winter can cost your life, your load, or your career. Slow down and stay alert.
              </AlertDescription>
            </Alert>

            {/* Table of Contents */}
            <Card className="mb-12 bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  What's in This Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <a href="#pre-trip-prep" className="flex items-center gap-2 text-primary hover:underline">
                    <CheckCircle2 className="h-4 w-4" />
                    Pre-Trip Winter Preparation
                  </a>
                  <a href="#black-ice" className="flex items-center gap-2 text-primary hover:underline">
                    <Eye className="h-4 w-4" />
                    Identifying & Handling Black Ice
                  </a>
                  <a href="#driving-techniques" className="flex items-center gap-2 text-primary hover:underline">
                    <Car className="h-4 w-4" />
                    Safe Driving Techniques
                  </a>
                  <a href="#emergency-prep" className="flex items-center gap-2 text-primary hover:underline">
                    <PackageCheck className="h-4 w-4" />
                    Emergency Preparedness
                  </a>
                  <a href="#fuel-gelling" className="flex items-center gap-2 text-primary hover:underline">
                    <Fuel className="h-4 w-4" />
                    Preventing Fuel Gel
                  </a>
                  <a href="#crums-support" className="flex items-center gap-2 text-primary hover:underline">
                    <Shield className="h-4 w-4" />
                    How CRUMS Supports You
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Section 1: Pre-Trip Preparation */}
            <section id="pre-trip-prep" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Wrench className="h-7 w-7 text-primary" />
                Pre-Trip Winter Preparation
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Winter demands extra attention during your pre-trip inspection. Cold weather affects every system on your truck and trailer differently, and what works fine in summer can fail in freezing temperatures.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <TipCard icon={Gauge} title="Check Tire Pressure">
                  <p>Tire pressure drops about 1 PSI for every 10°F temperature drop. A tire that was properly inflated at 70°F can be 4-5 PSI low when it's 20°F outside. Check pressure when tires are cold.</p>
                </TipCard>

                <TipCard icon={ThermometerSnowflake} title="Antifreeze Levels">
                  <p>Verify your antifreeze is rated for the temperatures you'll encounter. A 50/50 mix protects to -34°F. If you're heading into extreme cold, consider a 60/40 antifreeze-to-water ratio.</p>
                </TipCard>

                <TipCard icon={Eye} title="Lights & Visibility">
                  <p>Clean all lights and mirrors before every trip. Snow and salt buildup can reduce visibility and make your trailer harder to see. Carry extra washer fluid rated for -20°F or colder.</p>
                </TipCard>

                <TipCard icon={Fuel} title="Fuel Treatment">
                  <p>Add diesel anti-gel treatment before temperatures drop below 20°F. Once fuel starts gelling, treatment won't reverse it. Prevention is the only solution.</p>
                </TipCard>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-3">Winter Pre-Trip Checklist Additions:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Brake pads/drums — ensure no ice buildup overnight
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Air tanks — drain moisture to prevent freeze-ups
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Windshield wipers — check for cracks or stiffness from cold
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Fuel filters — water in fuel can freeze and block lines
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      DEF tank — ensure adequate level (DEF freezes at 12°F)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Tire chains — verify you have the right size and they're intact
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* Section 2: Black Ice */}
            <section id="black-ice" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Eye className="h-7 w-7 text-primary" />
                Identifying & Handling Black Ice
              </h2>
              
              <Alert variant="default" className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-400">The Invisible Danger</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Black ice isn't actually black—it's transparent, which makes it nearly invisible on asphalt. It forms when temperatures hover around 32°F and moisture freezes into a thin, clear sheet.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold text-foreground mb-4">Where Black Ice Forms</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <TipCard icon={Mountain} title="Bridges & Overpasses" variant="warning">
                  <p>These freeze first because cold air circulates above and below. Treat every bridge as potentially icy when temps are near freezing.</p>
                </TipCard>

                <TipCard icon={MapPin} title="Shaded Areas" variant="warning">
                  <p>Sections of road shaded by trees, buildings, or hills stay frozen long after sunny areas have thawed. Mornings are especially dangerous.</p>
                </TipCard>

                <TipCard icon={Wind} title="Intersection Approaches" variant="warning">
                  <p>Vehicle exhaust and packed snow can create ice patches at intersections. Approach slowly and brake early.</p>
                </TipCard>

                <TipCard icon={ThermometerSnowflake} title="Early Morning Hours" variant="warning">
                  <p>Between 4-8 AM is peak black ice time. Roads that were wet from melting during the day refreeze overnight.</p>
                </TipCard>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">How to Spot Black Ice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Watch other vehicles:</strong> If spray stops coming off tires on what looks like a wet road, it's probably ice.</p>
                  <p><strong className="text-foreground">Look for a gloss:</strong> Black ice often has a slightly darker, glossier appearance than surrounding pavement.</p>
                  <p><strong className="text-foreground">Check your outside temp:</strong> If it's 28-36°F and the road looks wet, assume it could be ice.</p>
                  <p><strong className="text-foreground">Feel your steering:</strong> If your steering suddenly feels light or loose, you may be on ice.</p>
                </CardContent>
              </Card>

              <TipCard icon={AlertTriangle} title="If You Hit Black Ice" variant="danger">
                <ul className="space-y-2 mt-2">
                  <li><strong>Don't panic.</strong> Sudden movements make things worse.</li>
                  <li><strong>Don't brake.</strong> Take your foot off the accelerator and coast.</li>
                  <li><strong>Don't overcorrect.</strong> Keep your steering wheel pointed straight ahead.</li>
                  <li><strong>Wait it out.</strong> Black ice patches are usually short. You'll regain traction.</li>
                </ul>
              </TipCard>
            </section>

            <Separator className="my-12" />

            {/* Section 3: Driving Techniques */}
            <section id="driving-techniques" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Car className="h-7 w-7 text-primary" />
                Safe Winter Driving Techniques
              </h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-primary" />
                      Speed Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Posted speed limits are for ideal conditions. Winter roads are not ideal.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong>Light snow:</strong> Reduce speed by at least 1/3</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong>Heavy snow:</strong> Reduce speed by half or more</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong>Icy roads:</strong> Maximum 25-35 mph regardless of posted limits</span>
                      </li>
                    </ul>
                    <p className="text-xs italic">Remember: You can be ticketed for driving too fast for conditions even if you're under the speed limit.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Following Distance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Your stopping distance increases dramatically on winter roads:</p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p><strong>Dry pavement:</strong> 4-5 seconds following distance</p>
                      <p><strong>Wet or packed snow:</strong> 8-10 seconds minimum</p>
                      <p><strong>Ice:</strong> 15+ seconds — stopping can take 10x longer</p>
                    </div>
                    <p className="mt-3">Don't tailgate. If the vehicle ahead brakes suddenly, you need room to stop gradually without jackknifing.</p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      Engine Brakes on Ice — DON'T
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-semibold mb-2">Disable your Jake brake on ice and snow.</p>
                    <p>Engine braking can cause drive wheels to lock up, leading to jackknifing. Use gentle, steady pressure on service brakes instead. Downshift slowly and let the truck slow itself naturally.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Handling Slides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p><strong>If the trailer starts to slide:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>Stay off the brakes — braking makes it worse</li>
                      <li>Steer gently in the direction you want to go</li>
                      <li>Accelerating slightly can help straighten the trailer</li>
                      <li>Once straightened, gradually reduce speed</li>
                    </ol>
                    <p className="mt-3"><strong>If the tractor starts to slide:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>Take your foot off the accelerator</li>
                      <li>Steer in the direction of the skid (if the rear slides right, steer right)</li>
                      <li>Don't overcorrect — small, smooth adjustments</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-12" />

            {/* Section 4: Emergency Preparedness */}
            <section id="emergency-prep" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <PackageCheck className="h-7 w-7 text-primary" />
                Emergency Preparedness
              </h2>

              <p className="text-muted-foreground mb-6">
                Getting stranded in winter can be life-threatening. Always carry emergency supplies and know what to do if you're stuck.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Winter Emergency Kit Essentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Extra blankets or sleeping bag
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Non-perishable food & water
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Flashlight with extra batteries
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Jumper cables
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Tire chains (where required)
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Ice scraper & snow brush
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Bag of sand or cat litter
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Extra washer fluid (-20°F rated)
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Warm clothing & gloves
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Charged phone + charger
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Roadside triangles/flares
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      First aid kit
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TipCard icon={Phone} title="If You Get Stranded">
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li><strong>Stay with your truck.</strong> It's easier to find and provides shelter.</li>
                  <li><strong>Call for help.</strong> Contact roadside assistance, dispatch, and 911 if needed.</li>
                  <li><strong>Make yourself visible.</strong> Turn on hazards, set out triangles, tie something bright to your antenna.</li>
                  <li><strong>Conserve fuel.</strong> Run the engine 10-15 minutes per hour for heat. Crack a window to prevent CO buildup.</li>
                  <li><strong>Keep moving.</strong> Move your arms and legs periodically to maintain circulation.</li>
                </ol>
              </TipCard>
            </section>

            <Separator className="my-12" />

            {/* Section 5: Fuel Gelling */}
            <section id="fuel-gelling" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Fuel className="h-7 w-7 text-primary" />
                Preventing Diesel Fuel Gel
              </h2>

              <p className="text-muted-foreground mb-6">
                Diesel fuel begins to gel (cloud) when paraffin wax in the fuel crystallizes at low temperatures. This can clog filters and fuel lines, leaving you stranded.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cloud Point vs. Pour Point</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Cloud Point (~15-20°F):</strong> Wax crystals start forming. Fuel looks cloudy.</p>
                    <p><strong>Pour Point (~0°F):</strong> Fuel thickens and won't flow through lines.</p>
                    <p className="text-xs italic">Winter blend diesel is formulated for colder temps, but don't rely on it alone.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Prevention Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Add anti-gel treatment BEFORE cold hits
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Keep fuel tank at least half full
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Buy fuel in the region where you'll be driving
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Carry extra fuel filter if heading into extreme cold
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Alert className="border-primary/30 bg-primary/5">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  If you filled up in Texas and you're heading to Minnesota, top off with local winter blend once you're in the cold region. Southern diesel isn't formulated for northern winters.
                </AlertDescription>
              </Alert>
            </section>

            <Separator className="my-12" />

            {/* Section 6: CRUMS Support */}
            <section id="crums-support" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                How CRUMS Leasing Supports You in Winter
              </h2>

              <p className="text-muted-foreground mb-6">
                At CRUMS Leasing, we understand that well-maintained equipment is your first line of defense against winter breakdowns. Here's how we help keep you moving:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wrench className="h-5 w-5 text-primary" />
                      Pre-Winter Inspections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Our trailers receive comprehensive pre-season inspections including brake systems, lights, tires, and all components that are critical in cold weather.
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      DOT-Ready Fleet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Every CRUMS trailer is maintained to pass DOT inspection. You won't be sidelined by equipment issues during the busiest shipping season.
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      GPS-Equipped Trailers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Our GPS tracking helps us locate your trailer quickly if you need roadside assistance, reducing wait times in emergency situations.
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      Responsive Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    When you need help, we're here. Our team understands the urgency of winter breakdowns and works quickly to get you back on the road.
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
                <CardContent className="pt-6 pb-6 text-center">
                  <h3 className="text-xl font-bold mb-3">Ready to Lease with Confidence?</h3>
                  <p className="text-primary-foreground/90 mb-4 max-w-2xl mx-auto">
                    Whether it's winter or summer, CRUMS Leasing provides reliable equipment and support so you can focus on driving.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/get-started">Get a Quote</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                      <Link to="/contact">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* FAQs */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqSchema.mainEntity.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">{faq.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {faq.acceptedAnswer.text}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Guide Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-12">
              <Button asChild variant="outline" className="flex-1 sm:flex-initial">
                <Link to={guideNavigation.previous.href} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {guideNavigation.previous.title}
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 sm:flex-initial">
                <Link to="/resources/guides" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  All Guides
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <GuideRelatedContent currentSlug="winter-driving" />
      <Footer />
    </div>
  );
};

export default WinterDriving;
