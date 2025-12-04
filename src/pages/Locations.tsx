import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation as NavigationIcon } from "lucide-react";
import { Link } from "react-router-dom";
import crumsTruckHighway from "@/assets/crums-truck-highway.png";
import { SEO } from "@/components/SEO";
import { localBusinessSchema, generateBreadcrumbSchema } from "@/lib/structuredData";

const Locations = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Locations", url: "https://crumsleasing.com/locations" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, breadcrumbSchema]
  };

  const serviceAreas = [
    {
      state: "Texas",
      cities: [
        "San Antonio, TX",
        "Austin, TX",
        "Houston, TX"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Locations & Service Areas - Trailer Leasing Across North America"
        description="CRUMS Leasing is based in Bulverde, TX with service areas in San Antonio, Austin, and Houston. We ship trailers anywhere in North America including the USA, Canada, and Mexico."
        canonical="https://crumsleasing.com/locations"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Locations</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Headquartered in Texas, serving all of North America. We ship trailers anywhere in the USA, Canada, and Mexico.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Image - Left Side */}
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

            {/* Location and Service Areas - Right Side */}
            <div className="space-y-6">

              {/* Service Areas */}
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mr-3">
                      <NavigationIcon className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Service Areas</h3>
                  </div>
                  
                  {serviceAreas.map((area, index) => (
                    <div key={index} className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-3">{area.state}</h4>
                        <ul className="space-y-2">
                          {area.cities.map((city, cityIndex) => (
                            <li key={cityIndex} className="flex items-start text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                              <span>{city}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="font-semibold text-foreground mb-2">
                      Serving All of North America
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We proudly serve the USA, Canada, and Mexico with reliable trailer solutions. No matter where your routes take you, we've got you covered.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              Don't see a location near you?
            </p>
            <p className="text-lg text-muted-foreground">
              Contact us — we have partnerships and service agreements nationwide to serve you
              wherever you operate.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage Map Info */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
            North America-Wide Coverage
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From coast to coast and beyond, we provide fast access to quality equipment and exceptional support across the United States, Canada, and Mexico — no matter where your business takes you.
          </p>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Get Started Today
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Explore our{" "}
              <Link to="/services/trailer-leasing" className="text-primary hover:underline font-semibold">
                trailer leasing in Texas
              </Link>{" "}
              and nationwide, or check out{" "}
              <Link to="/services/trailer-rentals" className="text-secondary hover:underline font-semibold">
                trailer rentals shipped anywhere in the US
              </Link>{" "}
              for flexible short-term needs.
            </p>
            <p className="text-muted-foreground mb-6">
              Ready to join the CRUMS family?{" "}
              <Link to="/get-started" className="text-primary hover:underline font-semibold">
                Start your leasing application
              </Link>{" "}
              today or{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact us to discuss your needs
              </Link>.
            </p>
            <p className="text-muted-foreground">
              Learn more{" "}
              <Link to="/about" className="text-secondary hover:underline font-medium">
                about our company
              </Link>{" "}
              and the{" "}
              <Link to="/mission" className="text-secondary hover:underline font-medium">
                values that guide us
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
