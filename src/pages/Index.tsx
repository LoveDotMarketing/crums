import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Users,
  Shield,
  TrendingUp,
  MapPin,
  CheckCircle,
  ArrowRight,
  Heart,
  Award,
  Target,
  Star,
} from "lucide-react";
import heroImage from "@/assets/hero-truck.jpg";
import fleetImage from "@/assets/crums-trailer.png";
import teamImage from "@/assets/team-handshake.jpg";
import trailerFleetImage from "@/assets/trailer-fleet.png";
import { ChatBot } from "@/components/ChatBot";
import { SEO } from "@/components/SEO";
import { organizationSchema, generateBreadcrumbSchema, customerReviews, generateReviewSchema } from "@/lib/structuredData";

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
            Empowering Every Trucker
            <br />
            <span className="text-secondary">To Build the Life They're Proud Of</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-foreground/90">
            Guided by family values, integrity, and commitment to your success — creating lasting
            partnerships that move people forward and bring them safely home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/get-started">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/mission">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
              >
                Our Mission & Values
              </Button>
            </a>
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
            <a href="/reviews">
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Read Reviews
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
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
              <p className="text-primary-foreground/90 text-lg">
                Share the CRUMS experience and get rewarded for every successful referral.
              </p>
            </div>
            <a href="/referral-program">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6 whitespace-nowrap"
              >
                Join the Referral Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
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
              At CRUMS Leasing, we see a future where every trucker has the freedom, tools, and
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
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Nationwide Coverage
                    </h4>
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
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      24/7 Customer Support
                    </h4>
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
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Modern Technology
                    </h4>
                    <p className="text-muted-foreground">
                      Advanced customer portal for managing payments, tolls, and fleet operations
                      seamlessly.
                    </p>
                  </div>
                </div>
              </div>
              <a href="/about" className="inline-block mt-8">
                <Button size="lg" variant="outline">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
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
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join the CRUMS family and experience the difference that integrity, dedication, and
            family values make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6">
                Request A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
              >
                Customer Portal Login
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot userType="customer" />
    </div>
  );
};

export default Index;
