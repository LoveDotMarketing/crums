import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";

interface PartnerContact {
  name: string;
  role: string;
  phone: string;
}

interface Partner {
  name: string;
  description: string;
  logo: string;
  email: string;
  contacts: PartnerContact[];
}

const partners: Partner[] = [
  {
    name: "P.R. Roadside Service",
    description: "Diesel Truck and Trailer Repair - Your trusted partner for roadside assistance and emergency repairs.",
    logo: "/images/partners/pr-roadside-service-logo.png",
    email: "Prroadside@gmail.com",
    contacts: [
      { name: "Jorge", role: "Owner", phone: "(210) 840-9131" },
      { name: "Holly", role: "Co-owner", phone: "(210) 843-9404" },
      { name: "Jennifer", role: "Office Assistant", phone: "(210) 306-0228" },
    ],
  },
];

const Partners = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Partners | CRUMS Leasing"
        description="Meet our trusted partners who help keep your trailers on the road. CRUMS Leasing works with the best in diesel truck and trailer repair services."
        canonical="https://crumsleasing.com/partners"
      />
      <Navigation />
      <Breadcrumbs />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Partners</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              We work with trusted partners to ensure your trailers stay on the road. 
              These are the companies we rely on and recommend to our customers.
            </p>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {partners.map((partner) => (
                <Card key={partner.name} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Logo Section */}
                      <div className="bg-[#d4a044] p-6 flex items-center justify-center md:w-1/3">
                        <img
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="max-w-[200px] w-full h-auto"
                          loading="lazy"
                        />
                      </div>

                      {/* Info Section */}
                      <div className="p-6 flex-1">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          {partner.name}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {partner.description}
                        </p>

                        {/* Email */}
                        <a
                          href={`mailto:${partner.email}`}
                          className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
                        >
                          <Mail className="h-4 w-4" />
                          {partner.email}
                        </a>

                        {/* Contacts */}
                        <div className="space-y-3 mt-4">
                          <h3 className="font-semibold text-foreground">Contact Team</h3>
                          {partner.contacts.map((contact) => (
                            <div
                              key={contact.name}
                              className="flex items-center justify-between bg-muted/50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="font-medium text-foreground">
                                    {contact.name}
                                  </span>
                                  <span className="text-muted-foreground text-sm ml-2">
                                    - {contact.role}
                                  </span>
                                </div>
                              </div>
                              <a
                                href={`tel:${contact.phone.replace(/[^\d]/g, "")}`}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <Phone className="h-4 w-4" />
                                {contact.phone}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Partner CTA */}
            <div className="mt-16 text-center bg-muted/50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Interested in Partnering with CRUMS Leasing?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We're always looking to work with quality service providers who share our commitment 
                to excellence. If you're interested in becoming a partner, reach out to us.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
