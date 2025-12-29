import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, BookOpen, Play } from "lucide-react";
import { guides, getGuideHref } from "@/lib/guides";
import whyChooseThumb from "@/assets/why-choose-crums-video-thumb.png";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const guidesCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Industry Guides for Carriers - CRUMS Leasing",
  "description": "Free educational guides for carriers and owner-operators. Learn about trailer selection, safety, budgeting, and building a successful trucking career.",
  "url": "https://crumsleasing.com/resources/guides",
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
  }
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Guides", url: "https://crumsleasing.com/resources/guides" },
]);

const Guides = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Industry Guides for Carriers"
        description="Free educational guides for carriers and owner-operators. Learn about trailer selection, safety, budgeting, and building a successful trucking career with CRUMS Leasing."
        canonical="https://crumsleasing.com/resources/guides"
        structuredData={[guidesCollectionSchema, breadcrumbSchema]}
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

      {/* Featured Video */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <Link to="/why-choose-crums" className="group flex flex-col sm:flex-row items-center gap-6 hover:opacity-90 transition-opacity">
            <div className="relative w-full sm:w-64 aspect-video rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img 
                src={whyChooseThumb} 
                alt="Why CDL Drivers Choose CRUMS Leasing" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Featured Video</p>
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                Why CDL Drivers Choose CRUMS Leasing
              </h2>
              <p className="text-muted-foreground text-sm">
                On the road, reliability is everything. See why carriers trust CRUMS for their trailer needs.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Financial Tools Quick Link */}
      <section className="py-8 bg-background border-b">
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
                      <Link to={getGuideHref(guide.slug)}>
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
