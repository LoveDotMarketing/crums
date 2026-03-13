import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sofa,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Phone,
  CheckCircle2,
  Bed,
  Music,
  Coffee,
  Thermometer,
  Lightbulb,
  ShoppingBag,
  Utensils,
  Shirt,
  Battery
} from "lucide-react";

const articleData = {
  title: "How to Stay Comfortable on the Road (Without Breaking the Bank)",
  description: "Cab organization hacks, sleeping tips, and small upgrades to make life easier in your rig. Practical advice for long-haul truck drivers.",
  publishedDate: "2026-02-12",
  updatedDate: "2026-02-12",
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
    "@id": "https://crumsleasing.com/resources/guides/road-comfort"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How can I sleep better in my truck cab?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Invest in a quality mattress topper, use blackout curtains, maintain a consistent sleep schedule, keep the cab cool (65-68°F), and use white noise apps to block outside sounds. Avoid caffeine 6 hours before sleep and limit screen time before bed."
      }
    },
    {
      "@type": "Question",
      "name": "What are the best cab organization tips for truckers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use hanging organizers, stackable containers, under-bunk storage bins, magnetic strips for small items, and over-door shoe organizers for snacks and supplies. Keep frequently used items within arm's reach and designate specific spots for everything."
      }
    },
    {
      "@type": "Question",
      "name": "How can I stay comfortable during long hauls without spending much?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Focus on low-cost improvements: a good seat cushion ($20-40), quality sunglasses, a small cooler for healthy snacks, comfortable driving shoes, and proper hydration. Many comfort upgrades cost under $50 and make a significant difference."
      }
    }
  ]
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Guides", href: "/resources/guides" },
  { label: "Road Comfort", href: "/resources/guides/road-comfort" }
];

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Road Comfort", url: "https://crumsleasing.com/resources/guides/road-comfort" }
]);

const navigation = {
  previous: {
    title: "Pre-Trip Inspection Guide",
    href: "/resources/guides/pre-trip-inspection"
  },
  next: {
    title: "How to Budget as a Truck Driver",
    href: "/resources/guides/budgeting"
  }
};

const comfortCategories = [
  {
    icon: Bed,
    title: "Sleep Quality",
    items: [
      "Memory foam mattress topper (2-3 inches)",
      "Blackout curtains or window covers",
      "Quality pillow for neck support",
      "White noise app or small fan",
      "Consistent sleep schedule"
    ]
  },
  {
    icon: Thermometer,
    title: "Climate Control",
    items: [
      "Portable 12V fan for summer",
      "Electric blanket for winter",
      "Sunshade for windshield",
      "Reflective window covers",
      "Small space heater (when parked)"
    ]
  },
  {
    icon: ShoppingBag,
    title: "Organization",
    items: [
      "Hanging closet organizer",
      "Under-bunk storage containers",
      "Dashboard phone mount",
      "Trash can with lid",
      "Magnetic strips for tools"
    ]
  },
  {
    icon: Utensils,
    title: "Eating Well",
    items: [
      "12V cooler or mini-fridge",
      "Portable microwave or hot plate",
      "Reusable containers and utensils",
      "Healthy snack storage system",
      "Collapsible sink for dishes"
    ]
  }
];

const budgetUpgrades = [
  { item: "Seat cushion with lumbar support", cost: "$25-50", impact: "High" },
  { item: "Blackout curtains", cost: "$15-30", impact: "High" },
  { item: "Quality sunglasses (polarized)", cost: "$20-40", impact: "Medium" },
  { item: "Foam mattress topper", cost: "$40-80", impact: "High" },
  { item: "12V cooler", cost: "$30-60", impact: "Medium" },
  { item: "Hanging organizers", cost: "$10-20", impact: "Medium" },
  { item: "Phone mount", cost: "$15-25", impact: "Medium" },
  { item: "LED reading light", cost: "$10-20", impact: "Low" }
];

export default function RoadComfort() {
  return (
    <>
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/road-comfort"
        structuredData={[articleSchema, faqSchema, breadcrumbSchema]}
      />
      <Navigation />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Article Header */}
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

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-lg leading-relaxed">
                Life on the road doesn't have to mean sacrificing comfort. Whether you're running regional routes or coast-to-coast hauls, small investments in your cab setup can dramatically improve your quality of life—and your driving performance.
              </p>
              <p>
                The key is focusing on what matters most: <strong>good sleep, proper organization, comfortable seating, and the ability to eat well</strong>. You don't need to spend thousands; many of the best upgrades cost under $50.
              </p>
            </section>

            {/* Comfort Categories */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Sofa className="h-6 w-6 text-primary" />
                The Four Pillars of Road Comfort
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose">
                {comfortCategories.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-primary" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Sleep Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Bed className="h-6 w-6 text-primary" />
                Mastering Sleep on the Road
              </h2>
              
              <p>
                Poor sleep affects everything: reaction time, decision-making, mood, and long-term health. Here's how to optimize your sleeper berth:
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6 my-6 not-prose">
                <h3 className="font-semibold mb-4">The Perfect Sleep Environment</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-primary">Temperature:</strong> Keep it cool, 65-68°F is ideal
                  </div>
                  <div>
                    <strong className="text-primary">Darkness:</strong> Complete blackout is essential
                  </div>
                  <div>
                    <strong className="text-primary">Noise:</strong> Use white noise to mask outside sounds
                  </div>
                  <div>
                    <strong className="text-primary">Routine:</strong> Same bedtime whenever possible
                  </div>
                </div>
              </div>
              
              <p>
                A quality mattress topper is the single best investment for sleep. Factory mattresses are often thin and uncomfortable—a 2-3 inch memory foam topper costs $40-80 and lasts for years.
              </p>
            </section>

            {/* Budget Upgrades Table */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Best Budget Comfort Upgrades
              </h2>
              
              <div className="overflow-x-auto not-prose">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Item</th>
                      <th className="text-left py-3 px-4">Cost</th>
                      <th className="text-left py-3 px-4">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetUpgrades.map((upgrade, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{upgrade.item}</td>
                        <td className="py-3 px-4">{upgrade.cost}</td>
                        <td className="py-3 px-4">
                          <Badge variant={upgrade.impact === "High" ? "default" : "secondary"}>
                            {upgrade.impact}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mental Wellness */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Battery className="h-6 w-6 text-primary" />
                Staying Energized
              </h2>
              
              <p>
                Comfort isn't just physical. Mental freshness matters too:
              </p>
              
              <ul className="space-y-2 my-4">
                <li className="flex items-start gap-2">
                  <Music className="h-5 w-5 text-primary mt-0.5" />
                  <span><strong>Entertainment:</strong> Podcasts, audiobooks, and music playlists keep your mind engaged</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coffee className="h-5 w-5 text-primary mt-0.5" />
                  <span><strong>Hydration:</strong> Keep water accessible; dehydration causes fatigue</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shirt className="h-5 w-5 text-primary mt-0.5" />
                  <span><strong>Comfort clothes:</strong> Change into fresh clothes after driving for better sleep</span>
                </li>
              </ul>
            </section>

            {/* CTA Section */}
            <section className="my-12 not-prose">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Ready to Hit the Road?</h3>
                      <p className="text-muted-foreground mb-4">
                        CRUMS Leasing provides well-maintained trailers so you can focus on what matters—comfortable, profitable miles.
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

          {/* Navigation */}
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

      <GuideRelatedContent currentSlug="road-comfort" />
      <Footer />
    </>
  );
}
