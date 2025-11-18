import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  Search, 
  Mail,
  Phone,
  Building2,
  DollarSign
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock customer data
  const customers = [
    {
      id: "1",
      name: "ABC Transport",
      email: "contact@abctransport.com",
      phone: "(555) 123-4567",
      company: "ABC Transport Inc.",
      status: "active",
      trailers_rented: 3,
      total_spent: 48000,
      outstanding_tolls: 1250
    },
    {
      id: "2",
      name: "XYZ Logistics",
      email: "info@xyzlogistics.com",
      phone: "(555) 234-5678",
      company: "XYZ Logistics LLC",
      status: "active",
      trailers_rented: 2,
      total_spent: 32000,
      outstanding_tolls: 890
    },
    {
      id: "3",
      name: "FastTrack Inc",
      email: "admin@fasttrack.com",
      phone: "(555) 345-6789",
      company: "FastTrack Inc.",
      status: "active",
      trailers_rented: 1,
      total_spent: 18000,
      outstanding_tolls: 450
    },
    {
      id: "4",
      name: "Global Shipping",
      email: "dispatch@globalship.com",
      phone: "(555) 456-7890",
      company: "Global Shipping Co.",
      status: "pending",
      trailers_rented: 0,
      total_spent: 0,
      outstanding_tolls: 0
    },
    {
      id: "5",
      name: "Heavy Haul Co",
      email: "heavy@haul.com",
      phone: "(555) 567-8901",
      company: "Heavy Haul Co.",
      status: "active",
      trailers_rented: 4,
      total_spent: 85000,
      outstanding_tolls: 2340
    },
    {
      id: "6",
      name: "Fuel Express",
      email: "ops@fuelexpress.com",
      phone: "(555) 678-9012",
      company: "Fuel Express Ltd.",
      status: "active",
      trailers_rented: 2,
      total_spent: 45000,
      outstanding_tolls: 670
    },
    {
      id: "7",
      name: "Cold Chain LLC",
      email: "info@coldchain.com",
      phone: "(555) 789-0123",
      company: "Cold Chain LLC",
      status: "active",
      trailers_rented: 1,
      total_spent: 28000,
      outstanding_tolls: 320
    },
    {
      id: "8",
      name: "Swift Movers",
      email: "contact@swiftmovers.com",
      phone: "(555) 890-1234",
      company: "Swift Movers Inc.",
      status: "inactive",
      trailers_rented: 0,
      total_spent: 12000,
      outstanding_tolls: 0
    }
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      inactive: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding_tolls, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Customer Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {customers.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">
                    All-time earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Outstanding Tolls
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
                  <p className="text-xs text-red-600 mt-1">
                    Pending payment
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trailers</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {customer.company}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>{customer.trailers_rented}</TableCell>
                        <TableCell className="text-green-600">
                          ${customer.total_spent.toLocaleString()}
                        </TableCell>
                        <TableCell className={customer.outstanding_tolls > 0 ? "text-red-600" : ""}>
                          ${customer.outstanding_tolls.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
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
