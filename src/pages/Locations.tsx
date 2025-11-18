import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Navigation as NavigationIcon } from "lucide-react";
import crumsTruckHighway from "@/assets/crums-truck-highway.png";

const Locations = () => {
  const locations = [
    {
      city: "Bulverde",
      state: "TX",
      address: "4070 FM1863, Bulverde, TX 78163",
      phone: "(800) 555-CRUMS",
      email: "info@crumsleasing.com",
    },
  ];

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
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Locations</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Proudly serving from our Texas location
          </p>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="w-full">
        <img 
          src={crumsTruckHighway} 
          alt="Crums Leasing 53-foot dry van trailer on the highway" 
          className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
        />
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Locations - Left Side */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-8">
                {locations.map((location, index) => (
                  <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {location.city}, {location.state}
                          </h3>
                          <p className="text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-3 text-primary" />
                          <span>{location.phone}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-3 text-primary" />
                          <span className="text-sm">{location.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Service Areas - Right Side */}
            <div className="lg:col-span-1">
              <Card className="border-2 sticky top-24">
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
                    <p className="text-sm text-muted-foreground">
                      We proudly serve these areas and surrounding regions with reliable trailer solutions.
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
            Coast-to-Coast Coverage
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            With service centers strategically located across the United States, we provide fast
            access to quality equipment and exceptional local support, no matter where your business
            takes you.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Locations;
