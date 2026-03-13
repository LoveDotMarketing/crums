import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  CheckCircle, 
  DollarSign,
  ArrowRight,
  FileText,
  Shield,
  Calculator,
  Building,
  Fuel,
  ClipboardList,
  Target,
  TrendingUp
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
  "headline": "Owner-Operator Basics: Start Your Trucking Business",
  "description": "Essential business guide: MC numbers, operating authority, insurance, IFTA, LLC setup, and first-year planning for owner-operators.",
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
  "mainEntityOfPage": "https://crumsleasing.com/resources/guides/owner-operator-basics"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an MC number and do I need one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An MC (Motor Carrier) number is your operating authority from FMCSA that allows you to haul freight for hire across state lines. You need one if you're operating as an independent owner-operator hauling for brokers or shippers. If you're leased to a carrier that provides their authority, you operate under theirs."
      }
    },
    {
      "@type": "Question",
      "name": "How much does trucking insurance cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "New owner-operators typically pay $12,000-$20,000 per year for full coverage including liability, cargo, and physical damage. Rates depend on your driving record, experience, equipment, and the types of freight you haul. Rates decrease as you build experience and a clean record."
      }
    },
    {
      "@type": "Question",
      "name": "Should I form an LLC for my trucking business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most owner-operators benefit from forming an LLC. It provides liability protection (separating personal and business assets), tax flexibility, and professionalism when dealing with brokers and shippers. Formation costs $50-$500 depending on your state."
      }
    },
    {
      "@type": "Question",
      "name": "What is IFTA and how does it work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "IFTA (International Fuel Tax Agreement) simplifies fuel tax reporting for trucks operating in multiple states. You track miles driven and fuel purchased in each state, then file quarterly returns. You pay or receive credits based on where you drove versus where you bought fuel."
      }
    },
    {
      "@type": "Question",
      "name": "What tax deductions can truck drivers claim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Common deductions include fuel, truck payments, insurance, maintenance, tolls, scales, per diem (meals), permits, phone and internet, accounting fees, and equipment. Keep detailed records and receipts — proper documentation can save thousands in taxes."
      }
    },
    {
      "@type": "Question",
      "name": "How much should I save for taxes as an owner-operator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Set aside 25-30% of your net income for federal and state taxes, plus self-employment tax. Make quarterly estimated payments to avoid penalties. Working with a trucking-specialized accountant is highly recommended."
      }
    }
  ]
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Owner-Operator Basics", url: "https://crumsleasing.com/resources/guides/owner-operator-basics" },
]);

