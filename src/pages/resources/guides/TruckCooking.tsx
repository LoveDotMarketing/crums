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
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Phone,
  CheckCircle2,
  Flame,
  Refrigerator,
  UtensilsCrossed,
  Timer,
  DollarSign,
  Heart,
  Zap
} from "lucide-react";

const articleData = {
  title: "How to Cook a Hot Meal in Your Truck",
  description: "Easy recipes and cooking setups for truck drivers. Learn to prepare healthy, home-cooked meals on the road using compact appliances.",
  publishedDate: "2026-02-26",
  updatedDate: "2026-02-26",
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
    "@id": "https://crumsleasing.com/resources/guides/truck-cooking"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What cooking appliances work best in a truck?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The most popular options are 12V cookers (lunch box warmers), portable induction cooktops (with inverter), microwaves, and electric pressure cookers. 12V lunch box warmers are the most practical as they don't require an inverter and work while driving."
      }
    },
    {
      "@type": "Question",
      "name": "How much can truck drivers save by cooking their own meals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Truck drivers can save $200-400 per month by cooking instead of eating at truck stops. A truck stop meal costs $12-20, while a home-cooked meal costs $3-6. Over a year, that's $2,400-4,800 in savings."
      }
    },
    {
      "@type": "Question",
      "name": "What are easy meals to make in a truck?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Easy truck meals include stews and soups in a slow cooker, rice and beans, grilled sandwiches, pasta dishes, eggs and bacon, oatmeal, and pre-portioned meals you can reheat. Focus on one-pot meals that require minimal prep and cleanup."
      }
    }
  ]
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Guides", href: "/resources/guides" },
  { label: "Truck Cooking", href: "/resources/guides/truck-cooking" }
];

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Truck Cooking", url: "https://crumsleasing.com/resources/guides/truck-cooking" }
]);

const navigation = {
  previous: {
    title: "How to Budget as a Truck Driver",
    href: "/resources/guides/budgeting"
  },
  next: {
    title: "Work-Life Balance for Carriers",
    href: "/resources/guides/work-life-balance"
  }
};

const cookingAppliances = [
  {
    name: "12V Lunch Box Warmer",
    pros: ["No inverter needed", "Works while driving", "Low power draw"],
    cons: ["Slow cooking (2-3 hours)", "Limited size"],
    cost: "$25-50",
    bestFor: "Heating pre-made meals, stews, soups"
  },
  {
    name: "Portable Induction Cooktop",
    pros: ["Fast cooking", "Versatile", "Safe (no open flame)"],
    cons: ["Requires inverter", "Uses significant power"],
    cost: "$40-80",
    bestFor: "Real cooking: eggs, stir-fry, anything"
  },
  {
    name: "12V Microwave",
    pros: ["Fast reheating", "Familiar to use"],
    cons: ["Limited cooking options", "Power draw"],
    cost: "$100-200",
    bestFor: "Reheating leftovers, frozen meals"
  },
  {
    name: "Electric Pressure Cooker",
    pros: ["Fast, versatile cooking", "One-pot meals"],
    cons: ["Requires inverter", "Takes up space"],
    cost: "$60-100",
    bestFor: "Stews, rice, beans, full meals"
  }
];

const easyRecipes = [
  {
    name: "Trucker Stew",
    time: "3 hours (12V) or 30 min (pressure cooker)",
    ingredients: ["Beef chunks", "Potatoes", "Carrots", "Onion", "Beef broth", "Seasoning"],
    instructions: "Combine all ingredients in your cooker. Set and forget until ready."
  },
  {
    name: "Breakfast Burrito",
    time: "15 minutes",
    ingredients: ["Eggs", "Cheese", "Tortillas", "Pre-cooked sausage", "Salsa"],
    instructions: "Scramble eggs on induction top, add cheese and sausage, wrap in tortilla."
  },
  {
    name: "Pasta & Sauce",
    time: "20 minutes",
    ingredients: ["Pasta", "Jarred sauce", "Ground beef or sausage", "Parmesan"],
    instructions: "Boil pasta, brown meat, combine with sauce and cheese."
  }
];

export default function TruckCooking() {
  return (
    <>
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/truck-cooking"
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
                Eating well on the road isn't just about saving money—it's about feeling better, having more energy, and staying healthier for the long haul. With the right setup, you can enjoy hot, home-cooked meals anywhere your truck takes you.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6 my-6 not-prose">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Save $200-400/month</p>
                    <p className="text-sm text-muted-foreground">vs. truck stop meals</p>
                  </div>
                  <div>
                    <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Eat Healthier</p>
                    <p className="text-sm text-muted-foreground">Control ingredients</p>
                  </div>
                  <div>
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">More Energy</p>
                    <p className="text-sm text-muted-foreground">Better nutrition</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cooking Appliances */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Flame className="h-6 w-6 text-primary" />
                Cooking Appliances for Your Truck
              </h2>
              
              <div className="space-y-4 not-prose">
                {cookingAppliances.map((appliance, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{appliance.name}</CardTitle>
                        <Badge variant="outline">{appliance.cost}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Best for:</strong> {appliance.bestFor}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-primary mb-1">Pros:</p>
                          <ul className="space-y-1">
                            {appliance.pros.map((pro, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Cons:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            {appliance.cons.map((con, i) => (
                              <li key={i}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Essential Gear */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                Essential Cooking Gear
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Refrigerator className="h-5 w-5 text-primary" />
                      Food Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• 12V cooler or mini-fridge</li>
                      <li>• Stackable food containers</li>
                      <li>• Zip-lock bags for portioning</li>
                      <li>• Collapsible water container</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                      Utensils & Supplies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Compact pot and pan set</li>
                      <li>• Sharp knife and cutting board</li>
                      <li>• Reusable plates and utensils</li>
                      <li>• Paper towels and dish soap</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Easy Recipes */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                Easy Truck Recipes
              </h2>
              
              <div className="space-y-4 not-prose">
                {easyRecipes.map((recipe, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <Badge variant="outline" className="gap-1">
                          <Timer className="h-3 w-3" />
                          {recipe.time}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">
                        <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>How to:</strong> {recipe.instructions}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 not-prose">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Focus on Driving, We Handle the Trailer</h3>
                      <p className="text-muted-foreground mb-4">
                        CRUMS Leasing provides reliable, well-maintained trailers so you can focus on living well on the road.
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

      <GuideRelatedContent currentSlug="truck-cooking" />
      <Footer />
    </>
  );
}
