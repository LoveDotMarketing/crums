import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Package, 
  Snowflake, 
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Phone,
  BookOpen,
  Lightbulb,
  Scale,
  DollarSign,
  Shield,
  Users
} from "lucide-react";
import dryVanTrailerImg from "@/assets/dry-van-trailer.png";
import flatbedTrailerImg from "@/assets/flatbed-trailer.png";
import refrigeratedTrailerImg from "@/assets/refrigerated-trailer.png";

// Article metadata
const articleData = {
  title: "How to Choose the Right Trailer for Your Haul",
  description: "Learn the key differences between dry vans, flatbeds, reefers, and specialty trailers. Find the perfect match for your cargo with this comprehensive guide from CRUMS Leasing.",
  publishedDate: "2025-12-04",
  updatedDate: "2025-12-04",
  readTime: "8 min read",
  author: "Hector",
  authorSlug: "hector"
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
    "name": "Hector",
    "url": "https://crumsleasing.com/about/hector",
    "jobTitle": "Fleet Management Director"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/og-image.jpg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://crumsleasing.com/resources/guides/choosing-trailer"
  }
};

// FAQ Schema for AI/Voice Search
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best type of trailer for general freight?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A dry van trailer is the best choice for general freight. Dry vans are enclosed 53-foot trailers that protect cargo from weather and theft, making them ideal for consumer goods, retail merchandise, electronics, and non-perishable items. Approximately 70% of all freight in the United States moves in dry van trailers."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a dry van and a flatbed trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A dry van is an enclosed trailer with walls and a roof, perfect for protecting cargo from weather and theft. A flatbed is an open-deck trailer with no sides or roof, designed for oversized, heavy, or irregularly shaped cargo like construction materials, machinery, and vehicles."
      }
    },
    {
      "@type": "Question",
      "name": "What trailer do I need to haul refrigerated goods?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You need a refrigerated trailer, also called a reefer, to haul temperature-sensitive cargo. Reefers have built-in refrigeration units that maintain temperatures from -20°F to 70°F, making them essential for fresh produce, frozen foods, dairy products, pharmaceuticals, and floral shipments."
      }
    },
    {
      "@type": "Question",
      "name": "How long is a standard semi-trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The standard length for a semi-trailer in the United States is 53 feet. This applies to dry vans, reefers, and most flatbeds. The maximum gross vehicle weight allowed is 80,000 pounds."
      }
    },
    {
      "@type": "Question",
      "name": "How much weight can a dry van trailer carry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A standard 53-foot dry van trailer can carry up to 45,000 pounds of cargo. The total gross vehicle weight cannot exceed 80,000 pounds per federal regulations. Dry vans also offer over 3,000 cubic feet of cargo space."
      }
    },
    {
      "@type": "Question",
      "name": "Should I lease or buy a trailer for my trucking business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Leasing a trailer is often better for owner-operators and small carriers because it preserves capital, offers predictable monthly expenses, and eliminates depreciation risk. CRUMS Leasing offers flexible trailer lease terms starting at 12 months with well-maintained dry van and flatbed trailers."
      }
    },
    {
      "@type": "Question",
      "name": "What types of trailers does CRUMS Leasing offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CRUMS Leasing offers 53-foot dry van trailers and flatbed trailers for lease and short-term rental. The fleet is well-maintained and available for carriers operating locally in Texas or shipping nationwide across the United States."
      }
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Choosing the Right Trailer", url: "https://crumsleasing.com/resources/guides/choosing-trailer" }
]);

const guideNavigation = {
  previous: {
    title: "Keep Your Mind Sharp on the Road",
    href: "/resources/guides/mental-health"
  },
  next: {
    title: "Pre-Trip Inspection Checklist",
    href: "/resources/guides/pre-trip-inspection"
  }
};

