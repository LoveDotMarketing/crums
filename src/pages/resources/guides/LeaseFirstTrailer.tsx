import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileSignature, 
  CheckCircle, 
  DollarSign,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Wrench,
  Heart,
  Phone,
  Star
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
  "headline": "Why Lease Your First Trailer: A Guide for New Owner-Operators",
  "description": "Learn why leasing a trailer makes sense for new truck drivers. Compare leasing vs buying, understand what to look for in a lease provider, and discover why CRUMS Leasing is ideal for new drivers.",
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
  "mainEntityOfPage": "https://crumsleasing.com/resources/guides/lease-first-trailer"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Should I lease or buy my first trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For most new owner-operators, leasing is the smarter choice. It preserves your capital for operating expenses, provides predictable monthly costs, and avoids the depreciation risk of ownership. Once you're established and have steady income, buying may make sense."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to lease a trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dry van trailer leases typically range from $400-$1,200 per month depending on the trailer age, condition, and lease terms. CRUMS Leasing offers competitive rates starting around $500-$800/month for quality equipment with flexible terms."
      }
    },
    {
      "@type": "Question",
      "name": "What's the minimum lease term?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lease terms vary by provider. CRUMS Leasing offers 12-month minimum terms, which provides flexibility for new drivers who aren't sure about long-term commitments while still offering favorable rates."
      }
    },
    {
      "@type": "Question",
      "name": "What's included in a trailer lease?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard leases typically include the trailer, basic maintenance support, and registration. Some providers include roadside assistance, tire replacement programs, or maintenance packages. Always clarify what's included before signing."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need insurance for a leased trailer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you'll need cargo insurance and liability coverage. Some lease providers require physical damage coverage on the trailer as well. Your insurance costs typically run $200-$400/month for a new owner-operator."
      }
    },
    {
      "@type": "Question",
      "name": "Can I lease multiple trailers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, as your business grows you can add trailers to your lease. Many providers offer volume discounts for multiple units. CRUMS Leasing works with owner-operators of all sizes, from single-truck operations to growing fleets."
      }
    }
  ]
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Lease First Trailer", url: "https://crumsleasing.com/resources/guides/lease-first-trailer" },
]);

