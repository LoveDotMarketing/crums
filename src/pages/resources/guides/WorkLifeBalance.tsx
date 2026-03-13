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
  Heart,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Phone,
  CheckCircle2,
  Video,
  Calendar,
  MessageSquare,
  Gift,
  Home,
  Users,
  Smartphone,
  Star
} from "lucide-react";

const articleData = {
  title: "How to Balance Work and Family Time as a Carrier",
  description: "Staying connected with loved ones while on the road. Practical strategies for truck drivers to maintain strong family relationships.",
  publishedDate: "2026-03-05",
  updatedDate: "2026-03-05",
  readTime: "10 min read",
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
    "@id": "https://crumsleasing.com/resources/guides/work-life-balance"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How can truck drivers stay connected with family?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schedule regular video calls at consistent times, use messaging apps throughout the day, share your location so family can follow your journey, participate in bedtime routines via video, and make your home time count with fully present, quality moments."
      }
    },
    {
      "@type": "Question",
      "name": "What's the best schedule for OTR drivers with families?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many drivers find success with 2-3 weeks out followed by 3-4 days home. Regional routes offering weekly home time are ideal for families with young children. The key is consistency—families adapt better to predictable schedules than unpredictable ones."
      }
    }
  ]
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Guides", href: "/resources/guides" },
  { label: "Work-Life Balance", href: "/resources/guides/work-life-balance" }
];

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Work-Life Balance", url: "https://crumsleasing.com/resources/guides/work-life-balance" }
]);

const navigation = {
  previous: {
    title: "Cooking in Your Truck",
    href: "/resources/guides/truck-cooking"
  },
  next: {
    title: "Get the Most Out of Your Lease",
    href: "/resources/guides/maximize-lease"
  }
};

const connectionStrategies = [
  {
    icon: Video,
    title: "Video Calls",
    description: "Schedule daily video calls at the same time. Bedtime stories, homework help, or just catching up—video beats voice calls for connection."
  },
  {
    icon: MessageSquare,
    title: "Throughout-Day Messaging",
    description: "Send photos, voice messages, and quick texts. Share your journey—interesting sights, meals, or thoughts—to stay part of daily life."
  },
  {
    icon: Calendar,
    title: "Shared Calendar",
    description: "Know what's happening at home. Track school events, appointments, and activities so you can ask about them specifically."
  },
  {
    icon: Gift,
    title: "Small Surprises",
    description: "Send postcards from different cities, order small gifts for delivery, or bring back regional treats. Small gestures show you're thinking of them."
  }
];

const homeTimeStrategies = [
  {
    title: "Be Fully Present",
    tips: [
      "Put away your phone during family time",
      "Avoid catching up on truck maintenance first thing",
      "Let your body adjust before diving into chores",
      "Focus on connection, not just tasks"
    ]
  },
  {
    title: "Create Rituals",
    tips: [
      "Special first-night-home dinner",
      "Weekly family activity (movie, park, etc.)",
      "One-on-one time with each child",
      "Date night with your partner"
    ]
  },
  {
    title: "Plan Ahead",
    tips: [
      "Schedule important events around home time",
      "Communicate your schedule early",
      "Have backup plans for delays",
      "Involve family in route planning when possible"
    ]
  }
];

export default function WorkLifeBalance() {
  return (
    <>
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/work-life-balance"
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
                At CRUMS Leasing, we believe in <strong>family first</strong>. That's not just a slogan—it's why we built this company. We know that trucking is more than a job; it's a lifestyle that affects everyone you love.
              </p>
              <p>
                The miles can be hard on relationships, but with intentional effort and the right strategies, you can maintain strong connections even when you're thousands of miles away.
              </p>
            </section>

            {/* Connection While Away */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Staying Connected While Away
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose">
                {connectionStrategies.map((strategy, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <strategy.icon className="h-5 w-5 text-primary" />
                        {strategy.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Daily Routine */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Building a Connection Routine
              </h2>
              
              <div className="bg-muted/50 rounded-lg p-6 my-6 not-prose">
                <h3 className="font-semibold mb-4">Sample Daily Connection Schedule</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-primary w-20">Morning</span>
                    <span>Quick "good morning" message or voice note</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-primary w-20">Lunch</span>
                    <span>Share a photo of where you are or what you're eating</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-primary w-20">Evening</span>
                    <span>15-30 minute video call (during their dinner or before bedtime)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-primary w-20">Night</span>
                    <span>"Goodnight" message before they sleep</span>
                  </div>
                </div>
              </div>
              
              <p>
                Consistency matters more than length. A quick daily check-in beats an hour-long call once a week.
              </p>
            </section>

            {/* Making Home Time Count */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                Making Home Time Count
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 not-prose">
                {homeTimeStrategies.map((category, index) => (
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

            {/* For Partners */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                A Note for Partners at Home
              </h2>
              
              <p>
                The partner at home carries a heavy load too—managing the household, the kids, the day-to-day. Success requires teamwork:
              </p>
              
              <ul className="space-y-2 not-prose my-4">
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <span>Share the mental load by using shared apps for groceries, bills, and calendars</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <span>Acknowledge each other's challenges—both roles are hard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <span>Build a support network of other trucking families</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <span>Communicate openly about what's working and what isn't</span>
                </li>
              </ul>
            </section>

            {/* CTA */}
            <section className="my-12 not-prose">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Family First at CRUMS Leasing</h3>
                      <p className="text-muted-foreground mb-4">
                        We built this company on family values. We understand the sacrifices drivers make—and we're here to support your success, on and off the road.
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

      <GuideRelatedContent currentSlug="work-life-balance" />
      <Footer />
    </>
  );
}