// Trailer types data
const trailerTypes = [
  {
    name: "Dry Van",
    icon: Package,
    image: dryVanTrailerImg,
    imageAlt: "CRUMS Leasing 53-foot dry van trailer - enclosed cargo protection for general freight",
    description: "The workhorse of the trucking industry. Enclosed trailers ideal for general freight that doesn't require temperature control.",
    bestFor: [
      "Consumer packaged goods",
      "Retail merchandise",
      "Electronics and appliances",
      "Non-perishable food items",
      "Furniture and household goods"
    ],
    notIdealFor: [
      "Temperature-sensitive cargo",
      "Oversized equipment",
      "Heavy construction materials"
    ],
    specs: {
      length: "53 feet (standard)",
      capacity: "Up to 45,000 lbs",
      volume: "3,000+ cubic feet"
    },
    marketShare: "~70% of all freight",
    colorClass: "text-secondary",
    learnMoreLink: "/dry-van-trailers",
    learnMoreText: "Learn more about dry van trailers"
  },
  {
    name: "Flatbed",
    icon: Layers,
    image: flatbedTrailerImg,
    imageAlt: "CRUMS Leasing flatbed trailer - open-deck design for oversized and heavy cargo hauling",
    description: "Open-deck trailers with no sides or roof, perfect for oversized, heavy, or irregularly shaped cargo.",
    bestFor: [
      "Construction materials (steel, lumber)",
      "Heavy machinery and equipment",
      "Vehicles and farm equipment",
      "Prefabricated structures",
      "Wind turbine components"
    ],
    notIdealFor: [
      "Weather-sensitive goods",
      "Small loose items",
      "Products requiring security"
    ],
    specs: {
      length: "48-53 feet",
      capacity: "Up to 48,000 lbs",
      width: "8.5 feet standard"
    },
    marketShare: "~15% of freight market",
    colorClass: "text-secondary",
    learnMoreLink: "/flatbed-trailers",
    learnMoreText: "Learn more about flatbed trailers"
  },
  {
    name: "Refrigerated (Reefer)",
    icon: Snowflake,
    image: refrigeratedTrailerImg,
    imageAlt: "CRUMS Leasing refrigerated reefer trailer - temperature-controlled transport for perishable goods",
    description: "Temperature-controlled trailers equipped with refrigeration units for perishable and temperature-sensitive cargo.",
    bestFor: [
      "Fresh produce and fruits",
      "Frozen foods and dairy",
      "Pharmaceuticals and vaccines",
      "Floral products",
      "Chemicals requiring temp control"
    ],
    notIdealFor: [
      "Non-temperature sensitive goods",
      "Heavy industrial equipment",
      "Low-value commodities"
    ],
    specs: {
      length: "53 feet (standard)",
      tempRange: "-20°F to 70°F",
      capacity: "Up to 44,000 lbs"
    },
    marketShare: "~10% of freight market",
    colorClass: "text-accent",
    learnMoreLink: "/refrigerated-trailers",
    learnMoreText: "Learn more about refrigerated trailers"
  }
];

