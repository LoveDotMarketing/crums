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
  Wallet, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  DollarSign,
  Wrench,
  RefreshCw,
  Calculator,
  Phone
} from "lucide-react";

const dryVanTrailerImg = "/images/dry-van-trailer.webp";

// Article metadata
const articleData = {
  title: "Why Leasing a Dry Van Trailer is a Smart Business Decision",
  description: "Discover the financial and operational advantages of leasing dry van trailers versus buying for your trucking business. Learn how leasing preserves capital and reduces risk.",
  publishedDate: "2025-12-10",
  updatedDate: "2025-12-10",
  readTime: "6 min read",
  author: "CRUMS Leasing Team",
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
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
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
    "@id": "https://crumsleasing.com/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision"
  }
};

// FAQ Schema for AI/Voice Search
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why should I lease a dry van trailer instead of buying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Leasing a dry van trailer preserves your capital, provides predictable monthly expenses, eliminates depreciation risk, and includes maintenance support. This allows you to invest your capital in growing your business rather than tying it up in equipment."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to lease a dry van trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dry van trailer lease rates vary based on term length and trailer age, but typically range from $800 to $1,500 per month. CRUMS Leasing offers competitive rates with flexible terms starting at 12 months."
      }
    },
    {
      "@type": "Question",
      "name": "What is included in a dry van trailer lease?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CRUMS Leasing dry van trailer leases include well-maintained equipment, flexible terms, and responsive support. Our trailers are DOT-compliant and regularly inspected to keep you moving safely."
      }
    },
    {
      "@type": "Question",
      "name": "How long is a typical dry van trailer lease?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lease terms typically range from 12 months to 60 months. CRUMS Leasing offers flexible lease terms with a minimum of 12 months, allowing carriers to scale their fleet as their business grows."
      }
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Why Leasing a Dry Van is Smart", url: "https://crumsleasing.com/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision" }
]);

const guideNavigation = {
  previous: {
    title: "How to Choose the Right Trailer",
    href: "/resources/guides/choosing-trailer"
  },
  next: {
    title: "Pre-Trip Inspection Checklist",
    href: "/resources/guides/pre-trip-inspection"
  }
};

// Benefits data
const leasingBenefits = [
  {
    icon: DollarSign,
    title: "Preserve Your Capital",
    description: "Keep your cash available for fuel, maintenance, insurance, and business growth instead of tying it up in a large equipment purchase."
  },
  {
    icon: TrendingUp,
    title: "Predictable Monthly Expenses",
    description: "Fixed lease payments make budgeting easier. Know exactly what your equipment costs each month without surprise expenses."
  },
  {
    icon: Shield,
    title: "No Depreciation Risk",
    description: "Trailers depreciate over time. When you lease, the depreciation risk stays with the lessor, not your balance sheet."
  },
  {
    icon: Wrench,
    title: "Well-Maintained Equipment",
    description: "CRUMS Leasing maintains our fleet to high standards. You get reliable equipment without the hassle of managing maintenance schedules."
  },
  {
    icon: RefreshCw,
    title: "Flexibility to Scale",
    description: "As your business grows or contracts, leasing gives you flexibility. Add trailers when busy, return them when you need to downsize."
  },
  {
    icon: Clock,
    title: "Get on the Road Faster",
    description: "Skip the long financing approval process. Leasing gets you rolling with quality equipment faster than traditional purchases."
  }
];

