import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck, ArrowRight } from "lucide-react";

const dryVanPricing = [
  { year: "2027", price: "$950", badge: "New", highlight: true },
  { year: "2024", price: "$800" },
  { year: "2021", price: "$780" },
  { year: "2020", price: "$750" },
  { year: "2019", price: "$720" },
  { year: "2018", price: "$700" },
];

const flatbedPricing = [
  { year: "2027", price: "$1,400", badge: "New", highlight: true },
];

const PriceSheet = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Trailer Lease Price Sheet | CRUMS Leasing"
        description="View current monthly lease rates for dry van and flatbed trailers. Competitive pricing on 2018–2027 model year trailers."
        canonical="https://crumsleasing.com/price-sheet"
        noindex
      />
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Monthly Lease Rates
            </h1>
            <p className="text-muted-foreground text-lg">
              All rates are per month. Contact us for multi-trailer discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Dry Van */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Truck className="h-5 w-5 text-primary" />
                  53' Dry Van Trailers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {dryVanPricing.map((item) => (
                  <div
                    key={item.year}
                    className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${
                      item.highlight ? "bg-primary/5 -mx-6 px-6 rounded-md" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.year}</span>
                      {item.badge && (
                        <Badge variant="default" className="bg-green-600 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {item.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Flatbed */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Truck className="h-5 w-5 text-secondary" />
                  53' Flatbed Trailers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {flatbedPricing.map((item) => (
                  <div
                    key={item.year}
                    className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${
                      item.highlight ? "bg-primary/5 -mx-6 px-6 rounded-md" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.year}</span>
                      {item.badge && (
                        <Badge variant="default" className="bg-green-600 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {item.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10 space-y-4">
            <p className="text-sm text-muted-foreground">
              Prices subject to availability. Rates may vary based on lease term and credit approval.
            </p>
            <Button asChild size="lg">
              <Link to="/get-started">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PriceSheet;
