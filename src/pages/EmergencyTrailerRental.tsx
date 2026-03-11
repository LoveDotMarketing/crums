import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Clock, 
  Truck, 
  CheckCircle, 
  ArrowRight,
  AlertTriangle,
  Zap,
  MapPin,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { trackCtaClick, trackPhoneClick } from "@/lib/analytics";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { HEADQUARTERS } from "@/lib/locations";

const EmergencyTrailerRental = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Emergency Trailer Rental", url: "https://crumsleasing.com/emergency-trailer-rental" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Emergency Commercial Trailer Rental",
    "provider": {
      "@type": "LocalBusiness",
      "name": "CRUMS Leasing",
      "telephone": "+1-888-570-4564"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "description": "Same-day response for urgent trailer needs. Emergency dry van and flatbed trailer rental with fast turnaround for breakdown replacements and urgent freight capacity.",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  };

  const faqItems = [
    {
      question: "How fast can you get me a trailer?",
      answer: "We respond to emergency requests within hours. For Texas Triangle locations (San Antonio, Austin, Houston, Dallas), same-day pickup may be available. For nationwide delivery, we'll work with you to meet your deadline."
    },
    {
      question: "My trailer broke down mid-route — can you help?",
      answer: "Absolutely. Call us immediately at 1-888-570-4564. We'll coordinate a replacement trailer and get you back on the road. We understand downtime costs money."
    },
    {
      question: "I just landed a last-minute load and need a trailer by tomorrow",
      answer: "We work with carriers who need capacity fast. Call us with the details — where you need it, what type of trailer, and when. We'll do everything we can to make it happen."
    },
    {
      question: "What if I need a trailer for just one week?",
      answer: "We offer short-term rentals for urgent or temporary needs. Whether it's a week, a month, or a seasonal spike, we have flexible options."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(faq => ({
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
    "@graph": [breadcrumbSchema, serviceSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Emergency Trailer Rental | Same-Day Response"
        description="Need a trailer fast? CRUMS Leasing offers emergency trailer rental with same-day response. Breakdown replacements, urgent capacity, and last-minute loads. Call 1-888-570-4564."
        canonical="https://crumsleasing.com/emergency-trailer-rental"
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge className="bg-secondary/90 text-secondary-foreground mb-4 text-sm px-4 py-1">
              <Zap className="h-4 w-4 mr-1 inline" />
              Same-Day Response Available
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Emergency Trailer Rental
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Trailer broke down? Last-minute load? We respond fast so you can keep earning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+18885704564">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                  onClick={() => trackPhoneClick('emergency-hero')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now: 1-888-570-4564
                </Button>
              </a>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  onClick={() => trackCtaClick('Emergency Quote', 'emergency-trailer-rental', '/contact')}
                >
                  Request Urgent Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Breadcrumbs />

        {/* When You Need Us Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
              When You Need a Trailer Fast
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: AlertTriangle,
                  title: "Breakdown Replacement",
                  desc: "Your trailer is out of commission and freight needs to move. We'll get you a replacement fast."
                },
                {
                  icon: Zap,
                  title: "Last-Minute Load",
                  desc: "Just landed a load but don't have the capacity? We can help you say yes to the opportunity."
                },
                {
                  icon: Clock,
                  title: "Seasonal Surge",
                  desc: "Holiday rush or harvest season hitting hard? Scale up your fleet without long-term commitments."
                },
                {
                  icon: Truck,
                  title: "Overflow Capacity",
                  desc: "Your current fleet is maxed out but the loads keep coming. Add capacity when you need it."
                }
              ].map((item) => (
                <Card key={item.title} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose CRUMS for Emergencies */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Why Carriers Call CRUMS When Time is Critical
                </h2>
                <div className="space-y-4">
                  {[
                    { text: "Real people answer the phone — no automated runaround", icon: Phone },
                    { text: "Same-day quote turnaround for urgent requests", icon: Clock },
                    { text: "GPS-equipped trailers ready to roll", icon: MapPin },
                    { text: "Flexible terms for short-term and emergency rentals", icon: CheckCircle },
                    { text: "Nationwide delivery — we come to you", icon: Truck },
                    { text: "Family-owned company that understands your business", icon: Shield }
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <item.icon className="h-5 w-5 text-secondary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="border-2 bg-background">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
                    Call Us Now
                  </h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Talk to a real person who can help you get a trailer today.
                  </p>
                  <a href="tel:+18885704564" className="block">
                    <Button
                      size="lg"
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xl py-6"
                      onClick={() => trackPhoneClick('emergency-card')}
                    >
                      <Phone className="mr-2 h-6 w-6" />
                      1-888-570-4564
                    </Button>
                  </a>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p><strong>Hours:</strong> Mon-Fri 9am-5:30pm | Sat 9am-12pm</p>
                    <p className="mt-2">Headquarters: {HEADQUARTERS.city}, {HEADQUARTERS.stateAbbr}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trailer Types Available */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Trailers Available for Emergency Rental
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <Truck className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">53' Dry Van Trailers</h3>
                  <p className="text-muted-foreground mb-4">
                    Our most popular option for general freight. Enclosed, secure, and ready for the road.
                  </p>
                  <Link 
                    to="/dry-van-trailers"
                    className="text-primary hover:underline font-medium inline-flex items-center"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6">
                  <Truck className="h-10 w-10 text-secondary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Flatbed Trailers</h3>
                  <p className="text-muted-foreground mb-4">
                    For oversized loads, construction materials, and heavy equipment. 48-foot lengths available.
                  </p>
                  <Link 
                    to="/flatbed-trailers"
                    className="text-secondary hover:underline font-medium inline-flex items-center"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqItems.map((faq, index) => (
                <div key={index} className="border-b border-border pb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Don't Let Downtime Cost You Money
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Every hour without a trailer is money lost. Call us now and let's get you back on the road.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+18885704564">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                  onClick={() => trackPhoneClick('emergency-cta')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  1-888-570-4564
                </Button>
              </a>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  onClick={() => trackCtaClick('Get Quote', 'emergency-trailer-rental', '/contact')}
                >
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EmergencyTrailerRental;
