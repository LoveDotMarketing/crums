import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Calendar, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { trailerRentalServiceSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const TrailerRentals = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Trailer Rentals", url: "https://crumsleasing.com/services/trailer-rentals" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [trailerRentalServiceSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Trailer Rentals - Short-Term 53-Foot Dry Van & Flatbed"
        description="Flexible short-term trailer rentals for peak seasons and special projects. 53-foot dry van and flatbed trailers shipped anywhere in the US. Fast availability!"
        canonical="https://crumsleasing.com/services/trailer-rentals"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-secondary to-brand-orange-light text-secondary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trailer Rental Solutions</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-8 text-secondary-foreground/90">
            Flexible short-term rental options for peak seasons, special projects, or testing new equipment before you commit. We ship trailers anywhere in the United States.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              variant="outline"
              className="bg-background text-foreground hover:bg-background/90 border-2"
            >
              Get Rental Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Why Rent From CRUMS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Fast Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Get equipment when you need it, where you need it
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Flexible Terms</h3>
                <p className="text-sm text-muted-foreground">Daily, weekly, or monthly rentals</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Quality Equipment</h3>
                <p className="text-sm text-muted-foreground">
                  Well-maintained, late-model trailers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Perfect For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Peak Season Demand</h3>
                <p className="text-muted-foreground">
                  Scale up your fleet quickly during busy periods without long-term commitments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Special Projects</h3>
                <p className="text-muted-foreground">
                  Get the right equipment for unique or temporary hauling needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Emergency Replacement</h3>
                <p className="text-muted-foreground">
                  Quick turnaround when your equipment is down for maintenance or repairs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Testing New Markets</h3>
                <p className="text-muted-foreground">
                  Explore new opportunities without major capital investment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Short-Term Contracts</h3>
                <p className="text-muted-foreground">
                  Fulfill temporary contracts with the right equipment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rental Process */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Simple Rental Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                Call or submit your rental request online
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-secondary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Get Quote</h3>
              <p className="text-sm text-muted-foreground">
                Receive competitive pricing and availability
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 text-accent-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Reserve</h3>
              <p className="text-sm text-muted-foreground">
                Confirm your reservation and pickup details
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Hit The Road</h3>
              <p className="text-sm text-muted-foreground">Pick up your trailer and start hauling</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-brand-orange-light text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Equipment Today?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-secondary-foreground/90">
            Our rental team is standing by to help you get the trailers you need, fast.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              variant="outline"
              className="bg-background text-foreground hover:bg-background/90 border-2"
            >
              Contact Rental Team
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrailerRentals;
