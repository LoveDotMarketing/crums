import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCtaClick, trackPhoneClick } from "@/lib/analytics";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const WhyChooseCrums = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Why Choose CRUMS", url: "https://crumsleasing.com/why-choose-crums" }
  ]);

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals",
    "description": "On the road, reliability is everything. At CRUMS Leasing, we give CDL drivers access to the trailers they need to keep moving and keep earning.",
    "thumbnailUrl": "https://crumsleasing.com/images/why-choose-crums-thumbnail.png",
    "uploadDate": "2024-12-01",
    "contentUrl": "https://youtu.be/ttqu5Ef2SZU",
    "embedUrl": "https://www.youtube.com/embed/ttqu5Ef2SZU",
    "duration": "PT1M",
    "publisher": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://crumsleasing.com/logo.png"
      }
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, videoSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals"
        description="On the road, reliability is everything. At CRUMS Leasing, we give CDL drivers access to the trailers they need to keep moving and keep earning."
        canonical="https://crumsleasing.com/why-choose-crums"
        structuredData={combinedSchema}
      />
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground max-w-3xl mx-auto">
              On the road, reliability is everything.
            </p>
          </div>
        </section>

        <Breadcrumbs />

        {/* Video Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl mb-10">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/ttqu5Ef2SZU"
                  title="Why CDL Drivers Choose CRUMS Leasing for Reliable Trailer Rentals"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              {/* Video Transcript */}
              <Card className="border-2">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Video Transcript</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>On the road, reliability is everything.</p>
                    <p>
                      At CRUMS Leasing, we give CDL drivers access to the trailers they need to keep 
                      moving and keep earning.
                    </p>
                    <p>
                      Whether you run dry vans, flatbeds, or refrigerated units, our fleet is built 
                      for performance, durability, and your everyday workload.
                    </p>
                    <p>
                      We make leasing straightforward with flexible terms, fast approvals, and 
                      equipment you can trust.
                    </p>
                    <p>
                      From independent owner-operators to growing fleets, CRUMS Leasing delivers 
                      the support and capacity your business depends on.
                    </p>
                    <p className="font-semibold text-foreground">
                      CRUMS Leasing. Built for drivers who keep America moving.
                    </p>
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground mb-8 max-w-2xl mx-auto">
              Contact us today to learn more about our flexible trailer leasing options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6"
                  onClick={() => trackCtaClick('Get Started', 'why-choose-crums', '/get-started')}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="tel:+18885704564">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  onClick={() => trackPhoneClick('why-choose-crums')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  (888) 570-4564
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhyChooseCrums;
