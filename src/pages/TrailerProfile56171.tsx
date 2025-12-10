import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import {
  ArrowRight,
  CheckCircle,
  Truck,
  Calendar,
  Hash,
  Ruler,
  Weight,
  Star,
  Phone,
} from "lucide-react";
import trailerImage from "@/assets/trailers/trailer-56171.webp";

const TrailerProfile56171 = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Dry Van Trailer 56171", url: "https://crumsleasing.com/commercial-dry-van-trailer-for-lease-56171" },
  ]);

  const trailerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "2020 53' Dry Van Trailer for Lease - Unit 56171",
    description: "Well-maintained 2020 dry van trailer available for lease. Recently returned, fully inspected, and ready to roll. Perfect for carriers looking for reliable equipment.",
    brand: {
      "@type": "Brand",
      name: "Great Dane"
    },
    model: "53' Dry Van",
    productionDate: "2020",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "Contact for pricing",
        priceCurrency: "USD"
      },
      seller: {
        "@type": "Organization",
        name: "CRUMS Leasing"
      }
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [trailerSchema, breadcrumbSchema]
  };

  const specs = [
    { label: "Year", value: "2020", icon: Calendar },
    { label: "Type", value: "53' Dry Van", icon: Truck },
    { label: "Trailer Number", value: "56171", icon: Hash },
    { label: "Length", value: "53 feet", icon: Ruler },
    { label: "Interior Width", value: "102 inches", icon: Ruler },
    { label: "Interior Height", value: "110 inches", icon: Ruler },
    { label: "Cargo Capacity", value: "45,000 lbs", icon: Weight },
    { label: "Floor Type", value: "Wood", icon: CheckCircle },
    { label: "Door Type", value: "Swing Doors", icon: CheckCircle },
    { label: "Condition", value: "Excellent", icon: Star },
  ];

  const features = [
    "Recently returned and professionally inspected",
    "DOT compliant and road-ready",
    "LED exterior lighting",
    "Logistic posts for load securement",
    "Air ride suspension",
    "Anti-lock braking system (ABS)",
    "Aluminum roof",
    "Well-maintained floor and walls",
  ];

  const customerTestimonial = {
    quote: "CRUMS Leasing made the whole process easy. The trailer was exactly as described - clean, well-maintained, and ready to work. Their team genuinely cares about their customers.",
    author: "Michael R.",
    role: "Owner Operator",
    rating: 5,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="2020 Dry Van Trailer for Lease - Unit 56171 | CRUMS Leasing"
        description="Lease this well-maintained 2020 53' dry van trailer. Recently returned, fully inspected, and ready to roll. Contact CRUMS Leasing for flexible lease terms."
        canonical="https://crumsleasing.com/commercial-dry-van-trailer-for-lease-56171"
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-12">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="text-center mt-6">
              <Badge className="bg-secondary text-secondary-foreground mb-4">
                Available Now
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Dry Van Trailer For Lease
              </h1>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Recently returned, inspected, and ready to roll
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image */}
              <div>
                <img
                  src={trailerImage}
                  alt="2020 Dry Van Trailer 56171 - CRUMS Leasing"
                  className="w-full rounded-lg shadow-lg"
                  loading="eager"
                  width={800}
                  height={600}
                />
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Badge variant="outline" className="border-primary text-primary">
                    Unit #56171
                  </Badge>
                  <Badge variant="outline" className="border-secondary text-secondary">
                    2020 Model Year
                  </Badge>
                  <Badge className="bg-green-600 text-white">
                    Inspected & Ready
                  </Badge>
                </div>
              </div>

              {/* Specs Card */}
              <div>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Truck className="h-6 w-6 text-primary" />
                      Trailer Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {specs.map((spec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <spec.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{spec.label}</p>
                            <p className="font-semibold text-foreground">{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/contact" className="flex-1">
                          <Button 
                            size="lg" 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={() => trackCtaClick('Request This Trailer', 'trailer_56171', '/contact')}
                          >
                            Request This Trailer
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <a href="tel:+18885704564" className="flex-1">
                          <Button 
                            size="lg" 
                            variant="outline" 
                            className="w-full border-2"
                            onClick={() => trackCtaClick('Call Now', 'trailer_56171', 'tel:+18885704564')}
                          >
                            <Phone className="mr-2 h-5 w-5" />
                            (888) 570-4564
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Trailer Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Testimonial */}
        <section className="py-12 bg-gradient-to-b from-secondary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                What Our Customers Say
              </h2>
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(customerTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <blockquote className="text-lg md:text-xl text-foreground italic mb-6">
                    "{customerTestimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold text-foreground">{customerTestimonial.author}</p>
                    <p className="text-muted-foreground">{customerTestimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Lease This Trailer?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Contact us today to discuss flexible lease terms and get this well-maintained trailer working for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                  onClick={() => trackCtaClick('Get Started Today', 'trailer_56171', '/contact')}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/services/trailer-leasing">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  onClick={() => trackCtaClick('View Leasing Options', 'trailer_56171', '/services/trailer-leasing')}
                >
                  View Leasing Options
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

export default TrailerProfile56171;
