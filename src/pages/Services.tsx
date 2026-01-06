import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Calendar, Users, Box, Snowflake, Layers, Play } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import whyChooseThumb from "@/assets/why-choose-crums-video-thumb.png";
import { trackCtaClick, trackEvent } from "@/lib/analytics";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

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
  useScrollDepthTracking('services');
  useTimeOnPageTracking('services');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com" },
    { name: "Services", url: "https://crumsleasing.com/services" },
  ]);

  const servicesHubSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Trailer Leasing & Rental Services",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "name": "CRUMS Leasing Services",
    "description": "Comprehensive trailer leasing, rental, and fleet management services for carriers nationwide. Long-term leasing, short-term rentals, and fleet solutions.",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Trailer Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Trailer Leasing",
            "description": "Long-term equipment leasing solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Trailer Rentals",
            "description": "Flexible short-term rental options"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fleet Solutions",
            "description": "Comprehensive fleet management"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Services | CRUMS Leasing - Trailer Leasing, Rentals & Fleet Solutions"
        description="Explore CRUMS Leasing services including long-term trailer leasing, flexible short-term rentals, and comprehensive fleet management solutions for carriers nationwide."
        canonical="https://crumsleasing.com/services"
        structuredData={[breadcrumbSchema, servicesHubSchema]}
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

      {/* Definition Blocks */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
            <p>
              <strong className="text-foreground">Leasing economics</strong> offer carriers a path to reliable equipment without the capital burden of ownership. Instead of tying up cash in a depreciating asset, leasing preserves working capital for fuel, insurance, and growth opportunities. Monthly lease payments are predictable, often lower than loan payments, and typically include maintenance—removing unexpected repair costs from your budget.
            </p>
            <p>
              <strong className="text-foreground">Rental flexibility</strong> addresses the reality that freight demand fluctuates. Peak seasons, contract surges, and unexpected equipment breakdowns require solutions that don't lock you into long-term commitments. Short-term trailer rentals let you scale capacity up or down based on actual business needs, turning fixed costs into variable costs you control.
            </p>
            <p>
              <strong className="text-foreground">Fleet management value</strong> extends beyond simply providing trailers. Comprehensive fleet solutions include maintenance coordination, GPS tracking, compliance support, and dedicated account management. For growing operations, this partnership approach lets you focus on moving freight while equipment logistics are handled by specialists.
            </p>
          </div>
        </div>
      </section>

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
                  onClick={() => trackEvent('service_link_click', { 
                    service_name: service.title, 
                    destination: service.href,
                    section: 'services'
                  })}
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
          <section className="mb-16">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Equipment Types
            </h2>
            <div className="space-y-4">
              {equipmentTypes.map((equipment) => (
                <Link
                  key={equipment.href}
                  to={equipment.href}
                  onClick={() => trackEvent('equipment_link_click', { 
                    equipment_type: equipment.title, 
                    destination: equipment.href,
                    section: 'equipment_types'
                  })}
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

          {/* Featured Video Section */}
          <section className="mb-16">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Featured Video
            </h2>
            <Link 
              to="/why-choose-crums" 
              onClick={() => trackEvent('video_link_click', { 
                video_title: 'Why CDL Drivers Choose CRUMS Leasing', 
                destination: '/why-choose-crums',
                section: 'featured_video'
              })}
              className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-80 aspect-video flex-shrink-0">
                  <img 
                    src={whyChooseThumb} 
                    alt="Why CDL Drivers Choose CRUMS Leasing" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    Why CDL Drivers Choose CRUMS Leasing
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    On the road, reliability is everything. At CRUMS Leasing, we give CDL drivers access to the trailers they need to keep moving and keep earning.
                  </p>
                  <span className="inline-flex items-center text-primary font-semibold">
                    Watch Now
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
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
              onClick={() => trackCtaClick('Request a Quote', 'services', '/get-started')}
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
