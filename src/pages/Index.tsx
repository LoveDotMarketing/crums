import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { trackCtaClick, trackPhoneClick, trackEvent, fireMetaCapi } from "@/lib/analytics";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  Newspaper,
  MapPin,
  Phone,
  Briefcase,
  DollarSign,
} from "lucide-react";
// Marketing images served from public folder for stable sitemap URLs
const fleetImage = "/images/crums-trailer-for-lease.webp";
const nationwideMapImage = "/images/crums-leasing-pickup-delivery-map.webp";
const servicesOverviewImage = "/images/crums-trailers-hero.png";
const dryVanTrailerImg = "/images/dry-van-trailer.webp";
const flatbedTrailerImg = "/images/flatbed-trailer.webp";

const trailer56171Img = "/images/trailers/trailer-56171.webp";
import whyChooseCrumsThumbnail from "@/assets/why-choose-crums-thumbnail.png";
import { SEO } from "@/components/SEO";
import { organizationSchema, generateBreadcrumbSchema, customerReviews, generateReviewSchema } from "@/lib/structuredData";
import { locations, HEADQUARTERS } from "@/lib/locations";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

// Lazy load ChatBot for better initial page load
const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));

const Index = () => {
  useTimeOnPageTracking('home');
  useEffect(() => { fireMetaCapi({ eventName: 'ViewContent' }); }, []);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" }
  ]);

  const reviewSchema = generateReviewSchema(customerReviews);

  // FAQ data for structured data and UI
  const faqs = [
    {
      question: "What types of trailers does CRUMS Leasing offer?",
      answer: "CRUMS Leasing offers 53-foot dry van trailers and flatbed trailers. Our dry vans are ideal for general freight and enclosed cargo, while flatbeds are perfect for oversized or heavy loads."
    },
    {
      question: "What is the minimum lease term for trailer leasing?",
      answer: "Our minimum lease term is 12 months. We offer flexible leasing options that can scale with your business needs, with competitive rates for longer-term commitments."
    },
    {
      question: "Do you offer short-term trailer rentals?",
      answer: "Yes, we offer short-term trailer rentals for seasonal demand, special projects, or temporary capacity needs. Contact us for availability and rental rates for dry van and flatbed trailers."
    },
    {
      question: "What areas do you serve for trailer leasing?",
      answer: "While headquartered in Bulverde, Texas, CRUMS Leasing provides nationwide trailer leasing and rental services. We offer local pickup in the Texas Triangle (San Antonio, Austin, Houston, Dallas) and delivery options throughout the United States."
    },
    {
      question: "What are the benefits of leasing vs. buying a trailer?",
      answer: "Leasing offers lower upfront costs, predictable monthly payments, access to well-maintained equipment, and flexibility to scale your fleet without the capital investment of purchasing. It also eliminates maintenance headaches and depreciation concerns."
    },
    {
      question: "Do you offer a lease-to-own option?",
      answer: "Yes! Our lease-to-own program lets you build equity with every monthly payment and work toward full trailer ownership. It's a great option for carriers who want the flexibility of leasing now with the goal of owning their equipment long-term. Contact us to learn more."
    },
    {
      question: "Can I rent a trailer just for storage?",
      answer: "Absolutely. Our rent-for-storage program lets you use a dry van trailer as secure, weather-protected on-site storage. It's ideal for businesses that need extra warehouse space, seasonal inventory overflow, or a mobile storage solution. Reach out for availability and rates."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, reviewSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
        <SEO
        title="Dry Van & Flatbed Trailer Leasing in Texas"
        description="CRUMS Leasing offers dry van and flatbed trailer leasing & rental solutions. Family-owned, nationwide service from San Antonio, TX. Get a quote today!"
        canonical="https://crumsleasing.com/"
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-[680px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        <img 
          src="/images/hero-truck.webp" 
          alt="CRUMS Leasing semi-truck on highway" 
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70"></div>

        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="bg-secondary/90 text-secondary-foreground mb-4 text-sm px-4 py-1">
            Need a trailer fast? We deliver nationwide.
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Dry Van & Flatbed Trailer Leasing
            <br />
            <span className="text-secondary">Empowering Every Carrier to Succeed</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-foreground">
            Quality dry van and flatbed trailers guided by family values, integrity, and commitment to your success — creating lasting partnerships that move people forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                onClick={() => trackCtaClick('Free Quote', 'hero', '/contact')}
              >
                Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+18885704564">
              <Button
                size="lg"
                variant="outline"
                className="bg-primary-foreground border-2 border-primary-foreground text-primary hover:bg-transparent hover:text-primary-foreground text-lg px-8 py-6"
                onClick={() => trackPhoneClick('hero')}
              >
                <Phone className="mr-2 h-5 w-5" />
                1-888-570-4564
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/trailer-leasing" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
              Trailer Leasing
            </Link>
            <Link to="/services/lease-to-own" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
              Lease to Own
            </Link>
            <Link to="/services/rent-for-storage" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
              Rent for Storage
            </Link>
          </div>
        </div>
      </section>

      {/* Event CTA Banner */}
      <section className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-secondary-foreground text-sm md:text-base">
            <Newspaper className="h-5 w-5 flex-shrink-0" />
            <p>
              Join us at the{" "}
              <Link 
                to="/news/mats-2026-crums-leasing-booth-38024" 
                className="font-semibold underline hover:no-underline"
              >
                Mid America Trucking Show
              </Link>
              . Booth 38024. Meet Eric Bledsoe and explore our fleet.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-10 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">No Hidden Fees</h3>
              <p className="text-xs text-muted-foreground mt-1">Simple, transparent contracts</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">GPS-Equipped Fleet</h3>
              <p className="text-xs text-muted-foreground mt-1">Peace of mind tracking</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Well-Maintained</h3>
              <p className="text-xs text-muted-foreground mt-1">Inspected before every lease</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Flexible Terms</h3>
              <p className="text-xs text-muted-foreground mt-1">Starting at 12 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Roll - Featured Trailer */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Roll
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recently returned, inspected, and prepared for your next haul
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Link to="/commercial-dry-van-trailer-for-lease-56171" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto">
                    <img
                      src={trailer56171Img}
                      alt="2020 Dry Van Trailer 56171 available for lease"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                    />
                    <Badge className="absolute top-4 left-4 bg-green-600 text-white">
                      Available Now
                    </Badge>
                  </div>
                  <CardContent className="p-6 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      Dry Van Trailer For Lease
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-medium w-32">Year</span>
                        <span className="text-foreground font-semibold">2020</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-medium w-32">Type</span>
                        <span className="text-foreground font-semibold">Dry Van</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-medium w-32">Trailer Number</span>
                        <span className="text-foreground font-semibold">56171</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        trackCtaClick('View Trailer Details', 'fleet', '/commercial-dry-van-trailer-for-lease-56171');
                        trackEvent('trailer_detail_view', {
                          trailer_number: '56171',
                          trailer_type: 'Dry Van',
                        });
                        window.location.href = '/commercial-dry-van-trailer-for-lease-56171';
                      }}
                    >
                      View Trailer Details
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <Link 
            to="/why-choose-crums" 
            className="block max-w-3xl mx-auto group"
            onClick={() => {
              trackCtaClick('Featured Video', 'video', '/why-choose-crums');
              trackEvent('video_play', {
                video_title: 'Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals',
                page_section: 'homepage_video',
              });
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6 group-hover:text-primary transition-colors">
              Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals
            </h2>
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src={whyChooseCrumsThumbnail}
                alt="Why CDL Drivers Choose CRUMS Leasing - trailer with basketballs video thumbnail"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
                width={889}
                height={500}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-secondary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="h-8 w-8 md:h-10 md:w-10 text-secondary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Semantic Router - Quick Navigation Clusters */}
      <section className="py-12 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Services Cluster */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Services
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dry-van-trailer-leasing" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Dry Van Leasing
                  </Link>
                </li>
                <li>
                  <Link to="/flatbed-trailer-leasing" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Flatbed Leasing
                  </Link>
                </li>
                <li>
                  <Link to="/semi-trailer-leasing" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Semi Trailer Leasing
                  </Link>
                </li>
                <li>
                  <Link to="/services/trailer-rentals" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-secondary" />
                    Trailer Rentals
                  </Link>
                </li>
                <li>
                  <Link to="/services/fleet-solutions" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    Fleet Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trailer Types Cluster */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Trailer Types
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dry-van-trailers" className="text-foreground hover:text-primary font-medium">
                    Dry Van Trailers
                  </Link>
                </li>
                <li>
                  <Link to="/flatbed-trailers" className="text-foreground hover:text-primary font-medium">
                    Flatbed Trailers
                  </Link>
                </li>
                <li>
                  <Link to="/dry-van-trailer-leasing" className="text-foreground hover:text-primary font-medium">
                    Dry Van Trailer Leasing
                  </Link>
                </li>
                <li>
                  <Link to="/flatbed-trailer-leasing" className="text-foreground hover:text-primary font-medium">
                    Flatbed Trailer Leasing
                  </Link>
                </li>
                <li>
                  <Link to="/semi-trailer-leasing" className="text-foreground hover:text-primary font-medium">
                    Semi Trailer Leasing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Decision Support Cluster */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Decision Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/resources/guides/choosing-trailer" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Choosing the Right Trailer
                  </Link>
                </li>
                <li>
                  <Link to="/resources/guides/why-leasing-dry-van" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Why Leasing is Smart
                  </Link>
                </li>
                <li>
                  <Link to="/resources/tools/lease-vs-buy" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-secondary" />
                    Lease vs Buy Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/resources/tools/cost-per-mile" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-secondary" />
                    Cost Per Mile Calculator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trust Cluster */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Why CRUMS
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/why-choose-crums" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-secondary" />
                    Why Choose CRUMS
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-secondary" />
                    Customer Reviews
                  </Link>
                </li>
                <li>
                  <Link to="/get-started" className="text-foreground hover:text-primary font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Thank a Veteran Featured Section */}
      <section className="py-12 bg-brand-navy">
        <div className="container mx-auto px-4">
          <Link 
            to="/veterans-military-discount"
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 group"
            onClick={() => trackCtaClick('Veterans Discount', 'veterans_banner', '/veterans-military-discount')}
          >
            <img 
              src="/images/thank-a-veteran.png" 
              alt="Thank a Veteran - Military Discount Program" 
              className="h-24 md:h-32 w-auto group-hover:scale-105 transition-transform"
              loading="lazy"
              decoding="async"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-secondary transition-colors">
                Veterans & Military Discount
              </h2>
              <p className="text-white/80 text-lg max-w-xl">
                CRUMS Leasing proudly offers 10% off for veterans and active-duty military. Learn more about our program.
              </p>
            </div>
          </Link>
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
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                onClick={() => trackCtaClick('Read Reviews', 'home', '/reviews')}
              >
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
                onClick={() => trackCtaClick('Join the Referral Program', 'home', '/referral-program')}
              >
                Join the Referral Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* We're Hiring Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              <Briefcase className="h-3 w-3 mr-1" />
              We're Hiring
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Growing Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Be part of a family-owned company that values relationships, integrity, and your success.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Link to="/careers/trailer-leasing-sales-rep" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Trailer Leasing Sales Representative
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>San Antonio, TX</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="self-start md:self-center border-green-600 text-green-600 font-semibold">
                      <DollarSign className="h-3 w-3 mr-1" />
                      $30K + Commission
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Join our team as a relationship-driven sales rep. Lease trailers, manage customer accounts, and grow with a company that prioritizes long-term partnerships.
                  </p>
                  <Button 
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      trackCtaClick('View Job Details', 'home', '/careers/trailer-leasing-sales-rep');
                      window.location.href = '/careers/trailer-leasing-sales-rep';
                    }}
                  >
                    View Job Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About CRUMS Leasing
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                CRUMS Leasing was founded by former NBA player Eric Bledsoe with a simple mission: 
                to empower independent carriers with the equipment they need to succeed. 
                Named after Eric's mother, CRUMS represents the family values and hard work ethic 
                that drive everything we do.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Based in Bulverde, Texas, we're more than just a trailer leasing company — we're partners 
                in your success. Our team understands the challenges of the trucking industry because we've 
                built relationships with drivers and carriers across the country.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/about">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => trackCtaClick('Learn More About Us', 'home', '/about')}
                  >
                    Learn More About Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/crums-story">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                    onClick={() => trackCtaClick('The CRUMS Story', 'home', '/crums-story')}
                  >
                    The CRUMS Story
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <ProgressiveImage 
                src="/images/our-story-image.webp" 
                alt="CRUMS Leasing team and trailer fleet" 
                className="rounded-lg shadow-xl w-full"
                width={600}
                height={400}
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-lg shadow-lg hidden md:block">
                <p className="text-3xl font-bold">Family-Owned</p>
                <p className="text-sm">& Operated Since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Serving Carriers Nationwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick up at our Bulverde, TX yard or get delivery to major markets across the country
            </p>
          </div>

          {/* Trailer Fleet Image */}
          <div className="max-w-4xl mx-auto mb-12">
            <img 
              src={nationwideMapImage}
              alt="CRUMS Leasing nationwide pickup and delivery map - serving all 50 states from Texas"
              className="w-full h-auto rounded-xl shadow-lg"
              loading="lazy"
              decoding="async"
              width={1200}
              height={600}
            />
          </div>
          {/* Headquarters Highlight */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-primary/20 bg-background">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center md:text-left flex-grow">
                    <h3 className="text-xl font-bold text-foreground mb-1">CRUMS Leasing Headquarters</h3>
                    <p className="text-muted-foreground">
                      {HEADQUARTERS.address}, {HEADQUARTERS.city}, {HEADQUARTERS.stateAbbr} {HEADQUARTERS.zip}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong className="text-foreground">Local or passing through?</strong> Pick up at our yard. Otherwise, we deliver nationwide.
                    </p>
                  </div>
                  <Link to="/locations" className="flex-shrink-0">
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => trackCtaClick('View All Locations', 'home', '/locations')}
                    >
                      View All Locations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Cities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {locations.map((location) => (
              <Link
                key={location.slug}
                to={`/locations/${location.slug}`}
                className="group"
                onClick={() => {
                  trackCtaClick(`Location: ${location.city}`, 'home', `/locations/${location.slug}`);
                  trackEvent('location_click', {
                    location_name: location.city,
                    page_section: 'locations',
                  });
                }}
              >
                <Card className="border hover:border-primary/50 hover:shadow-md transition-all h-full">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {location.city}
                    </h4>
                    <p className="text-xs text-muted-foreground">{location.stateAbbr}</p>
                    {location.isPickupFriendly && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                        Pickup
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/locations">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => trackCtaClick('See All Locations', 'home', '/locations')}
              >
                See All {locations.length} Locations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gradient-to-b from-muted to-background content-deferred">
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
      <section className="py-20 bg-background content-deferred">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-8">
              <ProgressiveImage 
                src={servicesOverviewImage} 
                alt="CRUMS Leasing trailer fleet - 53-foot dry van and flatbed trailers"
                className="w-full max-w-5xl mx-auto rounded-lg shadow-lg"
                width={1280}
                height={720}
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Dry Van & Flatbed Trailers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Specialized capacity solutions for carriers looking to expand their supply chain capabilities with reliable dry van trailers and flatbeds.
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
                  All dry van and flatbed trailers are thoroughly inspected, well-maintained, and ready to handle your freight capacity needs.
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
      <section className="py-20 bg-muted content-deferred">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Equipment
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Quality trailers for every hauling need — lease or rent with flexible terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link to="/dry-van-trailers" className="block hover:opacity-80 transition-opacity">
                  <ProgressiveImage 
                    src={dryVanTrailerImg} 
                    alt="CRUMS Leasing 53-foot dry van trailer - enclosed cargo protection for general freight" 
                    className="w-full h-40 object-contain mb-4"
                    width={300}
                    height={160}
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
                  <ProgressiveImage 
                    src={flatbedTrailerImg} 
                    alt="CRUMS Leasing flatbed trailer - open-deck design for oversized and heavy cargo hauling" 
                    className="w-full h-40 object-contain mb-4"
                    width={300}
                    height={160}
                  />
                </Link>
                <h3 className="text-xl font-bold mb-4">Flatbed Trailers</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>48-foot lengths available</span>
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
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/50 content-deferred">
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
                    Learn the key differences between dry vans and flatbeds. Find the perfect match for your cargo.
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
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => trackCtaClick('View All Guides & Resources', 'home', '/resources/guides')}
              >
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
              <ProgressiveImage
                src={fleetImage}
                alt="CRUMS Leasing dry van trailer"
                className="w-full h-auto"
                width={1400}
                height={644}
                placeholderColor="transparent"
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
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => trackCtaClick('Learn More About Us', 'home', '/about')}
                >
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Ways to Work With Us */}
      <section className="py-16 bg-background border-b content-deferred">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              More Ways to Work With Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond standard leasing and rentals, we offer flexible arrangements to fit how you operate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <DollarSign className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Lease to Own</h3>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  Build equity with every monthly payment and work toward full trailer ownership — no large upfront purchase required.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                  onClick={() => trackCtaClick('Lease to Own CTA', 'home', '/contact')}
                >
                  Ask About Lease to Own
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-5">
                  <Briefcase className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Rent for Storage</h3>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  Use a dry van trailer as secure, weather-protected on-site storage — perfect for seasonal inventory, overflow, or mobile warehousing.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center text-secondary font-semibold hover:underline"
                  onClick={() => trackCtaClick('Rent for Storage CTA', 'home', '/contact')}
                >
                  Ask About Storage Rentals
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              Common Questions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trailer Leasing FAQ
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about our dry van and flatbed trailer leasing services.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-background border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Have more questions about trailer leasing or rentals?
              </p>
              <Link to="/contact">
                <Button 
                  variant="outline"
                  onClick={() => trackCtaClick('Contact Us FAQ', 'home', '/contact')}
                >
                  Contact Our Team
                  <ArrowRight className="ml-2 h-4 w-4" />
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
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                onClick={() => trackCtaClick('Request A Quote', 'home', '/contact')}
              >
                Request A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                onClick={() => trackCtaClick('Customer Portal Login', 'home', '/login')}
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
