import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import dryVanTrailerImg from "@/assets/dry-van-trailer.png";
import flatbedTrailerImg from "@/assets/flatbed-trailer.png";
import refrigeratedTrailerImg from "@/assets/refrigerated-trailer.png";

export const EquipmentSection = () => {
  return (
    <section className="py-20 bg-muted content-deferred">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Equipment
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Quality trailers for every hauling need — lease or rent with flexible terms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link to="/dry-van-trailers" className="block hover:opacity-80 transition-opacity">
                <img 
                  src={dryVanTrailerImg} 
                  alt="53-foot dry van trailer for lease" 
                  className="w-full h-48 object-contain mb-4 rounded-lg bg-white/50" 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="300"
                />
              </Link>
              <h3 className="text-xl font-bold text-foreground mb-3">Dry Van Trailers</h3>
              <p className="text-muted-foreground mb-4">
                53-foot enclosed trailers perfect for general freight, retail goods, and dry cargo.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Swing or roll-up doors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Logistic posts & E-track
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  LED lighting standard
                </li>
              </ul>
              <Link 
                to="/dry-van-trailers" 
                className="text-secondary hover:text-secondary/80 font-semibold inline-flex items-center"
              >
                Learn more →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link to="/flatbed-trailers" className="block hover:opacity-80 transition-opacity">
                <img 
                  src={flatbedTrailerImg} 
                  alt="53-foot flatbed trailer for lease" 
                  className="w-full h-48 object-contain mb-4 rounded-lg bg-white/50" 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="300"
                />
              </Link>
              <h3 className="text-xl font-bold text-foreground mb-3">Flatbed Trailers</h3>
              <p className="text-muted-foreground mb-4">
                Open deck trailers ideal for oversized loads, construction materials, and machinery.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Steel or aluminum decks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Multiple tie-down options
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Spread axle available
                </li>
              </ul>
              <Link 
                to="/flatbed-trailers" 
                className="text-secondary hover:text-secondary/80 font-semibold inline-flex items-center"
              >
                Learn more →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link to="/refrigerated-trailers" className="block hover:opacity-80 transition-opacity">
                <img 
                  src={refrigeratedTrailerImg} 
                  alt="Refrigerated trailer (reefer) for lease" 
                  className="w-full h-48 object-contain mb-4 rounded-lg bg-white/50" 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="300"
                />
              </Link>
              <h3 className="text-xl font-bold text-foreground mb-3">Refrigerated Trailers</h3>
              <p className="text-muted-foreground mb-4">
                Temperature-controlled trailers for perishable goods, frozen foods, and pharmaceuticals.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Multi-temp zones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  GPS temp monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  -20°F to 70°F range
                </li>
              </ul>
              <Link 
                to="/refrigerated-trailers" 
                className="text-secondary hover:text-secondary/80 font-semibold inline-flex items-center"
              >
                Learn more →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
