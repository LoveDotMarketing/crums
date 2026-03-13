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
import { 
  Wallet,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Phone,
  CheckCircle2,
  DollarSign,
  Fuel,
  Wrench,
  Shield,
  PiggyBank,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Target
} from "lucide-react";

const articleData = {
  title: "How to Budget as a Truck Driver",
  description: "Simple financial strategies for saving on fuel, meals, and maintenance. Learn how to build financial stability as an owner-operator or company driver.",
  publishedDate: "2026-02-19",
  updatedDate: "2026-02-19",
  readTime: "12 min read",
  author: "Eric",
  authorSlug: "eric"
};

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
    "url": "https://crumsleasing.com/about/eric"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com",
    "logo": { "@type": "ImageObject", "url": "https://crumsleasing.com/logo.png" }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://crumsleasing.com/resources/guides/budgeting"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much should a truck driver save for emergencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Aim for 3-6 months of operating expenses as an emergency fund. For most owner-operators, this means $15,000-$30,000. Start with a goal of $5,000 and build from there. This covers unexpected repairs, slow freight periods, and personal emergencies."
      }
    },
    {
      "@type": "Question",
      "name": "What percentage of income should go to fuel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fuel typically represents 25-35% of gross revenue for owner-operators. If you're spending more than 35%, focus on fuel efficiency improvements, better route planning, and using fuel discount programs. Company drivers don't pay for fuel directly but should still track expenses."
      }
    },
    {
      "@type": "Question",
      "name": "How can truck drivers save money on food?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Invest in a 12V cooler and prepare meals in your truck. This can save $200-400 per month compared to eating at truck stops. Stock up on groceries when you're near affordable stores, and use the per diem tax deduction to offset meal costs."
      }
    }
  ]
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Guides", href: "/resources/guides" },
  { label: "Budgeting", href: "/resources/guides/budgeting" }
];

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Budgeting", url: "https://crumsleasing.com/resources/guides/budgeting" }
]);

const navigation = {
  previous: {
    title: "Road Comfort Guide",
    href: "/resources/guides/road-comfort"
  },
  next: {
    title: "Cooking in Your Truck",
    href: "/resources/guides/truck-cooking"
  }
};

const expenseCategories = [
  { category: "Fuel", percentage: "25-35%", icon: Fuel },
  { category: "Insurance", percentage: "8-12%", icon: Shield },
  { category: "Truck Payment", percentage: "15-20%", icon: DollarSign },
  { category: "Trailer Lease", percentage: "5-10%", icon: DollarSign },
  { category: "Maintenance", percentage: "5-10%", icon: Wrench },
  { category: "Food & Living", percentage: "10-15%", icon: PiggyBank }
];

const savingsTips = [
  {
    title: "Fuel Savings",
    tips: [
      "Use fuel discount cards (Pilot, Love's, TCS)",
      "Plan routes to fuel in cheaper states",
      "Maintain proper tire pressure",
      "Limit idling time",
      "Use cruise control on highways"
    ]
  },
  {
    title: "Food Savings",
    tips: [
      "Invest in a 12V cooler or mini-fridge",
      "Prepare meals in your truck",
      "Stock up at grocery stores, not truck stops",
      "Use the per diem tax deduction",
      "Bring refillable water bottles"
    ]
  },
  {
    title: "Maintenance Savings",
    tips: [
      "Follow preventive maintenance schedules",
      "Learn basic repairs yourself",
      "Buy quality parts that last longer",
      "Keep detailed maintenance records",
      "Address small issues before they grow"
    ]
  }
];

export default function Budgeting() {
  return (
    <>
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/budgeting"
        structuredData={[articleSchema, faqSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} />
          
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                Guide
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {articleData.readTime}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {articleData.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {articleData.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By <Link to={`/about/${articleData.authorSlug}`} className="text-primary hover:underline">{articleData.author}</Link></span>
              <span>•</span>
              <span>Updated {new Date(articleData.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </header>

          <Separator className="mb-8" />

          <article className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="mb-12">
              <p className="text-lg leading-relaxed">
                Financial stability is the foundation of a successful trucking career. Whether you're a company driver saving for your own truck or an owner-operator building a business, understanding where your money goes—and how to keep more of it—is essential.
              </p>
              <p>
                At CRUMS Leasing, we believe in helping drivers build long-term success. That starts with smart money management.
              </p>
            </section>

            {/* Expense Breakdown */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Understanding Your Expenses
              </h2>
              
              <p>
                For owner-operators, here's where your revenue typically goes:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6 not-prose">
                {expenseCategories.map((expense, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <expense.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-semibold">{expense.category}</p>
                      <p className="text-2xl font-bold text-primary">{expense.percentage}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <p>
                After all expenses, owner-operators typically keep <strong>10-25% as profit</strong>. The key to increasing that margin is controlling variable expenses—especially fuel and food.
              </p>
            </section>

            {/* Emergency Fund */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <PiggyBank className="h-6 w-6 text-primary" />
                Building Your Emergency Fund
              </h2>
              
              <div className="bg-muted/50 rounded-lg p-6 my-6 not-prose">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Why You Need Cash Reserves</h3>
                    <p className="text-sm text-muted-foreground">
                      A single major breakdown can cost $5,000-$15,000. Slow freight seasons happen. Personal emergencies don't wait. Without savings, you're one bad week away from financial crisis.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Emergency Fund Targets:</h3>
              <ul className="space-y-2 not-prose">
                <li className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span><strong>Starter Goal:</strong> $5,000 (covers most single repairs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span><strong>Solid Goal:</strong> $15,000 (1-2 months operating expenses)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span><strong>Ideal Goal:</strong> $30,000+ (3-6 months cushion)</span>
                </li>
              </ul>
            </section>

            {/* Savings Tips */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Money-Saving Strategies
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 not-prose">
                {savingsTips.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Tools Link */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Use Our Free Calculators</h2>
              <p>
                Track your finances with our free trucking calculators:
              </p>
              <ul className="not-prose space-y-2 my-4">
                <li>
                  <Link to="/resources/tools/cost-per-mile" className="text-primary hover:underline flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Cost Per Mile Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/resources/tools/profit-calculator" className="text-primary hover:underline flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Profit Per Load Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/resources/tools/per-diem-calculator" className="text-primary hover:underline flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Per Diem Calculator
                  </Link>
                </li>
              </ul>
            </section>

            {/* CTA */}
            <section className="my-12 not-prose">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Predictable Payments Help You Budget</h3>
                      <p className="text-muted-foreground mb-4">
                        CRUMS Leasing offers fixed monthly trailer payments—no surprises. Know exactly what your equipment costs each month.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link to="/get-started">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="tel:+18885704564">
                            <Phone className="mr-2 h-4 w-4" />
                            (888) 570-4564
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

          </article>

          <Separator className="my-8" />
          
          <nav className="flex justify-between items-center">
            <Button variant="ghost" asChild>
              <Link to={navigation.previous.href} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{navigation.previous.title}</span>
                <span className="sm:hidden">Previous</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to={navigation.next.href} className="flex items-center gap-2">
                <span className="hidden sm:inline">{navigation.next.title}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </main>

      <GuideRelatedContent currentSlug="budgeting" />
      <Footer />
    </>
  );
}
