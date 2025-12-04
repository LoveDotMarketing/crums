import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PrintButton } from "@/components/PrintButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, Route, DollarSign, Gauge } from "lucide-react";

const FuelCostCalculator = () => {
  const [distance, setDistance] = useState<number>(500);
  const [fuelPrice, setFuelPrice] = useState<number>(3.50);
  const [mpg, setMpg] = useState<number>(6.5);

  const gallonsNeeded = distance / mpg;
  const totalFuelCost = gallonsNeeded * fuelPrice;
  const costPerMile = totalFuelCost / distance;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Fuel Cost Calculator"
        description="Estimate your trip fuel costs with CRUMS Leasing's free fuel cost calculator. Enter your route distance, fuel price, and MPG to plan your fuel budget."
        canonical="https://crumsleasing.com/resources/tools/fuel-calculator"
      />
      <Navigation />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Fuel Cost Calculator
              </h1>
              <p className="text-muted-foreground">
                Quickly estimate fuel costs for your next trip
              </p>
            </div>

            <div className="flex justify-end mb-4">
              <PrintButton title="Print Results" />
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-primary" />
                  Trip Details
                </CardTitle>
                <CardDescription>
                  Enter your trip information below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Route Distance (miles)
                    </Label>
                    <Input
                      id="distance"
                      type="number"
                      min="0"
                      step="1"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelPrice" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fuel Price ($/gallon)
                    </Label>
                    <Input
                      id="fuelPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mpg" className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Average MPG
                    </Label>
                    <Input
                      id="mpg"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={mpg}
                      onChange={(e) => setMpg(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Trip Fuel Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Gallons Needed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {gallonsNeeded.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Fuel Cost</p>
                    <p className="text-2xl font-bold text-primary">
                      ${totalFuelCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Cost Per Mile</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${costPerMile.toFixed(3)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Disclaimer */}
            <Card className="mt-8 bg-muted/50 border-muted">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes only and does not constitute financial, tax, or legal advice. 
                  Actual fuel consumption may vary based on load weight, terrain, weather, and driving conditions. 
                  Always consult with a qualified professional before making business decisions. CRUMS Leasing is not responsible for decisions made based on these estimates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FuelCostCalculator;