const LeaseFirstTrailer = () => {
  const leaseVsBuy = [
    {
      aspect: "Upfront Cost",
      lease: "Low deposit (typically 1-2 months)",
      buy: "High down payment ($5K-$15K+)"
    },
    {
      aspect: "Monthly Cash Flow",
      lease: "Predictable fixed payments",
      buy: "Loan payments + unexpected repairs"
    },
    {
      aspect: "Depreciation Risk",
      lease: "None — you return the trailer",
      buy: "You absorb the loss in value"
    },
    {
      aspect: "Flexibility",
      lease: "Exit at term end",
      buy: "Must sell to get out"
    },
    {
      aspect: "Maintenance",
      lease: "Often supported by lessor",
      buy: "100% your responsibility"
    },
    {
      aspect: "Capital Preservation",
      lease: "Keep cash for operations",
      buy: "Ties up capital in equipment"
    }
  ];

  const whatToLookFor = [
    {
      title: "Flexible Terms",
      description: "Look for 12-month minimums rather than 3-5 year locks. You need flexibility as a new driver.",
      icon: Clock
    },
    {
      title: "Maintenance Support",
      description: "Good lessors help with maintenance issues instead of leaving you stranded with a broken trailer.",
      icon: Wrench
    },
    {
      title: "Quality Equipment",
      description: "Well-maintained trailers mean fewer breakdowns and DOT issues. Inspect before signing.",
      icon: ShieldCheck
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees, clear payment terms, and honest communication about what's included.",
      icon: DollarSign
    },
    {
      title: "Driver-Focused Culture",
      description: "Look for companies that treat you as a partner, not just a payment. Family-owned often means better service.",
      icon: Heart
    },
    {
      title: "Reasonable Deposits",
      description: "Avoid providers requiring huge upfront deposits. Your capital is better spent on operations.",
      icon: TrendingUp
    }
  ];

  const crumsAdvantages = [
    {
      title: "12-Month Minimum Terms",
      description: "We understand new drivers need flexibility. Our 12-month minimums let you test the waters without a multi-year commitment."
    },
    {
      title: "Well-Maintained Fleet",
      description: "Every trailer is inspected and maintained to high standards. We don't put you in equipment that will cause problems."
    },
    {
      title: "Family-Owned, Driver-Focused",
      description: "We're not a faceless corporation. Our team knows your name and treats you like the business partner you are."
    },
    {
      title: "Reasonable Deposits",
      description: "We keep deposits low so you can preserve capital for fuel, insurance, and the unexpected costs of starting out."
    },
    {
      title: "Quick Response",
      description: "When you have an issue, you reach a real person who can help — not a call center that puts you on hold."
    },
    {
      title: "San Antonio Based, Texas Proud",
      description: "Based in San Antonio and serving carriers across Texas and beyond. Local support when you need it."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Why Lease Your First Trailer: A Guide for New Owner-Operators"
        description="Learn why leasing a trailer makes sense for new truck drivers. Compare leasing vs buying, understand what to look for in a lease provider, and discover why CRUMS Leasing is ideal for new drivers."
        canonical="https://crumsleasing.com/resources/guides/lease-first-trailer"
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
              <FileSignature className="h-12 w-12" />
            </div>
            <p className="text-sm uppercase tracking-wider mb-2 text-primary-foreground/80">New Driver Roadmap — Step 4 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Why Lease Your First Trailer
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Buying a trailer ties up capital you need for operations. Leasing preserves your cash flow, provides predictable expenses, and gives you flexibility as your business grows.
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
                When you're starting out as an owner-operator, every dollar matters. You've already invested in your CDL training, your truck, insurance, and the countless small expenses that come with running a trucking business. Adding a $30,000-$50,000 trailer purchase on top of that strains even the best-planned budgets.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                That's why most successful new drivers lease their first trailer instead of buying. Leasing preserves your capital, provides predictable monthly expenses, and gives you flexibility to adjust as your business evolves.
              </p>
            </div>

            {/* Lease vs Buy Comparison */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <TrendingUp className="h-6 w-6 text-primary" />
                Leasing vs. Buying: The Numbers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Consideration</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary">Leasing</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Buying</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaseVsBuy.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium text-foreground">{row.aspect}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {row.lease}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{row.buy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link to="/resources/tools/lease-vs-buy">
                    Run the Numbers: Lease vs Buy Calculator
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Capital Preservation */}
            <div className="mb-12 bg-muted/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <DollarSign className="h-6 w-6 text-primary" />
                The Capital Preservation Advantage
              </h2>
              <p className="text-muted-foreground mb-4">
                Consider what happens to your cash in each scenario:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-primary">If You Lease</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    <ul className="space-y-2">
                      <li>• $1,000-$2,000 deposit upfront</li>
                      <li>• Keep $8,000-$13,000 for operations</li>
                      <li>• Cash available for slow periods</li>
                      <li>• Buffer for unexpected repairs</li>
                      <li>• Easier to cover fuel during rate dips</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-muted-foreground">If You Buy</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    <ul className="space-y-2">
                      <li>• $10,000-$15,000 down payment</li>
                      <li>• Capital locked in depreciating asset</li>
                      <li>• Less runway for slow periods</li>
                      <li>• May need financing for repairs</li>
                      <li>• Stress during market downturns</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* What to Look For */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                What to Look for in a Lease Provider
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {whatToLookFor.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <item.icon className="h-5 w-5 text-primary" />
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                      {item.description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Why CRUMS */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Star className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Why CRUMS Leasing is Ideal for New Drivers</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                At CRUMS Leasing, we specialize in helping owner-operators succeed. We're not just a trailer company — we're partners in your business journey.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {crumsAdvantages.map((advantage, index) => (
                  <div key={index} className="flex gap-4 bg-muted/30 rounded-lg p-4">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{advantage.title}</p>
                      <p className="text-sm text-muted-foreground">{advantage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="mb-12 bg-secondary/20 border border-secondary rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Whether you're just finishing CDL school or ready to upgrade your current equipment, we'd love to talk about how CRUMS Leasing can support your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to="/get-started">
                      Get a Quote
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="tel:+12103336865">
                      <Phone className="h-4 w-4 mr-2" />
                      (210) 333-6865
                    </a>
                  </Button>
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
                You've learned about finding loads and leasing equipment. The final guide in our New Driver Roadmap covers the business side — setting up your authority, getting insurance, managing taxes, and building a sustainable owner-operator business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/resources/guides/owner-operator-basics">
                    Next: Owner-Operator Business Basics
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources/guides/finding-first-loads">
                    Previous: Finding First Loads
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

export default LeaseFirstTrailer;
