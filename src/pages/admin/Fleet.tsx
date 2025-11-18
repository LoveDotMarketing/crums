import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Truck, 
  Plus, 
  Search, 
  MapPin, 
  DollarSign, 
  Wrench,
  Calendar,
  TrendingUp,
  Edit,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Fleet() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for 10 trailers of various kinds
  const trailers = [
    {
      id: "1",
      trailer_number: "TRL-001",
      type: "Dry Van",
      make: "Utility",
      model: "3000R",
      year: 2020,
      year_purchased: 2020,
      purchase_price: 35000,
      total_maintenance_cost: 4500,
      is_rented: true,
      rental_income: 24000,
      status: "rented",
      assigned_to: "ABC Transport",
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "1UYVS25387A123456",
      mileage: 145230
    },
    {
      id: "2",
      trailer_number: "TRL-002",
      type: "Refrigerated",
      make: "Great Dane",
      model: "Everest",
      year: 2021,
      year_purchased: 2021,
      purchase_price: 58000,
      total_maintenance_cost: 3200,
      is_rented: false,
      rental_income: 18000,
      status: "available",
      assigned_to: null,
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "1GRAA06259S123457",
      mileage: 98450
    },
    {
      id: "3",
      trailer_number: "TRL-003",
      type: "Flatbed",
      make: "Fontaine",
      model: "Revolution",
      year: 2019,
      year_purchased: 2019,
      purchase_price: 42000,
      total_maintenance_cost: 6800,
      is_rented: true,
      rental_income: 32000,
      status: "rented",
      assigned_to: "XYZ Logistics",
      gps_latitude: 40.7128,
      gps_longitude: -74.0060,
      vin: "4FMSK12R1FTA123458",
      mileage: 187620
    },
    {
      id: "4",
      trailer_number: "TRL-004",
      type: "Dry Van",
      make: "Wabash",
      model: "National",
      year: 2022,
      year_purchased: 2022,
      purchase_price: 38000,
      total_maintenance_cost: 1200,
      is_rented: false,
      rental_income: 8000,
      status: "maintenance",
      assigned_to: null,
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "1JJV532W5JL123459",
      mileage: 54320
    },
    {
      id: "5",
      trailer_number: "TRL-005",
      type: "Lowboy",
      make: "Talbert",
      model: "55SA",
      year: 2018,
      year_purchased: 2018,
      purchase_price: 65000,
      total_maintenance_cost: 9500,
      is_rented: true,
      rental_income: 45000,
      status: "rented",
      assigned_to: "Heavy Haul Co",
      gps_latitude: 41.8781,
      gps_longitude: -87.6298,
      vin: "5SFTA33348S123460",
      mileage: 234580
    },
    {
      id: "6",
      trailer_number: "TRL-006",
      type: "Dry Van",
      make: "Utility",
      model: "4000AE",
      year: 2021,
      year_purchased: 2021,
      purchase_price: 36000,
      total_maintenance_cost: 2100,
      is_rented: false,
      rental_income: 12000,
      status: "available",
      assigned_to: null,
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "1UYVS31647A123461",
      mileage: 67890
    },
    {
      id: "7",
      trailer_number: "TRL-007",
      type: "Tanker",
      make: "Brenner",
      model: "Tank",
      year: 2020,
      year_purchased: 2020,
      purchase_price: 72000,
      total_maintenance_cost: 5400,
      is_rented: true,
      rental_income: 38000,
      status: "rented",
      assigned_to: "Fuel Express",
      gps_latitude: 29.7604,
      gps_longitude: -95.3698,
      vin: "7BRNR45789T123462",
      mileage: 156780
    },
    {
      id: "8",
      trailer_number: "TRL-008",
      type: "Step Deck",
      make: "Fontaine",
      model: "Magnitude",
      year: 2019,
      year_purchased: 2019,
      purchase_price: 48000,
      total_maintenance_cost: 7200,
      is_rented: false,
      rental_income: 28000,
      status: "available",
      assigned_to: null,
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "4FMSK34R9KTA123463",
      mileage: 123450
    },
    {
      id: "9",
      trailer_number: "TRL-009",
      type: "Refrigerated",
      make: "Thermo King",
      model: "SB-230",
      year: 2023,
      year_purchased: 2023,
      purchase_price: 62000,
      total_maintenance_cost: 500,
      is_rented: true,
      rental_income: 15000,
      status: "rented",
      assigned_to: "Cold Chain LLC",
      gps_latitude: 33.4484,
      gps_longitude: -112.0740,
      vin: "8THRM23459S123464",
      mileage: 23450
    },
    {
      id: "10",
      trailer_number: "TRL-010",
      type: "Conestoga",
      make: "Timpte",
      model: "Super Hopper",
      year: 2020,
      year_purchased: 2020,
      purchase_price: 52000,
      total_maintenance_cost: 4800,
      is_rented: false,
      rental_income: 22000,
      status: "available",
      assigned_to: null,
      gps_latitude: 34.0522,
      gps_longitude: -118.2437,
      vin: "9TIMP67890C123465",
      mileage: 89760
    }
  ];

  const filteredTrailers = trailers.filter(
    (trailer) =>
      trailer.trailer_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.make?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateROI = (trailer: typeof trailers[0]) => {
    const totalInvestment = trailer.purchase_price + trailer.total_maintenance_cost;
    const roi = ((trailer.rental_income - totalInvestment) / totalInvestment) * 100;
    return roi.toFixed(1);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      rented: "default",
      available: "secondary",
      maintenance: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const totalFleetCount = trailers.length;
  const totalOut = trailers.filter(t => t.is_rented).length;
  const totalIn = trailers.filter(t => !t.is_rented).length;
  const totalFleetValue = trailers.reduce((sum, t) => sum + t.purchase_price, 0);
  const totalMaintenanceCost = trailers.reduce((sum, t) => sum + t.total_maintenance_cost, 0);
  const totalRentalIncome = trailers.reduce((sum, t) => sum + t.rental_income, 0);
  const availableCount = trailers.filter(t => t.status === "available").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Trailer
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Fleet Stats */}
            <div className="grid gap-6 md:grid-cols-5 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Fleet
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalFleetCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All trailers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Out (Rented)
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOut}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently rented
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In (Yard)
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalIn}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available in yard
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Fleet Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalFleetValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trailers.length} trailers total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Maintenance
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All-time costs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by number, type, or make..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Fleet Table */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trailer #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Make/Model</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Maintenance</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrailers.map((trailer) => (
                      <TableRow key={trailer.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{trailer.trailer_number}</TableCell>
                        <TableCell>{trailer.type}</TableCell>
                        <TableCell>{trailer.make} {trailer.model}</TableCell>
                        <TableCell>{trailer.year}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {trailer.mileage.toLocaleString()} mi
                        </TableCell>
                        <TableCell>{getStatusBadge(trailer.status)}</TableCell>
                        <TableCell>${trailer.purchase_price.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">
                          ${trailer.total_maintenance_cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-600">
                          ${trailer.rental_income.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={parseFloat(calculateROI(trailer)) > 0 ? "text-green-600" : "text-red-600"}>
                            {calculateROI(trailer)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">
                              {trailer.is_rented ? trailer.assigned_to : "Yard"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
