import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Calculator, DollarSign, Fuel, Shield, Wrench, Truck, MoreHorizontal } from "lucide-react";

interface CostInputs {
  milesPerMonth: number;
  fuelCostPerGallon: number;
  milesPerGallon: number;
  insurance: number;
  maintenance: number;
  leasePayment: number;
  tolls: number;
  permits: number;
  other: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(221 83% 53%)", "hsl(262 83% 58%)"];

const CostPerMileCalculator = () => {
  const [inputs, setInputs] = useState<CostInputs>({
    milesPerMonth: 10000,
    fuelCostPerGallon: 3.50,
    milesPerGallon: 6.5,
    insurance: 1200,
    maintenance: 500,
    leasePayment: 1500,
    tolls: 300,
    permits: 150,
    other: 200,
  });

  const calculations = useMemo(() => {
    const fuelCostPerMonth = (inputs.milesPerMonth / inputs.milesPerGallon) * inputs.fuelCostPerGallon;
    const totalMonthly = fuelCostPerMonth + inputs.insurance + inputs.maintenance + inputs.leasePayment + inputs.tolls + inputs.permits + inputs.other;
    const costPerMile = inputs.milesPerMonth > 0 ? totalMonthly / inputs.milesPerMonth : 0;

    const breakdown = [
      { name: "Fuel", value: fuelCostPerMonth, icon: Fuel },
      { name: "Insurance", value: inputs.insurance, icon: Shield },
      { name: "Maintenance", value: inputs.maintenance, icon: Wrench },
      { name: "Lease Payment", value: inputs.leasePayment, icon: Truck },
      { name: "Tolls", value: inputs.tolls, icon: DollarSign },
      { name: "Permits", value: inputs.permits, icon: DollarSign },
      { name: "Other", value: inputs.other, icon: MoreHorizontal },
    ].filter(item => item.value > 0);

    const perMileBreakdown = breakdown.map(item => ({
      ...item,
      perMile: inputs.milesPerMonth > 0 ? item.value / inputs.milesPerMonth : 0,
    }));

    return { fuelCostPerMonth, totalMonthly, costPerMile, breakdown, perMileBreakdown };
  }, [inputs]);

  const handleInputChange = (field: keyof CostInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const resetCalculator = () => {
    setInputs({
      milesPerMonth: 10000,
      fuelCostPerGallon: 3.50,
      milesPerGallon: 6.5,
      insurance: 1200,
      maintenance: 500,
      leasePayment: 1500,
      tolls: 300,
      permits: 150,
      other: 200,
    });
  };

  return (
    <>
      <Helmet>
        <title>Cost Per Mile Calculator | CRUMS Leasing Resources</title>
        <meta name="description" content="Calculate your true cost per mile with our free trucking calculator. Input fuel, insurance, maintenance, lease payments, and more to understand your operating costs." />
        <link rel="canonical" href="https://crumsleasing.com/resources/cost-per-mile" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Calculator className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Cost Per Mile Calculator
              </h1>
            </div>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              Understand your true operating costs. Enter your monthly expenses and mileage to calculate your cost per mile and see a detailed breakdown.
            </p>
          </div>
        </section>

        <Breadcrumbs />

        {/* Calculator Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Enter Your Costs
                  </CardTitle>
                  <CardDescription>
                    Input your monthly operating expenses and mileage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mileage Section */}
                  <div className="space-y-4 pb-4 border-b">
                    <h3 className="font-semibold text-foreground">Mileage</h3>
                    <div className="grid sm:grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="milesPerMonth">Miles Per Month</Label>
                        <Input
                          id="milesPerMonth"
                          type="number"
                          value={inputs.milesPerMonth}
                          onChange={(e) => handleInputChange("milesPerMonth", e.target.value)}
                          placeholder="10000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fuel Section */}
                  <div className="space-y-4 pb-4 border-b">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-primary" />
                      Fuel Costs
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fuelCostPerGallon">Fuel Cost Per Gallon ($)</Label>
                        <Input
                          id="fuelCostPerGallon"
                          type="number"
                          step="0.01"
                          value={inputs.fuelCostPerGallon}
                          onChange={(e) => handleInputChange("fuelCostPerGallon", e.target.value)}
                          placeholder="3.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milesPerGallon">Miles Per Gallon (MPG)</Label>
                        <Input
                          id="milesPerGallon"
                          type="number"
                          step="0.1"
                          value={inputs.milesPerGallon}
                          onChange={(e) => handleInputChange("milesPerGallon", e.target.value)}
                          placeholder="6.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Expenses */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Monthly Expenses ($)</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insurance" className="flex items-center gap-2">
                          <Shield className="h-3 w-3" /> Insurance
                        </Label>
                        <Input
                          id="insurance"
                          type="number"
                          value={inputs.insurance}
                          onChange={(e) => handleInputChange("insurance", e.target.value)}
                          placeholder="1200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maintenance" className="flex items-center gap-2">
                          <Wrench className="h-3 w-3" /> Maintenance
                        </Label>
                        <Input
                          id="maintenance"
                          type="number"
                          value={inputs.maintenance}
                          onChange={(e) => handleInputChange("maintenance", e.target.value)}
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leasePayment" className="flex items-center gap-2">
                          <Truck className="h-3 w-3" /> Lease Payment
                        </Label>
                        <Input
                          id="leasePayment"
                          type="number"
                          value={inputs.leasePayment}
                          onChange={(e) => handleInputChange("leasePayment", e.target.value)}
                          placeholder="1500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tolls">Tolls</Label>
                        <Input
                          id="tolls"
                          type="number"
                          value={inputs.tolls}
                          onChange={(e) => handleInputChange("tolls", e.target.value)}
                          placeholder="300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permits">Permits & Licenses</Label>
                        <Input
                          id="permits"
                          type="number"
                          value={inputs.permits}
                          onChange={(e) => handleInputChange("permits", e.target.value)}
                          placeholder="150"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="other">Other Expenses</Label>
                        <Input
                          id="other"
                          type="number"
                          value={inputs.other}
                          onChange={(e) => handleInputChange("other", e.target.value)}
                          placeholder="200"
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={resetCalculator} className="w-full">
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>

              {/* Results Card */}
              <div className="space-y-6">
                {/* Summary */}
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-primary-foreground/80 text-sm uppercase tracking-wide mb-2">
                        Your Cost Per Mile
                      </p>
                      <p className="text-5xl md:text-6xl font-bold mb-4">
                        ${calculations.costPerMile.toFixed(3)}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
                        <div>
                          <p className="text-primary-foreground/80 text-sm">Monthly Cost</p>
                          <p className="text-2xl font-semibold">
                            ${calculations.totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary-foreground/80 text-sm">Fuel Cost/Month</p>
                          <p className="text-2xl font-semibold">
                            ${calculations.fuelCostPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                    <CardDescription>Where your money goes each month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={calculations.breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {calculations.breakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Monthly Cost"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Per Mile Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Per Mile Breakdown</CardTitle>
                    <CardDescription>Each expense category per mile driven</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={calculations.perMileBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => `$${value.toFixed(2)}`} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => [`$${value.toFixed(3)}`, "Per Mile"]} />
                          <Bar dataKey="perMile" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Detailed Breakdown Table */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Detailed Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Expense Category</th>
                        <th className="text-right py-3 px-4 font-semibold">Monthly Cost</th>
                        <th className="text-right py-3 px-4 font-semibold">Cost Per Mile</th>
                        <th className="text-right py-3 px-4 font-semibold">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.perMileBreakdown.map((item, index) => (
                        <tr key={item.name} className="border-b last:border-0">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            {item.name}
                          </td>
                          <td className="text-right py-3 px-4">
                            ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="text-right py-3 px-4">${item.perMile.toFixed(3)}</td>
                          <td className="text-right py-3 px-4">
                            {((item.value / calculations.totalMonthly) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50 font-semibold">
                        <td className="py-3 px-4">Total</td>
                        <td className="text-right py-3 px-4">
                          ${calculations.totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4">${calculations.costPerMile.toFixed(3)}</td>
                        <td className="text-right py-3 px-4">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Looking to Reduce Your Costs?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              CRUMS Leasing offers competitive trailer lease rates to help keep your cost per mile low. Contact us to learn about our flexible leasing options.
            </p>
            <Button asChild size="lg">
              <a href="/contact">Get a Quote</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CostPerMileCalculator;