const WhyLeasingDryVan = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision"
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
              Smart carriers know that keeping capital free is the key to long-term success. Here's why leasing a dry van trailer makes financial sense.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {articleData.readTime}
              </span>
              <span>•</span>
              <span>By {articleData.author}</span>
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
                For owner-operators and small carriers, every dollar counts. The decision to lease versus buy equipment can significantly impact your cash flow, tax situation, and long-term business success. <strong>Dry van trailers</strong> are the backbone of the trucking industry — hauling approximately 70% of all freight in the United States. Here's why leasing makes sense for your business.
              </p>
            </section>

            {/* Featured Image */}
            <section className="mb-12">
              <Link to="/dry-van-trailers" className="block">
                <img 
                  src={dryVanTrailerImg} 
                  alt="CRUMS Leasing 53-foot dry van trailer available for lease"
                  className="w-full h-64 md:h-80 object-contain bg-muted/30 rounded-xl border"
                  width="800"
                  height="320"
                />
              </Link>
              <p className="text-sm text-muted-foreground text-center mt-2">
                CRUMS Leasing offers well-maintained 53' dry van trailers for flexible lease terms
              </p>
            </section>

            {/* Quick Stats */}
            <section className="mb-16">
              <div className="grid sm:grid-cols-3 gap-6">
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">$30K+</div>
                  <p className="text-sm text-muted-foreground">Typical dry van purchase price</p>
                </Card>
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">12 mo</div>
                  <p className="text-sm text-muted-foreground">Minimum lease term at CRUMS</p>
                </Card>
                <Card className="text-center p-6 bg-primary/5 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">of freight moves in dry vans</p>
                </Card>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                6 Reasons to Lease Your Next Dry Van
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {leasingBenefits.map((benefit, index) => (
                  <Card key={index} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="my-12" />

            {/* Lease vs Buy Comparison */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-foreground">
                Leasing vs. Buying: A Quick Comparison
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 border-2 border-primary">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Leasing Advantages
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Lower upfront costs — preserve capital</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Predictable monthly payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No depreciation on your books</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Flexibility to scale fleet up or down</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Lease payments may be tax deductible</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-2 border-muted">
                  <h3 className="text-xl font-bold text-muted-foreground mb-4">
                    Buying Considerations
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">• Large upfront payment or financing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">• Depreciation reduces asset value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">• Responsible for all maintenance costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">• Harder to adjust fleet size</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">• Risk of equipment becoming obsolete</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-xl border">
                <p className="text-lg text-muted-foreground">
                  <strong className="text-foreground">Pro tip:</strong> Use our <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline font-medium">Lease vs. Buy Calculator</Link> to run the numbers for your specific situation and see the long-term financial impact of each choice.
                </p>
              </div>
            </section>

            {/* CTA Card */}
            <section className="mb-16">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Ready to Lease a Dry Van Trailer?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    CRUMS Leasing offers flexible dry van trailer leases with competitive rates and terms starting at 12 months. Get rolling with quality equipment and keep your capital working for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <Link to="/get-started">
                        Get Started Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/services/trailer-leasing">
                        Learn About Our Leasing Options
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* FAQ Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-foreground">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                {faqSchema.mainEntity.map((faq, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{faq.name}</h3>
                    <p className="text-muted-foreground">{faq.acceptedAnswer.text}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Related Tools */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Calculator className="h-6 w-6 text-primary" />
                Helpful Tools for Your Decision
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/resources/tools/lease-vs-buy" className="block">
                  <Card className="p-4 hover:border-primary/50 transition-colors h-full">
                    <h3 className="font-semibold text-foreground mb-2">Lease vs. Buy Calculator</h3>
                    <p className="text-sm text-muted-foreground">Compare the long-term costs of leasing versus purchasing a trailer</p>
                  </Card>
                </Link>
                <Link to="/resources/tools/cost-per-mile" className="block">
                  <Card className="p-4 hover:border-primary/50 transition-colors h-full">
                    <h3 className="font-semibold text-foreground mb-2">Cost Per Mile Calculator</h3>
                    <p className="text-sm text-muted-foreground">Calculate your total operating costs including lease payments</p>
                  </Card>
                </Link>
              </div>
            </section>

            <Separator className="my-12" />

            {/* Navigation */}
            <nav className="flex flex-col sm:flex-row justify-between gap-4">
              <Link 
                to={guideNavigation.previous.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <p className="text-xs uppercase tracking-wider">Previous Guide</p>
                  <p className="font-medium">{guideNavigation.previous.title}</p>
                </div>
              </Link>
              <Link 
                to={guideNavigation.next.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group sm:text-right"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider">Next Guide</p>
                  <p className="font-medium">{guideNavigation.next.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </nav>
          </div>
        </div>
      </article>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Have Questions About Dry Van Leasing?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Our team is ready to help you find the right trailer for your business needs.
          </p>
          <Button asChild size="lg">
            <a href="tel:+18885704564">
              <Phone className="mr-2 h-5 w-5" />
              Call (888) 570-4564
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyLeasingDryVan;
