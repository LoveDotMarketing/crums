import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Box, Shield, Truck, ArrowRight, Package, DoorOpen, Ruler } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";
import { useTimeOnPageTracking } from "@/hooks/useTimeOnPageTracking";

const DryVanTrailers = () => {
  useTimeOnPageTracking('dry-van-trailers');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Services", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Trailer Leasing", url: "https://crumsleasing.com/services/trailer-leasing" },
    { name: "Dry Van Trailers", url: "https://crumsleasing.com/dry-van-trailers" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dry Van Trailer Leasing",
    "description": "53-foot and 48-foot dry van trailer leasing with swing doors, roll-up doors, and logistic posts. Flexible lease terms starting at 12 months.",
    "provider": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Dry Van Trailer Leasing"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A dry van trailer is an enclosed, non-temperature-controlled trailer used for transporting dry goods and general freight. It's the most common type of semi-trailer in the trucking industry, protecting cargo from weather and theft."
        }
      },
      {
        "@type": "Question",
        "name": "How many cubic feet is a 53 foot trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A standard 53-foot dry van trailer has approximately 3,489 cubic feet of cargo space. Interior dimensions are typically 53' long x 102\" wide x 110\" tall (8.5' x 9.17'), providing maximum capacity for palletized freight."
        }
      },
      {
        "@type": "Question",
        "name": "What are 48 dry van dimensions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot dry van trailer typically has interior dimensions of 48' length x 102\" width x 110\" height. This provides approximately 3,165 cubic feet of cargo space, with 24 pallet positions for standard 48x40 pallets loaded side by side."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a vented van trailer and dry van?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A vented van trailer has small vents or openings that allow air circulation, typically used for produce, onions, or cargo that generates heat. A standard dry van is fully sealed with no ventilation, ideal for general freight that needs complete protection from weather and moisture."
        }
      },
      {
        "@type": "Question",
        "name": "What sizes of dry van trailers does CRUMS offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers 53-foot and 48-foot dry van trailers. The 53-foot trailers are the industry standard for maximum cargo capacity, while 48-foot trailers are ideal for routes with length restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "What door options are available on dry van trailers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our dry van trailers come with either swing doors or roll-up doors. Swing doors provide easier access for loading and unloading, while roll-up doors are ideal for tight dock spaces."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum lease term for a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CRUMS Leasing offers dry van trailer leases starting at a 12-month minimum term, with flexible options extending up to 8+ years for the lowest monthly payments."
        }
      },
      {
        "@type": "Question",
        "name": "What types of cargo can be hauled in a dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dry van trailers are versatile and can haul a wide variety of non-perishable goods including consumer products, electronics, clothing, furniture, building materials, packaged foods, and industrial equipment."
        }
      },
      {
        "@type": "Question",
        "name": "What are the dimensions of a 48-foot dry van trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot dry van trailer has interior dimensions of 48'L x 102\"W (8'6\") x 110\"H (9'2\"), providing approximately 3,165 cubic feet of cargo space. Exterior overall length is approximately 50 feet, with a tare weight around 12,500 lbs and payload capacity up to 44,000 lbs. The rear door opening is 94\" wide x 102\" high."
        }
      },
      {
        "@type": "Question",
        "name": "How many pallets fit in a 48 foot trailer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A 48-foot dry van trailer fits 24 standard pallets (48\" x 40\") loaded side by side in two rows. This is 2 fewer pallet positions than a 53-foot trailer (26 pallets), but the 48' length is required for compliance with certain state length regulations."
        }
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [serviceSchema, breadcrumbSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="53' & 48' Dry Van Trailer Dimensions & Leasing | CRUMS"
        description="53' and 48' dry van interior dimensions, cubic feet, and pallet positions. 53'L x 8'6&quot;W x 9'H (3,489 cu ft) | 48'L x 8'6&quot;W x 9'H (3,165 cu ft). Lease from CRUMS - flexible terms."
        canonical="https://crumsleasing.com/dry-van-trailers"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Dry Van Trailer Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            The industry standard for enclosed freight. Protect your cargo with our premium 53' and 48' dry van trailers.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('Request A Quote', 'dry-van-trailers-hero', '/contact')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Request A Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              The Most Versatile Trailer on the Road
            </h2>
            <p className="text-lg text-muted-foreground">
              Dry van trailers are the backbone of the American trucking industry, hauling everything from consumer goods 
              to industrial equipment. Our fleet of well-maintained dry vans provides the protection and reliability 
              your freight deserves. For complete dimensions and cubic footage specifications, see our{" "}
              <Link to="/resources/guides/trailer-specifications" className="text-primary hover:underline font-medium">
                trailer specifications guide
              </Link>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Box className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Weather Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Fully enclosed design keeps cargo safe from rain, snow, and sun
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cargo Security</h3>
                <p className="text-sm text-muted-foreground">
                  Lockable doors protect high-value shipments during transit
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Maximum Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  53' trailers offer up to 3,500+ cubic feet of cargo space
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Versatile Hauling</h3>
                <p className="text-sm text-muted-foreground">
                  Ideal for general freight, retail goods, and palletized cargo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Available Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-primary" />
                  <h3 className="text-2xl font-bold">53' Dry Van</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  The industry standard for maximum cargo capacity and efficiency on long-haul routes.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Length: 53 feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Width: 102 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior Height: 110 inches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Cargo Capacity: 3,500+ cubic feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Payload Capacity: Up to 45,000 lbs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-secondary" />
                  <h3 className="text-2xl font-bold">48' Dry Van</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Perfect for routes with length restrictions or lighter freight loads.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Interior: 48'L x 8'6"W x 9'2"H (14.6m x 2.6m x 2.8m)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Cargo Capacity: ~3,165 cubic feet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Pallet Positions: 24 standard (48"x40")</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Payload Capacity: Up to 44,000 lbs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Door Opening: 94"W x 102"H</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 48' Dry Van Dimensions Deep-Dive */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              48' Dry Van Trailer Dimensions & Specifications
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The 48-foot dry van trailer is a versatile alternative to the standard 53-footer, offering excellent cargo capacity while complying with state length restrictions in places like California, Oregon, and urban delivery zones. Here's a side-by-side comparison of 48' vs 53' dry van dimensions.
            </p>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="py-3 px-4 text-foreground font-bold">Specification</th>
                    <th className="py-3 px-4 text-foreground font-bold">48' Dry Van</th>
                    <th className="py-3 px-4 text-foreground font-bold">53' Dry Van</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Interior Length</td>
                    <td className="py-3 px-4">48 ft (576 in / 14.6 m)</td>
                    <td className="py-3 px-4">53 ft (636 in / 16.2 m)</td>
                  </tr>
                  <tr className="border-b border-border bg-muted/50">
                    <td className="py-3 px-4 font-medium">Interior Width</td>
                    <td className="py-3 px-4">102 in (8'6" / 2.6 m)</td>
                    <td className="py-3 px-4">102 in (8'6" / 2.6 m)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Interior Height</td>
                    <td className="py-3 px-4">110 in (9'2" / 2.8 m)</td>
                    <td className="py-3 px-4">110 in (9'2" / 2.8 m)</td>
                  </tr>
                  <tr className="border-b border-border bg-muted/50">
                    <td className="py-3 px-4 font-medium">Cubic Feet</td>
                    <td className="py-3 px-4">~3,165 cu ft</td>
                    <td className="py-3 px-4">~3,489 cu ft</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Pallet Positions (48"x40")</td>
                    <td className="py-3 px-4">24 pallets</td>
                    <td className="py-3 px-4">26 pallets</td>
                  </tr>
                  <tr className="border-b border-border bg-muted/50">
                    <td className="py-3 px-4 font-medium">Payload Capacity</td>
                    <td className="py-3 px-4">Up to 44,000 lbs</td>
                    <td className="py-3 px-4">Up to 45,000 lbs</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Door Opening</td>
                    <td className="py-3 px-4">94"W x 102"H</td>
                    <td className="py-3 px-4">94"W x 102"H</td>
                  </tr>
                  <tr className="border-b border-border bg-muted/50">
                    <td className="py-3 px-4 font-medium">Overall Length (ext.)</td>
                    <td className="py-3 px-4">~50 ft</td>
                    <td className="py-3 px-4">~57 ft</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Tare Weight</td>
                    <td className="py-3 px-4">~12,500 lbs</td>
                    <td className="py-3 px-4">~14,000 lbs</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">When to Choose a 48' Over a 53' Dry Van</h3>
            <p className="text-muted-foreground mb-4">
              A 48-foot dry van is the better choice when you're operating in states with overall vehicle length limits (such as California's 65-foot kingpin-to-rear-axle regulation), making frequent urban deliveries where maneuverability matters, or hauling lighter-density freight where the extra 5 feet of a 53' wouldn't be utilized. The shorter wheelbase also means easier backing into tight docks and reduced tire wear.
            </p>
            <p className="text-muted-foreground">
              Ready to get started?{" "}
              <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-semibold">
                Lease a 48-foot dry van trailer
              </Link>{" "}
              from CRUMS with flexible terms starting at 12 months.
            </p>
          </div>
        </div>
      </section>

      {/* Door Options */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Door Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <DoorOpen className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Swing Doors</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>270-degree opening for easy access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Better seal against weather</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Ideal for live loading/unloading</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <DoorOpen className="h-8 w-8 text-secondary" />
                  <h3 className="text-xl font-bold">Roll-Up Doors</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Space-saving design</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Perfect for tight dock spaces</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Quick operation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Inventory */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Available Now
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Browse our featured dry van trailers ready for immediate lease
          </p>
          <div className="max-w-3xl mx-auto">
            <Link to="/commercial-dry-van-trailer-for-lease-56171" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <Truck className="h-16 w-16 text-primary mx-auto mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Unit 56171</span>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">Available</span>
                        <span className="text-sm text-muted-foreground">2020 Great Dane</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        53' Dry Van Trailer - Swing Doors
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Recently returned, professionally inspected, and ready to roll. Features air ride suspension, logistic posts, and LED lighting.
                      </p>
                      <div className="flex items-center text-primary font-semibold">
                        View Full Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is a dry van trailer?</h3>
                <p className="text-muted-foreground">
                  A dry van trailer is an enclosed, non-temperature-controlled trailer used for transporting dry goods 
                  and general freight. It's the most common type of semi-trailer in the trucking industry, protecting 
                  cargo from weather and theft.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How many cubic feet is a 53 foot trailer?</h3>
                <p className="text-muted-foreground">
                  A standard 53-foot dry van trailer has approximately 3,489 cubic feet of cargo space. Interior 
                  dimensions are typically 53' long x 102" wide x 110" tall (8.5' x 9.17'), providing maximum 
                  capacity for palletized freight with 26 standard pallet positions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What are 48 dry van dimensions?</h3>
                <p className="text-muted-foreground">
                  A 48-foot dry van trailer typically has interior dimensions of 48' length x 102" width x 110" height. 
                  This provides approximately 3,165 cubic feet of cargo space, with 24 pallet positions for standard 
                  48x40 pallets loaded side by side.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the difference between a vented van trailer and dry van?</h3>
                <p className="text-muted-foreground">
                  A vented van trailer has small vents or openings that allow air circulation, typically used for 
                  produce, onions, or cargo that generates heat. A standard dry van is fully sealed with no ventilation, 
                  ideal for general freight that needs complete protection from weather and moisture.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What sizes of dry van trailers does CRUMS offer?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers 53-foot and 48-foot dry van trailers. The 53-foot trailers are the industry 
                  standard for maximum cargo capacity, while 48-foot trailers are ideal for routes with length restrictions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What door options are available?</h3>
                <p className="text-muted-foreground">
                  Our dry van trailers come with either swing doors or roll-up doors. Swing doors provide easier 
                  access for loading and unloading, while roll-up doors are ideal for tight dock spaces.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the minimum lease term?</h3>
                <p className="text-muted-foreground">
                  CRUMS Leasing offers dry van trailer leases starting at a 12-month minimum term, with flexible 
                  options extending up to 8+ years for the lowest monthly payments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What types of cargo can be hauled?</h3>
                <p className="text-muted-foreground">
                  Dry van trailers are versatile and can haul a wide variety of non-perishable goods including 
                  consumer products, electronics, clothing, furniture, building materials, packaged foods, and 
                  industrial equipment.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What are the dimensions of a 48-foot dry van trailer?</h3>
                <p className="text-muted-foreground">
                  A 48-foot dry van trailer has interior dimensions of 48'L x 102"W (8'6") x 110"H (9'2"), 
                  providing approximately 3,165 cubic feet of cargo space. Exterior overall length is about 50 feet, 
                  with a tare weight around 12,500 lbs and payload capacity up to 44,000 lbs.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How many pallets fit in a 48 foot trailer?</h3>
                <p className="text-muted-foreground">
                  A 48-foot dry van trailer fits 24 standard pallets (48" x 40") loaded side by side in two rows. 
                  This is 2 fewer pallet positions than a 53-foot trailer (26 pallets), but the 48' length is 
                  required for compliance with certain state length regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Decision Support */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            Make an Informed Decision
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use our free resources to determine if a dry van is right for your operation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Ruler className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Trailer Specifications Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete dimensions, cubic feet, and weight capacities for all trailer types.
                </p>
                <Link to="/resources/guides/trailer-specifications" className="text-primary hover:underline font-medium text-sm">
                  View Specs →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Box className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Lease vs Buy Calculator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compare costs of leasing versus purchasing a dry van trailer.
                </p>
                <Link to="/resources/tools/lease-vs-buy" className="text-secondary hover:underline font-medium text-sm">
                  Calculate Now →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">Why Choose CRUMS</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See why carriers trust CRUMS for their dry van leasing needs.
                </p>
                <Link to="/why-choose-crums" className="text-primary hover:underline font-medium text-sm">
                  Learn More →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6 text-foreground">
            Explore Other Trailer Types
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              For oversized or open cargo, explore our{" "}
              <Link to="/flatbed-trailers" className="text-secondary hover:underline font-semibold">
                flatbed trailer leasing
              </Link>{" "}
              solutions.
            </p>
            <p className="text-sm text-muted-foreground">
              Not sure which trailer is right for your operation? Read our{" "}
              <Link to="/resources/guides/choosing-trailer" className="text-primary hover:underline font-medium">
                comprehensive guide to choosing the right trailer
              </Link>{" "}
              or{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact our team
              </Link>{" "}
              for personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Lease a Dry Van Trailer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Get started with flexible lease terms and competitive rates on our premium dry van fleet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Request A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90">
              <Link to="/dry-van-trailer-leasing">View All Leasing Options</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DryVanTrailers;