const ChoosingTrailer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/choosing-trailer"
        structuredData={[articleSchema, faqSchema, breadcrumbSchema]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" />
              Industry Guide
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              The right trailer isn't just about hauling freight — it's about protecting your cargo, maximizing your earnings, and keeping you moving forward.
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
      <article className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <section className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                In the trucking industry, choosing the right trailer is one of the most important decisions a carrier can make. With the global semi-trailer market valued at <strong>$24.2 billion in 2025</strong> and projected to reach $49 billion by 2035<sup>[1]</sup>, understanding trailer types isn't just useful knowledge — it's essential for your business success.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At <strong>CRUMS Leasing</strong>, we believe every hardworking carrier deserves the right equipment to build a better life for their family. That's why we've put together this comprehensive guide to help you match your cargo with the perfect trailer type.
              </p>
            </section>

            {/* Quick Stats */}
            <section className="mb-16">
              <div className="grid sm:grid-cols-3 gap-6">
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">of freight moves in dry vans</p>
                </Card>
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">53 ft</div>
                  <p className="text-sm text-muted-foreground">standard trailer length</p>
                </Card>
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">80K lbs</div>
                  <p className="text-sm text-muted-foreground">max gross vehicle weight<sup>[2]</sup></p>
                </Card>
              </div>
            </section>

            {/* Why It Matters */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-primary" />
                Why Your Trailer Choice Matters
              </h2>
              <div className="bg-muted/50 rounded-xl p-8 border">
                <p className="text-lg text-muted-foreground mb-6">
                  Selecting the wrong trailer type can lead to serious consequences:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <DollarSign className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-foreground">Financial losses</strong>
                      <p className="text-muted-foreground">Damaged cargo, rejected loads, and missed opportunities cost carriers thousands each year</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Scale className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-foreground">Compliance violations</strong>
                      <p className="text-muted-foreground">DOT and FMCSA regulations require proper cargo securement and weight distribution<sup>[3]</sup></p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-foreground">Safety hazards</strong>
                      <p className="text-muted-foreground">Improperly secured or protected cargo puts you, your load, and others at risk</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <Separator className="my-12" />

            {/* Trailer Types Deep Dive */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-foreground">
                The Three Main Trailer Types
              </h2>
              
              <div className="space-y-12">
                {trailerTypes.map((trailer, index) => (
                  <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    {/* Trailer Image */}
                    <Link to={trailer.learnMoreLink} className="block bg-muted/30 p-4 border-b hover:bg-muted/50 transition-colors">
                      <img 
                        src={trailer.image} 
                        alt={trailer.imageAlt}
                        className="w-full h-48 object-contain"
                        loading="lazy"
                        width="400"
                        height="192"
                      />
                    </Link>
                    <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                          <trailer.icon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{trailer.name}</h3>
                          <Badge variant="outline" className="mt-1">{trailer.marketShare}</Badge>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-lg text-muted-foreground mb-6">{trailer.description}</p>
                      
                      {/* Specs */}
                      <div className="grid sm:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                        {Object.entries(trailer.specs).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="font-semibold text-foreground">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Best For */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Best For
                          </h4>
                          <ul className="space-y-2">
                            {trailer.bestFor.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Not Ideal For */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Not Ideal For
                          </h4>
                          <ul className="space-y-2">
                            {trailer.notIdealFor.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Learn More Link */}
                      {trailer.learnMoreLink && (
                        <div className="mt-6 pt-4 border-t">
                          <Link 
                            to={trailer.learnMoreLink} 
                            className={`inline-flex items-center ${trailer.colorClass} hover:underline font-medium`}
                          >
                            {trailer.learnMoreText}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-16">
              <Card className="bg-primary text-primary-foreground p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="h-10 w-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Looking for Quality Trailers?</h3>
                    <p className="text-primary-foreground/90 mb-4">
                      CRUMS Leasing offers 53-foot dry van and flatbed trailers with flexible lease terms starting at 12 months. Our well-maintained fleet helps you stay on the road and get home safe.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <Button asChild variant="secondary" size="lg">
                        <Link to="/services/trailer-leasing">
                          Explore Trailer Leasing
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90">
                        <Link to="/get-started">Get a Quote</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* Decision Framework */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                How to Make Your Decision
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                When selecting a trailer for a specific haul, ask yourself these key questions:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-muted/30">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    What's the cargo?
                  </h4>
                  <p className="text-muted-foreground">
                    Consider size, weight, temperature sensitivity, and security requirements. Perishables need reefers; oversized loads need flatbeds.
                  </p>
                </Card>
                
                <Card className="p-6 bg-muted/30">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    What's the route?
                  </h4>
                  <p className="text-muted-foreground">
                    Weather exposure, road conditions, and state regulations may limit your options. Flatbeds face weather risks; reefers have fuel costs.
                  </p>
                </Card>
                
                <Card className="p-6 bg-muted/30">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    What are the weight limits?
                  </h4>
                  <p className="text-muted-foreground">
                    Federal law caps gross vehicle weight at 80,000 lbs<sup>[2]</sup>. Subtract your tractor and trailer weight to determine actual cargo capacity.
                  </p>
                </Card>
                
                <Card className="p-6 bg-muted/30">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    What's your budget?
                  </h4>
                  <p className="text-muted-foreground">
                    Reefers cost more to operate due to fuel for refrigeration. Flatbeds require more securement time and equipment. Dry vans are most economical.
                  </p>
                </Card>
              </div>
            </section>

            {/* CRUMS Values Section */}
            <section className="mb-16">
              <Card className="bg-gradient-to-br from-muted to-background p-8 border-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">The CRUMS Difference</h3>
                    <p className="text-muted-foreground mb-4">
                      At CRUMS Leasing, we're more than a leasing company — we're your partner on the road to success. Our people-first approach means we take the time to understand your hauling needs and match you with the right equipment.
                    </p>
                    <p className="text-muted-foreground">
                      Whether you're an owner-operator just starting out or an established carrier expanding your fleet, we offer <Link to="/services/trailer-leasing" className="text-primary hover:underline font-medium">flexible trailer leasing</Link> and <Link to="/services/trailer-rentals" className="text-primary hover:underline font-medium">short-term rentals</Link> to fit your business model. Follow the CRUMS home — where integrity, family, and opportunity come together.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Quick Reference Table */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Quick Reference Chart
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-4 text-left font-bold">Cargo Type</th>
                      <th className="border p-4 text-left font-bold">Recommended Trailer</th>
                      <th className="border p-4 text-left font-bold">Key Consideration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-4">General merchandise, retail goods</td>
                      <td className="border p-4 font-medium">Dry Van</td>
                      <td className="border p-4 text-muted-foreground">Most versatile, weather protection</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border p-4">Steel beams, lumber, machinery</td>
                      <td className="border p-4 font-medium">Flatbed</td>
                      <td className="border p-4 text-muted-foreground">Easy loading from all sides</td>
                    </tr>
                    <tr>
                      <td className="border p-4">Fresh produce, frozen foods</td>
                      <td className="border p-4 font-medium">Reefer</td>
                      <td className="border p-4 text-muted-foreground">Temperature control critical</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border p-4">Pharmaceuticals, vaccines</td>
                      <td className="border p-4 font-medium">Reefer</td>
                      <td className="border p-4 text-muted-foreground">Precise temp monitoring required</td>
                    </tr>
                    <tr>
                      <td className="border p-4">Vehicles, heavy equipment</td>
                      <td className="border p-4 font-medium">Flatbed / Lowboy</td>
                      <td className="border p-4 text-muted-foreground">Check height restrictions</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border p-4">Electronics, high-value goods</td>
                      <td className="border p-4 font-medium">Dry Van</td>
                      <td className="border p-4 text-muted-foreground">Security and weather protection</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mb-16">
              <Card className="bg-muted/50 p-8 text-center border-2 border-dashed">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Need Help Choosing?</h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Our team at CRUMS Leasing is ready to help you find the right trailer for your needs. Whether you're hauling locally in Texas or shipping nationwide, we've got you covered.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <a href="tel:+18885704564">
                      <Phone className="h-4 w-4 mr-2" />
                      Call (888) 570-4564
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/contact">Send Us a Message</Link>
                  </Button>
                </div>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* FAQ Section - Optimized for AI/Voice Search */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    What is the best type of trailer for general freight?
                  </h3>
                  <p className="text-muted-foreground">
                    A <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium">dry van trailer</Link> is the best choice for general freight. Dry vans are enclosed 53-foot trailers that protect cargo from weather and theft, making them ideal for consumer goods, retail merchandise, electronics, and non-perishable items. Approximately 70% of all freight in the United States moves in dry van trailers.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    What is the difference between a dry van and a flatbed trailer?
                  </h3>
                  <p className="text-muted-foreground">
                    A <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium">dry van</Link> is an enclosed trailer with walls and a roof, perfect for protecting cargo from weather and theft. A <Link to="/flatbed-trailers" className="text-primary hover:underline font-medium">flatbed</Link> is an open-deck trailer with no sides or roof, designed for oversized, heavy, or irregularly shaped cargo like construction materials, machinery, and vehicles. Dry vans handle about 70% of freight while flatbeds cover roughly 15% of the market.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    What trailer do I need to haul refrigerated goods?
                  </h3>
                  <p className="text-muted-foreground">
                    You need a <Link to="/refrigerated-trailers" className="text-primary hover:underline font-medium">refrigerated trailer</Link>, also called a "reefer," to haul temperature-sensitive cargo. Reefers have built-in refrigeration units that maintain temperatures from -20°F to 70°F, making them essential for fresh produce, frozen foods, dairy products, pharmaceuticals, and floral shipments.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    How long is a standard semi-trailer?
                  </h3>
                  <p className="text-muted-foreground">
                    The standard length for a semi-trailer in the United States is 53 feet. This applies to dry vans, reefers, and most flatbeds. The maximum gross vehicle weight allowed is 80,000 pounds, which includes the truck, trailer, and cargo combined.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    How much weight can a dry van trailer carry?
                  </h3>
                  <p className="text-muted-foreground">
                    A standard 53-foot <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium">dry van trailer</Link> can carry up to 45,000 pounds of cargo, though the exact capacity depends on the weight of your truck and trailer combined. The total gross vehicle weight cannot exceed 80,000 pounds per federal regulations. Dry vans also offer over 3,000 cubic feet of cargo space.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    Should I lease or buy a trailer for my trucking business?
                  </h3>
                  <p className="text-muted-foreground">
                    Leasing a trailer is often better for owner-operators and small carriers because it preserves capital, offers predictable monthly expenses, and eliminates depreciation risk. At CRUMS Leasing, we offer flexible trailer lease terms starting at 12 months with well-maintained dry van and flatbed trailers. Use our <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline">Lease vs Buy Calculator</Link> to compare options for your situation.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    What types of trailers does CRUMS Leasing offer?
                  </h3>
                  <p className="text-muted-foreground">
                    CRUMS Leasing offers 53-foot <Link to="/dry-van-trailers" className="text-primary hover:underline font-medium">dry van trailers</Link> and <Link to="/flatbed-trailers" className="text-primary hover:underline font-medium">flatbed trailers</Link> for lease and short-term rental. Our fleet is well-maintained and available for carriers operating locally in Texas or shipping nationwide across the United States. We offer flexible lease terms starting at 12 months with a people-first approach to help every carrier succeed.
                  </p>
                </Card>
              </div>
            </section>

            <Separator className="my-12" />

            {/* Sources */}
            <section className="mb-16">
              <h2 className="text-xl font-bold mb-4 text-foreground">Sources & References</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <sup>[1]</sup>{" "}
                  <a 
                    href="https://www.factmr.com/report/semi-trailer-market" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Fact.MR - Semi-trailer Market Size and Share Forecast 2025-2035
                  </a>
                </li>
                <li>
                  <sup>[2]</sup>{" "}
                  <a 
                    href="https://ops.fhwa.dot.gov/freight/sw/overview/index.htm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    FHWA - Commercial Vehicle Size and Weight Program
                  </a>
                </li>
                <li>
                  <sup>[3]</sup>{" "}
                  <a 
                    href="https://www.fmcsa.dot.gov/regulations/cargo-securement/cargo-securement-rules" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    FMCSA - Cargo Securement Rules
                  </a>
                </li>
                <li>
                  <sup>[4]</sup>{" "}
                  <a 
                    href="https://www.mordorintelligence.com/industry-reports/truck-trailer-market" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mordor Intelligence - Truck Trailer Market Size & Share Analysis
                  </a>
                </li>
              </ol>
            </section>

            {/* Article Navigation */}
            <section className="border-t pt-8">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Link 
                  to={guideNavigation.previous.href}
                  className="group flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors flex-1"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Previous Guide</p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{guideNavigation.previous.title}</p>
                  </div>
                </Link>
                <Link 
                  to={guideNavigation.next.href}
                  className="group flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors flex-1 justify-end"
                >
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Next Guide</p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{guideNavigation.next.title}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </div>
            </section>

          </div>
        </div>
      </article>

      {/* Bottom CTA */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Get the Right Trailer?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-6 text-primary-foreground/90">
            CRUMS Leasing offers quality dry van and flatbed trailers with flexible terms designed for carriers like you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/get-started">Start Your Lease Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/guides">Browse All Guides</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChoosingTrailer;
