import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation as NavigationIcon, Phone, Truck, ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
const crumsTruckHighway = "/images/crums-truck-highway.webp";
const nationwideMapImage = "/images/crums-leasing-pickup-delivery-map-2.webp";
import { SEO } from "@/components/SEO";
import { localBusinessSchema, generateBreadcrumbSchema } from "@/lib/structuredData";
import { locations, getLocationsByRegion, HEADQUARTERS } from "@/lib/locations";
import { trackCtaClick, trackPhoneClick, fireMetaCapi } from "@/lib/analytics";
import { useEffect } from "react";

const Locations = () => {
  useEffect(() => {
    fireMetaCapi({ eventName: 'FindLocation' });
  }, []);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Locations", url: "https://crumsleasing.com/locations" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, breadcrumbSchema]
  };

  const { texas, southwest, midwest, southeast, mountain, northeast, west } = getLocationsByRegion();

  const regions = [
    { name: "Texas", locations: texas, description: "Our home state — pickup available at our San Antonio yard" },
    { name: "Southwest", locations: southwest, description: "Serving California and Arizona markets" },
    { name: "Midwest", locations: midwest, description: "America's freight crossroads" },
    { name: "Southeast", locations: southeast, description: "Major East Coast distribution hubs" },
    { name: "Northeast", locations: northeast, description: "Mid-Atlantic logistics corridor" },
    { name: "Mountain West", locations: mountain, description: "Gateway to the Rocky Mountain region" },
    { name: "Pacific Northwest", locations: west, description: "West Coast timber, tech & agriculture" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="53' Dry Van & Flatbed Trailer Rental Locations — Nationwide Delivery"
        description="CRUMS Leasing delivers 53' dry van and flatbed trailers nationwide. Pick up at our San Antonio, TX yard or get delivery to Houston, Dallas, LA, Chicago & more. Call 1-888-570-4564."
        canonical="https://crumsleasing.com/locations"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trailer Rental Locations</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Pick up at our San Antonio, Texas yard or get delivery anywhere in the nation. 
            We serve {locations.length}+ major markets across the United States.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/get-started" onClick={() => trackCtaClick('Get a Quote', 'locations-hero', '/get-started')}>
                Get a Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <a href={`tel:${HEADQUARTERS.phone}`} onClick={() => trackPhoneClick('locations-hero')}>
                <Phone className="mr-2 h-5 w-5" />
                {HEADQUARTERS.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Nationwide Map Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Nationwide Pickup & Shipping
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Based in San Antonio, Texas, we deliver dry van and flatbed trailers across all 50 states.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <img 
              src={nationwideMapImage} 
              alt="CRUMS Leasing - Nationwide Pickup & Shipping. Flatbed and Dry Van trailers delivered across all 50 states from Texas"
              className="w-full h-auto"
              loading="eager"
              width="1400"
              height="900"
            />
          </div>
        </div>
      </section>

      {/* Headquarters Card */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-background">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">CRUMS Leasing Headquarters</h2>
                    <p className="text-muted-foreground mb-4">
                      {HEADQUARTERS.address}, {HEADQUARTERS.city}, {HEADQUARTERS.stateAbbr} {HEADQUARTERS.zip}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Local or passing through?</strong> Pick up your trailer directly at our shipping yard in San Antonio. 
                      For all other locations, we deliver for a competitive fee.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <a 
                      href={`tel:${HEADQUARTERS.phone}`}
                      onClick={() => trackPhoneClick('locations-headquarters')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Phone className="h-5 w-5" />
                      Call Us
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pickup vs Delivery Explainer */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Pickup at Our Yard</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you're local to Central Texas or passing through, you can pick up your trailer directly at our San Antonio shipping yard. 
                  Inspect your equipment, complete paperwork, and hit the road.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> San Antonio, Austin, New Braunfels, and surrounding areas
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Nationwide Delivery</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  We deliver trailers anywhere in the United States for a competitive fee. 
                  Our team handles transportation so you can focus on your business.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Houston, Dallas, Los Angeles, Chicago, Atlanta, and beyond
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Grid by Region */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Cities We Serve
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Click any city below to learn about trailer rental options, local industries, and delivery information.
          </p>
          
          <div className="space-y-12">
            {regions.map((region) => (
              region.locations.length > 0 && (
                <div key={region.name}>
                  <div className="flex items-center gap-3 mb-6">
                    <NavigationIcon className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">{region.name}</h3>
                    <span className="text-muted-foreground">— {region.description}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {region.locations.map((location) => (
                      <Link
                        key={location.slug}
                        to={`/locations/${location.slug}`}
                        className="group"
                      >
                        <Card className="border hover:border-primary/50 hover:shadow-md transition-all h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {location.city}, {location.stateAbbr}
                                </h4>
                                {location.isPickupFriendly && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                                    Pickup Available
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>


      {/* Hero Image Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src={crumsTruckHighway} 
                alt="CRUMS Leasing 53-foot dry van trailer on the highway"
                className="w-full h-auto rounded-lg shadow-lg object-cover"
                loading="lazy"
                width="800"
                height="533"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Quality Trailers, Delivered Anywhere
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                From our headquarters in Bulverde, Texas, we serve trucking professionals across the nation. 
                Whether you're an owner-operator in Houston, a fleet manager in Chicago, or a logistics company in Los Angeles, 
                we have the trailers you need.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "53' Dry Van & Flatbed Trailers",
                  "GPS-equipped for peace of mind",
                  "Flexible lease terms starting at 12 months",
                  "Short-term rentals available",
                  "Family-owned with a people-first approach"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-secondary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link to="/get-started">
                  Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Don't See Your City */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Don't See Your City Listed?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We deliver trailers anywhere in the United States. Contact us and we'll provide a custom quote for delivery to your location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/contact" onClick={() => trackCtaClick('Contact Us', 'locations-cta', '/contact')}>
                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${HEADQUARTERS.phone}`} onClick={() => trackPhoneClick('locations-cta')}>
                <Phone className="mr-2 h-5 w-5" />
                {HEADQUARTERS.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Pages CTA */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">
              Explore our{" "}
              <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-semibold">
                trailer leasing options
              </Link>{" "}
              or check out{" "}
              <Link to="/services/trailer-rentals" className="text-secondary hover:underline font-semibold">
                short-term trailer rentals
              </Link>{" "}
              for flexible capacity. Learn more{" "}
              <Link to="/about" className="text-primary hover:underline font-medium">
                about our company
              </Link>{" "}
              and the{" "}
              <Link to="/why-choose-crums" className="text-secondary hover:underline font-medium">
                reasons to choose CRUMS
              </Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Locations;
