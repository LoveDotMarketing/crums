import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Truck, 
  Phone, 
  CheckCircle, 
  ArrowRight,
  Route,
  Factory,
  Building2,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { LocationData, HEADQUARTERS, getNearbyLocations } from "@/lib/locations";
import { generateBreadcrumbSchema, localBusinessSchema } from "@/lib/structuredData";

interface LocationPageTemplateProps {
  location: LocationData;
}

export const LocationPageTemplate = ({ location }: LocationPageTemplateProps) => {
  const nearbyLocations = getNearbyLocations(location.slug);
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Locations", url: "https://crumsleasing.com/locations" },
    { name: `${location.city}, ${location.stateAbbr}`, url: `https://crumsleasing.com/locations/${location.slug}` }
  ]);

  // City-specific LocalBusiness schema with areaServed
  const cityLocalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://crumsleasing.com/locations/${location.slug}#localbusiness`,
    "name": "CRUMS Leasing",
    "image": "https://crumsleasing.com/og-image.jpg",
    "url": `https://crumsleasing.com/locations/${location.slug}`,
    "telephone": "+1-888-570-4564",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": HEADQUARTERS.address,
      "addressLocality": HEADQUARTERS.city,
      "addressRegion": HEADQUARTERS.stateAbbr,
      "postalCode": HEADQUARTERS.zip,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": HEADQUARTERS.coordinates.lat,
      "longitude": HEADQUARTERS.coordinates.lng
    },
    "areaServed": {
      "@type": "City",
      "name": location.city,
      "containedInPlace": {
        "@type": "State",
        "name": location.state
      }
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "12:00"
      }
    ]
  };

  // Service schema for this city
  const cityServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Commercial Trailer Rental",
    "provider": {
      "@type": "LocalBusiness",
      "name": "CRUMS Leasing",
      "telephone": "+1-888-570-4564"
    },
    "areaServed": {
      "@type": "City",
      "name": location.city,
      "containedInPlace": {
        "@type": "State",
        "name": location.state
      }
    },
    "description": `Commercial trailer rental and leasing services in ${location.city}, ${location.state}. 53-foot dry van, flatbed, and refrigerated trailers available.`,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  };

  // FAQ items specific to this city
  const faqItems = [
    {
      question: `Do you deliver trailers to ${location.city}?`,
      answer: location.isPickupFriendly 
        ? `Yes! ${location.city} is just ${location.distanceFromBulverde} miles from our Bulverde, TX headquarters. You can pick up your trailer at our yard, or we can deliver it to your location for a competitive fee.`
        : `Absolutely! We deliver commercial trailers directly to ${location.city}, ${location.stateAbbr}. Contact us for delivery rates and availability.`
    },
    {
      question: "What types of trailers do you have available?",
      answer: "We offer 53-foot dry van trailers, flatbed trailers, and refrigerated (reefer) trailers. All our trailers are GPS-equipped and well-maintained."
    },
    {
      question: "What are your lease terms?",
      answer: "We offer flexible lease terms starting at 12 months, as well as short-term rentals for seasonal needs. Contact us to discuss terms that work for your business."
    },
    {
      question: `Why choose CRUMS Leasing for ${location.city} trailer rental?`,
      answer: `CRUMS Leasing is a family-owned company founded by former NBA player Eric Bledsoe. We offer competitive rates, flexible terms, GPS-equipped trailers, and a people-first approach. We understand the ${location.keyIndustries.slice(0, 2).join(" and ")} industries that drive ${location.city}'s economy.`
    }
  ];

  // FAQPage schema for rich results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [cityLocalBusinessSchema, cityServiceSchema, breadcrumbSchema, faqSchema]
  };

  // Trailer types offered
  const trailerTypes = [
    { name: "53' Dry Van Trailers", desc: "Our most popular option for general freight", link: "/dry-van-trailers" },
    { name: "Flatbed Trailers", desc: "For oversized and construction materials", link: "/flatbed-trailers" },
    { name: "Refrigerated Trailers", desc: "Temperature-controlled for perishables", link: "/refrigerated-trailers" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={location.metaTitle}
        description={location.metaDescription}
        canonical={`https://crumsleasing.com/locations/${location.slug}`}
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-4">
              <MapPin className="h-5 w-5" />
              <span>Serving {location.city}, {location.stateAbbr}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {location.h1}
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
              {location.isPickupFriendly 
                ? `Pick up at our Bulverde, TX yard (${location.distanceFromBulverde} miles away) or get convenient delivery to your ${location.city} location.`
                : `We deliver commercial trailers directly to ${location.city}. Quality 53' dry van, flatbed, and reefer trailers with flexible terms.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/get-started">
                  Get a Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href={`tel:${HEADQUARTERS.phone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call {HEADQUARTERS.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Pickup vs Delivery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                {location.isPickupFriendly 
                  ? "Pickup or Delivery — Your Choice"
                  : `Trailer Delivery to ${location.city}`
                }
              </h2>
              {location.isPickupFriendly ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Pickup at Our Yard</h3>
                      <p className="text-muted-foreground">
                        Drive to our Bulverde, TX location — just {location.distanceFromBulverde} miles from {location.city}. 
                        Inspect your trailer, complete paperwork, and hit the road.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Delivery Available</h3>
                      <p className="text-muted-foreground">
                        Prefer we bring it to you? We offer competitive delivery rates to anywhere in {location.city}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    While our headquarters is in Bulverde, Texas, we proudly serve {location.city} with reliable trailer delivery. 
                    Our team will transport your trailer directly to your location so you can focus on your business.
                  </p>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Competitive delivery rates based on distance
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Flexible scheduling to meet your timeline
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      GPS-equipped trailers for peace of mind
                    </p>
                  </div>
                </div>
              )}
            </div>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">Our Headquarters</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="font-semibold text-foreground">CRUMS Leasing</p>
                  <p>{HEADQUARTERS.address}</p>
                  <p>{HEADQUARTERS.city}, {HEADQUARTERS.stateAbbr} {HEADQUARTERS.zip}</p>
                  <a 
                    href={`tel:${HEADQUARTERS.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {HEADQUARTERS.phone}
                  </a>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Fri 9am-5:30pm | Sat 9am-12pm</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Distance from {location.city}:</strong> ~{location.distanceFromBulverde} miles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Highways & Industries */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Route className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Key Highways</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  {location.city} is connected to major freight corridors:
                </p>
                <div className="flex flex-wrap gap-2">
                  {location.keyHighways.map((highway) => (
                    <span 
                      key={highway}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {highway}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Factory className="h-6 w-6 text-secondary" />
                  <h3 className="text-xl font-bold text-foreground">Industries We Serve</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Supporting {location.city}'s key industries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {location.keyIndustries.map((industry) => (
                    <span 
                      key={industry}
                      className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {location.regionalContext && (
            <div className="mt-8 p-6 bg-background rounded-lg">
              <p className="text-muted-foreground leading-relaxed">
                {location.regionalContext}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trailer Types */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            Trailer Types Available in {location.city}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {trailerTypes.map((trailer) => (
              <Card key={trailer.name} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <Truck className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">{trailer.name}</h3>
                  <p className="text-muted-foreground mb-4">{trailer.desc}</p>
                  <Link 
                    to={trailer.link}
                    className="text-primary hover:underline font-medium inline-flex items-center"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why CRUMS */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            Why Choose CRUMS Leasing in {location.city}?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Family-Owned", desc: "Founded by Eric Bledsoe with family values at the core" },
              { icon: Truck, title: "Quality Fleet", desc: "Well-maintained, GPS-equipped trailers" },
              { icon: Clock, title: "Flexible Terms", desc: "Lease terms from 12 months or short-term rentals" },
              { icon: Phone, title: "Personal Service", desc: "Talk to real people who care about your success" }
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decision Support Resources */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">
            Resources for {location.city} Carriers
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" />
                  Financial Tools
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/resources/tools/cost-per-mile" className="text-primary hover:underline font-medium">
                      Cost Per Mile Calculator
                    </Link>
                    <p className="text-sm text-muted-foreground">Calculate your true operating costs</p>
                  </li>
                  <li>
                    <Link to="/resources/tools/lease-vs-buy" className="text-primary hover:underline font-medium">
                      Lease vs Buy Calculator
                    </Link>
                    <p className="text-sm text-muted-foreground">Compare costs of leasing vs purchasing</p>
                  </li>
                  <li>
                    <Link to="/resources/tools/profit-per-load" className="text-primary hover:underline font-medium">
                      Profit Per Load Calculator
                    </Link>
                    <p className="text-sm text-muted-foreground">Analyze profitability by haul</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Factory className="h-5 w-5 text-secondary" />
                  Helpful Guides
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/resources/guides/choosing-trailer" className="text-secondary hover:underline font-medium">
                      How to Choose the Right Trailer
                    </Link>
                    <p className="text-sm text-muted-foreground">Dry van, flatbed, or reefer?</p>
                  </li>
                  <li>
                    <Link to="/resources/guides/trailer-specifications" className="text-secondary hover:underline font-medium">
                      Trailer Specifications Guide
                    </Link>
                    <p className="text-sm text-muted-foreground">Dimensions, cubic feet, and capacities</p>
                  </li>
                  <li>
                    <Link to="/why-choose-crums" className="text-secondary hover:underline font-medium">
                      Why Choose CRUMS Leasing
                    </Link>
                    <p className="text-sm text-muted-foreground">Our family-owned difference</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="border-b border-border pb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      {nearbyLocations.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
              Also Serving Nearby Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {nearbyLocations.map((nearby) => (
                <Link
                  key={nearby.slug}
                  to={`/locations/${nearby.slug}`}
                  className="px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors text-foreground"
                >
                  {nearby.city}, {nearby.stateAbbr}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started in {location.city}?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact us today for a free quote on trailer rental or leasing in {location.city}, {location.stateAbbr}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/get-started">
                Get a Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LocationPageTemplate;
