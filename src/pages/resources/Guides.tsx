import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  ClipboardCheck, 
  Sofa, 
  Snowflake, 
  Wallet, 
  ChefHat, 
  Heart, 
  AlertTriangle, 
  FileCheck, 
  Fuel, 
  GraduationCap, 
  Brain,
  ArrowRight,
  Calculator,
  BookOpen
} from "lucide-react";

const guidesCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Industry Guides for Carriers - CRUMS Leasing",
  "description": "Free educational guides for carriers and owner-operators. Learn about trailer selection, safety, budgeting, and building a successful trucking career.",
  "url": "https://crumsleasing.com/guides",
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
  }
};

const guides = [
  {
    icon: Truck,
    title: "How to Choose the Right Trailer for Your Haul",
    description: "Break down the difference between flatbeds, reefers, dry vans, and more — with examples of what jobs fit each type.",
    href: "/guides/choosing-trailer",
    available: true
  },
  {
    icon: ClipboardCheck,
    title: "How to Check Your Trailer Before Every Trip",
    description: "Quick, visual pre-trip inspection checklist to avoid breakdowns and DOT violations.",
    href: "/guides/pre-trip-inspection",
    available: false
  },
  {
    icon: Sofa,
    title: "How to Stay Comfortable on the Road (Without Breaking the Bank)",
    description: "Cab organization hacks, sleeping tips, and small upgrades to make life easier in your rig.",
    href: "/guides/road-comfort",
    available: false
  },
  {
    icon: Snowflake,
    title: "How to Handle Winter Roads Like a Pro",
    description: "Driving tips for snow, black ice awareness, and emergency prep — plus, how CRUMS Leasing maintains equipment for safety.",
    href: "/guides/winter-driving",
    available: false
  },
  {
    icon: Wallet,
    title: "How to Budget as a Truck Driver",
    description: "Simple financial strategies for saving on fuel, meals, and maintenance — linking to CRUMS' mission to help drivers build stability.",
    href: "/guides/budgeting",
    available: false
  },
  {
    icon: ChefHat,
    title: "How to Cook a Hot Meal in Your Truck",
    description: "Showcase easy recipes using compact appliances (microwave, hot plate, etc.) — home-cooked comfort on the road.",
    href: "/guides/truck-cooking",
    available: false
  },
  {
    icon: Heart,
    title: "How to Balance Work and Family Time as a Trucker",
    description: "Staying connected with loved ones while on the road — reinforcing CRUMS' family first values.",
    href: "/guides/work-life-balance",
    available: false
  },
  {
    icon: AlertTriangle,
    title: "How to Handle a Breakdown Safely",
    description: "Step-by-step on what to do when stranded — who to call, what to check, and how CRUMS Leasing supports carriers through it.",
    href: "/guides/breakdown-safety",
    available: false
  },
  {
    icon: FileCheck,
    title: "How to Get the Most Out of Your Lease",
    description: "Tips on maintenance, payments, upgrades, and how to protect your investment — perfect for current and future clients.",
    href: "/guides/maximize-lease",
    available: false
  },
  {
    icon: Fuel,
    title: "How to Boost Your Fuel Efficiency",
    description: "Tire pressure, weight distribution, and idle-time tips saving carriers money while promoting CRUMS' well-maintained fleet.",
    href: "/guides/fuel-efficiency",
    available: false
  },
  {
    icon: GraduationCap,
    title: "How to Build a Career in Trucking",
    description: "Advice on networking, certification, and career progression — highlighting CRUMS as a company that believes in long-term success.",
    href: "/guides/trucking-career",
    available: false
  },
  {
    icon: Brain,
    title: "How to Keep Your Mind Sharp and Positive on the Road",
    description: "Focus on mental health, staying alert, reducing stress, and keeping a positive mindset during long hauls.",
    href: "/guides/mental-health",
    available: false
  }
];

const Guides = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Industry Guides for Carriers"
        description="Free educational guides for carriers and owner-operators. Learn about trailer selection, safety, budgeting, and building a successful trucking career with CRUMS Leasing."
        canonical="https://crumsleasing.com/guides"
        structuredData={guidesCollectionSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Industry Guides</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Practical knowledge and tips to help you succeed on the road — from choosing the right trailer to building a lasting career.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Financial Tools Quick Link */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Financial Tools</h2>
                <p className="text-sm text-muted-foreground">Calculators for cost analysis, IFTA, and more</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/resources/tools">
                View All Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Carrier How-To Guides
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-world advice from the trucking industry. Each guide is designed to help you save time, money, and stress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  guide.available 
                    ? 'hover:border-primary cursor-pointer' 
                    : 'opacity-90'
                }`}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                  <CardDescription className="text-sm">{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {guide.available ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={guide.href}>
                        Read Guide
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center py-2 px-4 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground font-medium">Coming Soon</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Hit the Road with CRUMS?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-6 text-primary-foreground/90">
            Whether you need a trailer lease or just have questions, our team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/get-started">Get a Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/resources">Back to Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guides;
