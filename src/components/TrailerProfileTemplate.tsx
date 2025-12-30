import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import {
  ArrowRight,
  CheckCircle,
  Truck,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  LucideIcon,
} from "lucide-react";

export interface TrailerSpec {
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface CustomerTestimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

export interface TrailerProfileData {
  // Basic Info
  unitNumber: string;
  year: string;
  make: string;
  type: string;
  slug: string;
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImage?: string;
  
  // Display
  heroTitle: string;
  heroSubtitle: string;
  availabilityBadge: string;
  
  // Images
  mainImage: string;
  mainImageAlt: string;
  galleryImages: GalleryImage[];
  schemaImages?: string[];
  
  // Content
  specs: TrailerSpec[];
  features: string[];
  testimonial?: CustomerTestimonial;
  
  // Badges
  badges?: Array<{
    text: string;
    variant?: "default" | "outline" | "secondary";
    className?: string;
  }>;
}

interface TrailerProfileTemplateProps {
  data: TrailerProfileData;
}

export const TrailerProfileTemplate = ({ data }: TrailerProfileTemplateProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: `${data.type} ${data.unitNumber}`, url: data.canonicalUrl },
  ]);

  const trailerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${data.year} ${data.type} for Lease - Unit ${data.unitNumber}`,
    description: data.seoDescription,
    image: data.schemaImages || [data.mainImage],
    brand: {
      "@type": "Brand",
      name: data.make
    },
    model: data.type,
    productionDate: data.year,
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

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    if (e.key === "ArrowLeft") {
      setSelectedImageIndex((prev) => (prev === 0 ? data.galleryImages.length - 1 : prev - 1));
    } else if (e.key === "ArrowRight") {
      setSelectedImageIndex((prev) => (prev === data.galleryImages.length - 1 ? 0 : prev + 1));
    } else if (e.key === "Escape") {
      setLightboxOpen(false);
    }
  }, [lightboxOpen, data.galleryImages.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const defaultBadges = [
    { text: `Unit #${data.unitNumber}`, variant: "outline" as const, className: "border-primary text-primary" },
    { text: `${data.year} Model Year`, variant: "outline" as const, className: "border-secondary text-secondary" },
    { text: "Inspected & Ready", variant: "default" as const, className: "bg-green-600 text-white" },
  ];

  const badges = data.badges || defaultBadges;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        canonical={data.canonicalUrl}
        ogImage={data.ogImage}
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              {data.availabilityBadge}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {data.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
              {data.heroSubtitle}
            </p>
          </div>
        </section>

        <Breadcrumbs />

        {/* Main Content */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image */}
              <div>
                <img
                  src={data.mainImage}
                  alt={data.mainImageAlt}
                  className="w-full rounded-lg shadow-lg"
                  loading="eager"
                  width={800}
                  height={600}
                />
                <div className="mt-4 flex gap-2 flex-wrap">
                  {badges.map((badge, index) => (
                    <Badge 
                      key={index} 
                      variant={badge.variant || "default"}
                      className={badge.className}
                    >
                      {badge.text}
                    </Badge>
                  ))}
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
                      {data.specs.map((spec, index) => (
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
                            onClick={() => trackCtaClick('Request This Trailer', `trailer_${data.unitNumber}`, '/contact')}
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
                            onClick={() => trackCtaClick('Call Now', `trailer_${data.unitNumber}`, 'tel:+18885704564')}
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
        {data.features.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Trailer Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Inspection Gallery */}
        {data.galleryImages.length > 0 && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
                Inspection Gallery
              </h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                Browse detailed photos from our professional inspection showing the exterior, interior, and key features of this trailer.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.galleryImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width={300}
                      height={300}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lightbox Dialog */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black/95 border-none">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? data.galleryImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === data.galleryImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>

              {/* Image */}
              <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <img
                  src={data.galleryImages[selectedImageIndex]?.src}
                  alt={data.galleryImages[selectedImageIndex]?.alt}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
                {/* Caption */}
                <p className="text-white text-center mt-4 px-4 text-sm md:text-base max-w-3xl">
                  {data.galleryImages[selectedImageIndex]?.alt}
                </p>
                {/* Image counter */}
                <p className="text-white/60 text-sm mt-2">
                  {selectedImageIndex + 1} / {data.galleryImages.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Testimonial */}
        {data.testimonial && (
          <section className="py-12 bg-gradient-to-b from-secondary/10 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                  What Our Customers Say
                </h2>
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(data.testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <blockquote className="text-lg md:text-xl text-foreground italic mb-6">
                      "{data.testimonial.quote}"
                    </blockquote>
                    <div>
                      <p className="font-semibold text-foreground">{data.testimonial.author}</p>
                      <p className="text-muted-foreground">{data.testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

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
                  onClick={() => trackCtaClick('Get Started Today', `trailer_${data.unitNumber}`, '/contact')}
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
                  onClick={() => trackCtaClick('View Leasing Options', `trailer_${data.unitNumber}`, '/services/trailer-leasing')}
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

export default TrailerProfileTemplate;
