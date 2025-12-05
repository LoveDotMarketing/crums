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
  ArrowRight,
  Star,
} from "lucide-react";
import trailerFleetImage from "@/assets/trailer-fleet.png";
import { SEO } from "@/components/SEO";
import { organizationSchema, generateBreadcrumbSchema, customerReviews, generateReviewSchema } from "@/lib/structuredData";

// Lazy load ChatBot for better initial page load
const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));

// Lazy load below-fold sections for better performance
const CoreValuesSection = lazy(() => import("@/components/home/CoreValuesSection").then(m => ({ default: m.CoreValuesSection })));
const EquipmentSection = lazy(() => import("@/components/home/EquipmentSection").then(m => ({ default: m.EquipmentSection })));
const CarrierResourcesSection = lazy(() => import("@/components/home/CarrierResourcesSection").then(m => ({ default: m.CarrierResourcesSection })));
const WhyChooseUsSection = lazy(() => import("@/components/home/WhyChooseUsSection").then(m => ({ default: m.WhyChooseUsSection })));

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
        <picture className="absolute inset-0 w-full h-full">
          <source srcSet="/images/hero-truck.webp" type="image/webp" />
          <img 
            src="/images/hero-truck.jpg" 
            alt="CRUMS Leasing semi-truck on highway" 
            className="w-full h-full object-cover"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70"></div>

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

      {/* Lazy loaded below-fold sections */}
      <Suspense fallback={<div className="py-20 bg-gradient-to-b from-muted to-background" />}>
        <CoreValuesSection />
      </Suspense>

      {/* Services Overview */}
      <section className="py-20 bg-background content-deferred">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src={trailerFleetImage} 
                alt="CRUM'S Leasing trailer fleet" 
                className="w-full max-w-5xl mx-auto rounded-lg shadow-lg"
                loading="lazy"
                decoding="async"
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

      {/* Equipment Types Section - Lazy loaded */}
      <Suspense fallback={<div className="py-20 bg-muted" />}>
        <EquipmentSection />
      </Suspense>

      {/* Carrier Resources Section - Lazy loaded */}
      <Suspense fallback={<div className="py-20 bg-background" />}>
        <CarrierResourcesSection />
      </Suspense>

      {/* Why Choose Us - Lazy loaded */}
      <Suspense fallback={<div className="py-20 bg-muted" />}>
        <WhyChooseUsSection />
      </Suspense>

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