const OwnerOperatorBasics = () => {
  const startupChecklist = [
    { category: "Legal Setup", items: ["Form LLC or business entity", "Get EIN from IRS", "Open business bank account", "Get business credit card"] },
    { category: "Operating Authority", items: ["Apply for MC number", "Get USDOT number", "Register with UCR", "Get BOC-3 filing"] },
    { category: "Insurance", items: ["Liability insurance ($750K-$1M)", "Cargo insurance", "Physical damage (if financed)", "Occupational accident"] },
    { category: "Compliance", items: ["IFTA license", "IRP registration", "State permits (overweight, etc.)", "ELD device"] }
  ];

  const insuranceTypes = [
    {
      type: "Primary Liability",
      coverage: "$750,000 - $1,000,000",
      purpose: "Covers damage/injury you cause to others",
      required: true
    },
    {
      type: "Cargo Insurance",
      coverage: "$100,000+",
      purpose: "Covers freight you're hauling if damaged/lost",
      required: true
    },
    {
      type: "Physical Damage",
      coverage: "Value of equipment",
      purpose: "Covers your truck and trailer",
      required: false
    },
    {
      type: "Bobtail/Non-Trucking",
      coverage: "Varies",
      purpose: "Covers you when not under dispatch",
      required: false
    },
    {
      type: "Occupational Accident",
      coverage: "Varies",
      purpose: "Medical/disability for work injuries",
      required: false
    }
  ];

  const taxDeductions = [
    "Fuel costs",
    "Truck payments/interest",
    "Trailer lease payments",
    "Insurance premiums",
    "Maintenance and repairs",
    "Tires",
    "Tolls and scales",
    "Per diem (meals)",
    "Permits and licenses",
    "Phone and internet",
    "Accounting/legal fees",
    "ELD subscription",
    "Load board subscriptions",
    "Truck washes"
  ];

  const firstYearTips = [
    {
      title: "Keep Detailed Records",
      description: "Track every expense, mile, and load. Use apps like Quickbooks Self-Employed or TruckingOffice. Good records save money at tax time."
    },
    {
      title: "Save for Taxes",
      description: "Set aside 25-30% of net income immediately. Make quarterly estimated payments. Don't get caught with a surprise tax bill."
    },
    {
      title: "Build an Emergency Fund",
      description: "Aim for 3-6 months of expenses in reserve. Trucks break down, rates fluctuate, and unexpected costs happen."
    },
    {
      title: "Get a Trucking Accountant",
      description: "Industry-specialized CPAs know deductions you'll miss and keep you IRS-compliant. Worth every penny."
    },
    {
      title: "Don't Chase Every Load",
      description: "Running cheap freight to stay busy costs you money. It's better to wait for profitable loads or reposition strategically."
    },
    {
      title: "Invest in Relationships",
      description: "Good broker relationships lead to consistent, quality freight. Be reliable, communicate well, and build your reputation."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Owner-Operator Basics: Start Your Trucking Business"
        description="Essential business guide: MC numbers, operating authority, insurance, IFTA, LLC setup, and first-year planning for owner-operators."
        canonical="https://crumsleasing.com/resources/guides/owner-operator-basics"
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
              <Briefcase className="h-12 w-12" />
            </div>
            <p className="text-sm uppercase tracking-wider mb-2 text-primary-foreground/80">New Driver Roadmap — Step 5 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Owner-Operator Business Basics
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Running your own trucking business is more than driving — it's managing authority, insurance, taxes, and compliance. This guide covers the essential business knowledge every owner-operator needs.
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
                Congratulations — you've learned how to get your CDL, find loads, and secure equipment. Now it's time to understand the business side of being an owner-operator. This final guide in our New Driver Roadmap covers the legal, financial, and operational essentials that separate successful owner-operators from those who struggle.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Getting this foundation right saves you from costly mistakes, IRS problems, and compliance violations that can derail your business before it starts.
              </p>
            </div>

            {/* Startup Checklist */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <ClipboardList className="h-6 w-6 text-primary" />
                Owner-Operator Startup Checklist
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {startupChecklist.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Operating Authority */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <FileText className="h-6 w-6 text-primary" />
                Understanding Operating Authority
              </h2>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4 text-foreground">MC Number vs. Operating Under Authority</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium text-foreground mb-2">Your Own Authority (MC Number)</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Haul for any broker or shipper</li>
                      <li>• Full responsibility for insurance</li>
                      <li>• Handle your own compliance</li>
                      <li>• Keep 100% of the rate</li>
                      <li>• More paperwork and responsibility</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Leased to a Carrier</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Operate under their authority</li>
                      <li>• They provide insurance umbrella</li>
                      <li>• Less compliance burden</li>
                      <li>• They take a percentage</li>
                      <li>• Good option for new drivers</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Pro Tip:</strong> Many new owner-operators start leased to a carrier to learn the business, then get their own authority once they understand the industry.
                </p>
              </div>
            </div>

            {/* Insurance Requirements */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Shield className="h-6 w-6 text-primary" />
                Insurance Requirements
              </h2>
              <p className="text-muted-foreground mb-6">
                Insurance is your biggest expense after fuel. Understanding what you need (and what you don't) saves money while keeping you protected.
              </p>
              <div className="space-y-4">
                {insuranceTypes.map((insurance, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{insurance.type}</h3>
                            {insurance.required && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Required</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{insurance.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">{insurance.coverage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Budget:</strong> New owner-operators should budget $12,000-$20,000/year ($1,000-$1,700/month) for full insurance coverage. Get multiple quotes and consider a trucking-focused insurance broker.
                </p>
              </div>
            </div>

            {/* IFTA Explained */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Fuel className="h-6 w-6 text-primary" />
                IFTA: Fuel Tax Made Simple
              </h2>
              <p className="text-muted-foreground mb-6">
                IFTA (International Fuel Tax Agreement) lets you report fuel taxes to one state instead of filing separately in every state you drive through. Here's how it works:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">1. Track Miles</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Record miles driven in each state using your ELD or trip logs.
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">2. Track Fuel</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Keep receipts showing gallons purchased in each state.
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">3. File Quarterly</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Pay taxes where you drove more than you fueled, get credits where you fueled more than drove.
                  </CardContent>
                </Card>
              </div>
              <Button asChild variant="outline">
                <Link to="/resources/tools/ifta-calculator">
                  <Calculator className="h-4 w-4 mr-2" />
                  IFTA Tax Estimator
                </Link>
              </Button>
            </div>

            {/* Tax Deductions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <DollarSign className="h-6 w-6 text-primary" />
                Tax Deductions for Owner-Operators
              </h2>
              <p className="text-muted-foreground mb-6">
                Tracking deductions is one of the most important habits for an owner-operator. These common deductions add up to thousands in tax savings:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {taxDeductions.map((deduction, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{deduction}</span>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline">
                <Link to="/resources/tools/tax-deductions">
                  <FileText className="h-4 w-4 mr-2" />
                  Complete Tax Deduction Guide
                </Link>
              </Button>
            </div>

            {/* LLC Setup */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Building className="h-6 w-6 text-primary" />
                Setting Up Your Business Entity
              </h2>
              <p className="text-muted-foreground mb-6">
                Most owner-operators form an LLC (Limited Liability Company) for their trucking business. Here's why and how:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Why Form an LLC?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><strong className="text-foreground">Liability Protection:</strong> Separates personal assets from business debts and lawsuits.</p>
                    <p><strong className="text-foreground">Tax Flexibility:</strong> Choose how you're taxed (sole prop, S-corp, etc.).</p>
                    <p><strong className="text-foreground">Professionalism:</strong> Brokers and shippers prefer working with established entities.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Steps to Form</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Choose a business name and state</li>
                      <li>File articles of organization ($50-$500)</li>
                      <li>Get an EIN from IRS (free)</li>
                      <li>Open a business bank account</li>
                      <li>Keep personal and business finances separate</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* First Year Tips */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Target className="h-6 w-6 text-primary" />
                First Year Success Tips
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {firstYearTips.map((tip, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {tip.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {tip.description}
                    </CardContent>
                  </Card>
                ))}
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

            {/* Roadmap Complete */}
            <div className="bg-primary text-primary-foreground rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">🎉 You've Completed the New Driver Roadmap!</h2>
              <p className="text-primary-foreground/90 mb-6">
                You now have a solid foundation for starting your trucking career — from getting your CDL to finding loads, leasing equipment, and running your business. The road ahead won't always be easy, but with this knowledge, you're better prepared than most.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Link to="/resources/guides/getting-your-cdl" className="bg-primary-foreground/10 rounded-lg p-4 hover:bg-primary-foreground/20 transition-colors">
                  <p className="text-sm text-primary-foreground/70">Step 1</p>
                  <p className="font-medium">Getting Your CDL</p>
                </Link>
                <Link to="/resources/guides/load-boards-guide" className="bg-primary-foreground/10 rounded-lg p-4 hover:bg-primary-foreground/20 transition-colors">
                  <p className="text-sm text-primary-foreground/70">Step 2</p>
                  <p className="font-medium">Understanding Load Boards</p>
                </Link>
                <Link to="/resources/guides/finding-first-loads" className="bg-primary-foreground/10 rounded-lg p-4 hover:bg-primary-foreground/20 transition-colors">
                  <p className="text-sm text-primary-foreground/70">Step 3</p>
                  <p className="font-medium">Finding First Loads</p>
                </Link>
                <Link to="/resources/guides/lease-first-trailer" className="bg-primary-foreground/10 rounded-lg p-4 hover:bg-primary-foreground/20 transition-colors">
                  <p className="text-sm text-primary-foreground/70">Step 4</p>
                  <p className="font-medium">Why Lease Your First Trailer</p>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/dry-van-trailer-leasing">
                    Lease a Dry Van Trailer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/semi-trailer-leasing">
                    Semi Trailer Leasing
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources">
                    Explore More Resources
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GuideRelatedContent currentSlug="owner-operator-basics" />
      <Footer />
    </div>
  );
};

export default OwnerOperatorBasics;
