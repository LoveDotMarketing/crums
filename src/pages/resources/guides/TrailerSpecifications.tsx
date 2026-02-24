import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Ruler, Box, Truck, Weight, ArrowRight, CheckCircle } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const TrailerSpecifications = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Resources", url: "https://crumsleasing.com/resources" },
    { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
    { name: "Trailer Specifications", url: "https://crumsleasing.com/resources/guides/trailer-specifications" }
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many cubic feet is a 53 foot trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 53-foot dry van trailer has approximately 3,489 cubic feet of cargo space. Interior dimensions are typically 53' length x 102\" width x 110\" height, accommodating up to 26 standard pallets (48\" x 40\")."
        }
      },
      {
        "@type": "Question",
        "name": "What are 48 dry van dimensions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot dry van trailer has interior dimensions of 48' length x 102\" width x 110\" height, providing approximately 3,165 cubic feet of cargo space and 24 standard pallet positions."
        }
      },
      {
        "@type": "Question",
        "name": "What is the deck height of a flatbed trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A standard flatbed trailer has a deck height of approximately 60 inches (5 feet) from the ground. Step deck trailers have a lower rear section at about 42 inches for taller cargo."
        }
      },
      {
        "@type": "Question",
        "name": "How much weight can a 48 ft flatbed carry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot flatbed trailer can carry approximately 48,000 lbs of cargo, staying within the 80,000 lb gross vehicle weight limit when combined with a standard tractor."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a vented van trailer and dry van?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A vented van trailer has small vents for air circulation, used for produce or cargo that generates heat. A dry van is fully sealed with no ventilation, protecting freight from weather and moisture."
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete Trailer Specifications Guide: Dimensions, Weight Capacity & Cubic Feet",
    "description": "Comprehensive trailer specifications including 53-foot and 48-foot dry van dimensions, flatbed deck heights, and weight capacities.",
    "author": {
      "@type": "Organization",
      "name": "CRUMS Leasing"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "datePublished": "2025-12-26",
    "dateModified": "2025-12-26"
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Trailer Specifications Guide | 53 Foot Trailer Cubic Feet & Dimensions"
        description="Complete trailer specifications: 53-foot trailer has 3,489 cubic feet. 48-foot dry van dimensions, flatbed deck heights, weight capacities, and more."
        canonical="https://crumsleasing.com/resources/guides/trailer-specifications"
        structuredData={combinedSchema}
        article={{
          publishedTime: "2025-12-26",
          modifiedTime: "2025-12-26",
          section: "Industry Guides",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ruler className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trailer Specifications Guide</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Complete dimensions, weight capacities, and cubic feet for dry van and flatbed trailers.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <main className="py-12 bg-background flex-grow">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 53-Foot Dry Van Specifications */}
          <section className="mb-12">
            <Card className="border-2">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-3">
                  <Box className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">53-Foot Dry Van Trailer Specifications</CardTitle>
                    <CardDescription>Industry standard for maximum cargo capacity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Interior Dimensions</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Length</span>
                        <span className="font-semibold">53 feet (636 inches)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Width</span>
                        <span className="font-semibold">102 inches (8.5 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Height</span>
                        <span className="font-semibold">110 inches (9.17 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Door Opening Width</span>
                        <span className="font-semibold">98-100 inches</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Door Opening Height</span>
                        <span className="font-semibold">108-110 inches</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Capacity</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Cubic Feet</span>
                        <span className="font-semibold text-primary">3,489 cu ft</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Pallet Capacity</span>
                        <span className="font-semibold">26 pallets (48x40)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Payload Capacity</span>
                        <span className="font-semibold">Up to 45,000 lbs</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Trailer Weight (Empty)</span>
                        <span className="font-semibold">13,000-15,000 lbs</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Link to="/dry-van-trailers" className="inline-flex items-center text-primary hover:underline font-medium">
                    View our dry van trailer leasing options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 48-Foot Dry Van Specifications */}
          <section className="mb-12">
            <Card className="border-2">
              <CardHeader className="bg-secondary/5">
                <div className="flex items-center gap-3">
                  <Box className="h-8 w-8 text-secondary" />
                  <div>
                    <CardTitle className="text-2xl">48-Foot Dry Van Trailer Specifications</CardTitle>
                    <CardDescription>Ideal for routes with length restrictions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Interior Dimensions</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Length</span>
                        <span className="font-semibold">48 feet (576 inches)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Width</span>
                        <span className="font-semibold">102 inches (8.5 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Height</span>
                        <span className="font-semibold">110 inches (9.17 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Door Opening Width</span>
                        <span className="font-semibold">98-100 inches</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Door Opening Height</span>
                        <span className="font-semibold">108-110 inches</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Capacity</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Cubic Feet</span>
                        <span className="font-semibold text-secondary">3,165 cu ft</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Pallet Capacity</span>
                        <span className="font-semibold">24 pallets (48x40)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Payload Capacity</span>
                        <span className="font-semibold">Up to 44,000 lbs</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Trailer Weight (Empty)</span>
                        <span className="font-semibold">12,000-14,000 lbs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Flatbed Specifications */}
          <section className="mb-12">
            <Card className="border-2">
              <CardHeader className="bg-accent/5">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-accent" />
                  <div>
                    <CardTitle className="text-2xl">Flatbed Trailer Specifications</CardTitle>
                    <CardDescription>Standard flatbed and step deck configurations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Standard Flatbed (48' / 53')</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Deck Length</span>
                        <span className="font-semibold">48 or 53 feet</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Deck Width</span>
                        <span className="font-semibold">102 inches (8.5 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Deck Height</span>
                        <span className="font-semibold text-accent">60 inches (5 feet)</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Weight Capacity</span>
                        <span className="font-semibold">Up to 48,000 lbs</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Max Cargo Height</span>
                        <span className="font-semibold">8.5 feet</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Step Deck (Drop Deck)</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Upper Deck Length</span>
                        <span className="font-semibold">~11 feet</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Lower Deck Length</span>
                        <span className="font-semibold">~37 feet</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Lower Deck Height</span>
                        <span className="font-semibold text-accent">42 inches</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Weight Capacity</span>
                        <span className="font-semibold">Up to 48,000 lbs</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Extra Height Clearance</span>
                        <span className="font-semibold">+12-18 inches</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Link to="/flatbed-trailers" className="inline-flex items-center text-primary hover:underline font-medium">
                    View our flatbed trailer leasing options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Vented vs Dry Van */}
          <section className="mb-12">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Vented Van vs Dry Van: What's the Difference?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Dry Van Trailer</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Fully sealed with no ventilation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Complete weather protection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Best for general freight, consumer goods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Electronics, furniture, packaged foods</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Vented Van Trailer</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>Small vents allow air circulation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>Prevents heat buildup and condensation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>Best for produce, onions, potatoes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>Cargo that generates heat or moisture</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">How many cubic feet is a 53 foot trailer?</h3>
                  <p className="text-muted-foreground">
                    A 53-foot dry van trailer has approximately 3,489 cubic feet of cargo space. Interior dimensions 
                    are typically 53' length x 102" width x 110" height, accommodating up to 26 standard pallets (48" x 40").
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">What are 48 dry van dimensions?</h3>
                  <p className="text-muted-foreground">
                    A 48-foot dry van trailer has interior dimensions of 48' length x 102" width x 110" height, 
                    providing approximately 3,165 cubic feet of cargo space and 24 standard pallet positions.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">What is the deck height of a flatbed trailer?</h3>
                  <p className="text-muted-foreground">
                    A standard flatbed trailer has a deck height of approximately 60 inches (5 feet) from the ground. 
                    Step deck trailers have a lower rear section at about 42 inches, providing an extra 12-18 inches 
                    of height clearance for taller cargo.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">How much weight can a 48 ft flatbed carry?</h3>
                  <p className="text-muted-foreground">
                    A 48-foot flatbed trailer can carry approximately 48,000 lbs of cargo, staying within the 80,000 lb 
                    gross vehicle weight limit when combined with a standard tractor. Actual capacity varies based on 
                    trailer weight and axle configuration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-gradient-to-r from-primary to-brand-teal-dark rounded-xl text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a Trailer for Your Next Haul?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
              CRUMS Leasing offers dry van and flatbed trailers with flexible lease terms starting at 12 months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
                <Link to="/contact">
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/semi-trailer-leasing">View Leasing Options</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrailerSpecifications;
