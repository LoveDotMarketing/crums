import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Calendar, Users, Box, Snowflake, Layers } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const services = [
  {
    title: "Trailer Leasing",
    description: "Long-term equipment leasing solutions",
    href: "/services/trailer-leasing",
    icon: Truck,
  },
  {
    title: "Trailer Rentals",
    description: "Flexible short-term rental options",
    href: "/services/trailer-rentals",
    icon: Calendar,
  },
  {
    title: "Fleet Solutions",
    description: "Comprehensive fleet management",
    href: "/services/fleet-solutions",
    icon: Users,
  },
];

const equipmentTypes = [
  {
    title: "Dry Van Trailers",
    description: "53' enclosed cargo trailers",
    href: "/dry-van-trailers",
    icon: Box,
  },
  {
    title: "Flatbed Trailers",
    description: "Open deck for oversized loads",
    href: "/flatbed-trailers",
    icon: Layers,
  },
  {
    title: "Refrigerated Trailers",
    description: "Temperature-controlled reefers",
    href: "/refrigerated-trailers",
    icon: Snowflake,
  },
];

const Services = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com" },
    { name: "Services", url: "https://crumsleasing.com/services" },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Services | CRUMS Leasing - Trailer Leasing, Rentals & Fleet Solutions"
        description="Explore CRUMS Leasing services including long-term trailer leasing, flexible short-term rentals, and comprehensive fleet management solutions for carriers nationwide."
        canonical="https://crumsleasing.com/services"
        structuredData={breadcrumbSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Flexible trailer solutions designed to keep your business moving forward
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Services Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Services</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <Link
                  key={service.href}
                  to={service.href}
                  className="group flex items-center justify-between p-6 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>

          {/* Equipment Types Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Equipment Types
            </h2>
            <div className="space-y-4">
              {equipmentTypes.map((equipment) => (
                <Link
                  key={equipment.href}
                  to={equipment.href}
                  className="group flex items-center justify-between p-6 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/50 rounded-lg group-hover:bg-secondary transition-colors">
                      <equipment.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {equipment.title}
                      </h3>
                      <p className="text-muted-foreground">{equipment.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center bg-muted/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contact us today to discuss your trailer needs and find the perfect solution for your operation.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Request a Quote
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
