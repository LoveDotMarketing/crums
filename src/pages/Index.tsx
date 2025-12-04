import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Users,
  Shield,
  TrendingUp,
  Calculator,
  BookOpen,
  FileText,
  CheckCircle,
  ArrowRight,
  Heart,
  Award,
  Star,
} from "lucide-react";
import heroImage from "@/assets/hero-truck.jpg";
import fleetImage from "@/assets/crums-trailer.png";
import trailerFleetImage from "@/assets/trailer-fleet.png";
import dryVanTrailerImg from "@/assets/dry-van-trailer.png";
import flatbedTrailerImg from "@/assets/flatbed-trailer.png";
import refrigeratedTrailerImg from "@/assets/refrigerated-trailer.png";
import { SEO } from "@/components/SEO";
import { organizationSchema, generateBreadcrumbSchema, customerReviews, generateReviewSchema } from "@/lib/structuredData";

// Lazy load ChatBot for better initial page load
const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));

const Index = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" }
  ]);

  const reviewSchema = generateReviewSchema(customerReviews);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, reviewSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="53-Foot Dry Van Trailer Leasing & Rentals in Texas"
        description="CRUMS Leasing offers quality 53-foot dry van trailers and flatbed leasing & rental solutions. Family-owned, nationwide service from Bulverde, TX. Get a quote today!"
        canonical="https://crumsleasing.com/"
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Empowering Every Carrier
            <br />
            <span className="text-secondary">To Build the Life They're Proud Of</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-foreground">
            Guided by family values, integrity, and commitment to your success — creating lasting
            partnerships that move people forward and bring them safely home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/mission">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
              >
                Our Mission & Values
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by trucking professionals across Texas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {customerReviews.map((review, index) => (
              <Card key={index} className="border hover:shadow-lg transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {review.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.author}</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                    "{review.text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/reviews">
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Read Reviews
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Referral Program CTA */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Refer a Friend, Earn $250
              </h2>
              <p className="text-primary-foreground text-lg">
                Share the CRUMS experience and get rewarded for every successful referral.
              </p>
            </div>
            <Link to="/referral-program">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6 whitespace-nowrap"
              >
                Join the Referral Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              At CRUMS Leasing, we see a future where every carrier has the freedom, tools, and
              support to build a life they're proud of both on and off the road.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Family First */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Family First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We treat every team member and customer like family — with respect, compassion,
                  and understanding. We know that when we support each other, everyone makes it home
                  safe.
                </p>
              </CardContent>
            </Card>

            {/* Hard Work & Dedication */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Hard Work & Dedication
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We honor the spirit of "CRUMS" by showing up every day with pride, effort, and a
                  willingness to go the extra mile for our customers and our team.
                </p>
              </CardContent>
            </Card>

            {/* Quality You Can Count On */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Quality You Can Count On
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We stand behind every trailer, every promise, and every handshake. Dependability
                  isn't just what we deliver — it's who we are.
                </p>
              </CardContent>
            </Card>

            {/* Integrity in Every Mile */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Integrity in Every Mile
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We do what's right, even when no one's watching. Honesty and accountability guide
                  every decision we make.
                </p>
              </CardContent>
            </Card>

            {/* Relationships Fuel Our Success */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Relationships Fuel Our Success
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We work hard, but we never lose sight of what matters most. Every decision is
                  guided by respect, empathy, and genuine commitment to our customers and team.
                </p>
              </CardContent>
            </Card>

            {/* Keep Moving Forward */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Keep Moving Forward
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We grow, learn, and adapt together. Every challenge is an opportunity to improve
                  ourselves and the company we believe in.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground italic max-w-4xl mx-auto">
              Follow the <span className="text-secondary font-semibold">CRUMS</span> home — to a
              future built on trust, family, and opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src={trailerFleetImage} 
                alt="CRUM'S Leasing trailer fleet" 
                className="w-full max-w-5xl mx-auto rounded-lg shadow-lg"
                loading="lazy"
                width="1280"
                height="720"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              53-Foot Dry Van Trailers & Flatbeds
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Specialized capacity solutions for companies looking to expand their supply chain capabilities with reliable, well-maintained 53-foot dry van trailers and flatbeds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <Truck className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Quality Equipment</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  All 53-foot dry van trailers are thoroughly inspected, well-maintained, and ready to handle your freight capacity needs efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all">
                  <Shield className="h-8 w-8 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Flexible Leasing Terms</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Long-term leasing solutions starting at 12 months, designed to scale with your business and optimize your supply chain operations.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:scale-110 transition-all">
                  <Users className="h-8 w-8 text-accent group-hover:text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Dedicated Support</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Comprehensive support services to keep your leased trailers operational and your supply chain running smoothly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Equipment Types Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Equipment
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Quality trailers for every hauling need — lease or rent with flexible terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/dry-van-trailers" className="block hover:opacity-80 transition-opacity">
                  <img 
                    src={dryVanTrailerImg} 
                    alt="CRUMS Leasing 53-foot dry van trailer - enclosed cargo protection for general freight" 
                    className="w-full h-40 object-contain mb-4"
                    loading="lazy"
                    width="300"
                    height="160"
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Dry Van Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>53' and 48' options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Swing and roll-up doors</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Logistic posts available</span>
                  </li>
                </ul>
                <Link to="/dry-van-trailers" className="text-secondary hover:underline font-medium inline-flex items-center">
                  Learn more about dry van trailers
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/flatbed-trailers" className="block hover:opacity-80 transition-opacity">
                  <img 
                    src={flatbedTrailerImg} 
                    alt="CRUMS Leasing flatbed trailer - open-deck design for oversized and heavy cargo hauling" 
                    className="w-full h-40 object-contain mb-4"
                    loading="lazy"
                    width="300"
                    height="160"
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Flatbed Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Standard and step deck</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Heavy-duty construction</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple tie-down points</span>
                  </li>
                </ul>
                <Link to="/flatbed-trailers" className="text-secondary hover:underline font-medium inline-flex items-center">
                  Learn more about flatbed trailers
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/refrigerated-trailers" className="block hover:opacity-80 transition-opacity">
                  <img 
                    src={refrigeratedTrailerImg} 
                    alt="CRUMS Leasing refrigerated reefer trailer - temperature-controlled transport for perishable goods" 
                    className="w-full h-40 object-contain mb-4"
                    loading="lazy"
                    width="300"
                    height="160"
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Refrigerated Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multi-temperature zones</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Premium insulation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Latest refrigeration units</span>
                  </li>
                </ul>
                <Link to="/refrigerated-trailers" className="text-secondary hover:underline font-medium inline-flex items-center">
                  Learn more about reefer trailers
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Carrier Resources
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Free tools and guides to help you run a more profitable and efficient operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Financial Tools - Featured */}
            <Link to="/resources/tools" className="group">
              <Card className="h-full border-2 border-secondary/50 hover:border-secondary hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-secondary/10 to-background">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-lg bg-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all">
                    <Calculator className="h-8 w-8 text-secondary group-hover:text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">
                    Financial Tools
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Cost per mile calculator, lease vs buy comparison, profit calculators, and more to optimize your business finances.
                  </p>
                  <span className="inline-flex items-center text-secondary font-semibold group-hover:gap-2 transition-all">
                    Try Our Tools <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Industry Guides - Featured */}
            <Link to="/resources/guides/choosing-trailer" className="group">
              <Card className="h-full border-2 border-primary/50 hover:border-primary hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/10 to-background">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <BookOpen className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    How to Choose the Right Trailer
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Learn the key differences between dry vans, flatbeds, and reefers. Find the perfect match for your cargo.
                  </p>
                  <span className="inline-flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Read the Guide <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* More Guides Coming Soon */}
            <Card className="h-full border-2 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Pre-Trip Inspection Checklist
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  A comprehensive DOT-compliant checklist to keep you safe and compliant before every haul.
                </p>
                <span className="inline-flex items-center text-muted-foreground text-sm italic">
                  Coming Soon
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/resources/guides">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Guides & Resources
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={fleetImage}
                alt="Professional fleet management"
                className="rounded-lg shadow-2xl"
                loading="lazy"
                width="800"
                height="600"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why Choose CRUMS Leasing?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We're more than an equipment provider — we're your partner in success.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      Nationwide Coverage
                    </p>
                    <p className="text-muted-foreground">
                      Access to equipment across all major markets with convenient locations
                      coast-to-coast.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      24/7 Customer Support
                    </p>
                    <p className="text-muted-foreground">
                      Our dedicated team is always here to help, ensuring your operations never stop.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      Modern Technology
                    </p>
                    <p className="text-muted-foreground">
                      Advanced customer portal for managing payments, tolls, and fleet operations
                      seamlessly.
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="inline-block mt-8">
                <Button size="lg" variant="outline">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground">
            Join the CRUMS family and experience the difference that integrity, dedication, and
            family values make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6">
                Request A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
              >
                Customer Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <ChatBot userType="customer" />
      </Suspense>
    </div>
  );
};

export default Index;
