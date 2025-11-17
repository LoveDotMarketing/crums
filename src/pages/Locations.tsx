import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

const Locations = () => {
  const locations = [
    {
      city: "Atlanta",
      state: "GA",
      address: "1234 Industrial Pkwy",
      phone: "(404) 555-0100",
      email: "atlanta@crumsleasing.com",
    },
    {
      city: "Chicago",
      state: "IL",
      address: "5678 Logistics Dr",
      phone: "(312) 555-0200",
      email: "chicago@crumsleasing.com",
    },
    {
      city: "Dallas",
      state: "TX",
      address: "9012 Commerce Blvd",
      phone: "(214) 555-0300",
      email: "dallas@crumsleasing.com",
    },
    {
      city: "Los Angeles",
      state: "CA",
      address: "3456 Harbor Way",
      phone: "(213) 555-0400",
      email: "losangeles@crumsleasing.com",
    },
    {
      city: "Charlotte",
      state: "NC",
      address: "7890 Distribution Ln",
      phone: "(704) 555-0500",
      email: "charlotte@crumsleasing.com",
    },
    {
      city: "Miami",
      state: "FL",
      address: "2345 Port Access Rd",
      phone: "(305) 555-0600",
      email: "miami@crumsleasing.com",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Locations</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Nationwide coverage with 25+ service centers across major markets
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
