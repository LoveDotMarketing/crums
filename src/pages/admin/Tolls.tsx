import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Receipt, 
  Plus, 
  Search, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Tolls() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock toll data
  const tolls = [
    {
      id: "1",
      customer: "ABC Transport",
      trailer: "TRL-001",
      location: "I-95 Delaware",
      authority: "Delaware River Port Authority",
      amount: 145.50,
      toll_date: "2024-01-15",
      status: "pending",
      payment_date: null
    },
    {
      id: "2",
      customer: "XYZ Logistics",
      trailer: "TRL-003",
      location: "Golden Gate Bridge",
      authority: "Golden Gate Bridge District",
      amount: 890.00,
      toll_date: "2024-01-14",
      status: "paid",
      payment_date: "2024-01-16"
    },
    {
      id: "3",
      customer: "FastTrack Inc",
      trailer: "TRL-002",
      location: "NJ Turnpike",
      authority: "NJ Turnpike Authority",
      amount: 67.25,
      toll_date: "2024-01-13",
      status: "pending",
      payment_date: null
    },
    {
      id: "4",
      customer: "Heavy Haul Co",
      trailer: "TRL-005",
      location: "PA Turnpike",
      authority: "PA Turnpike Commission",
      amount: 234.75,
      toll_date: "2024-01-12",
      status: "overdue",
      payment_date: null
    },
    {
      id: "5",
      customer: "Fuel Express",
      trailer: "TRL-007",
      location: "Texas Toll Road",
      authority: "NTTA",
      amount: 45.00,
      toll_date: "2024-01-11",
      status: "paid",
      payment_date: "2024-01-12"
    },
    {
      id: "6",
      customer: "Cold Chain LLC",
      trailer: "TRL-009",
      location: "Illinois Tollway",
      authority: "Illinois State Toll Highway Authority",
      amount: 78.50,
      toll_date: "2024-01-10",
      status: "pending",
      payment_date: null
    },
    {
      id: "7",
      customer: "ABC Transport",
      trailer: "TRL-001",
      location: "I-95 Maryland",
      authority: "Maryland Transportation Authority",
      amount: 156.00,
      toll_date: "2024-01-09",
      status: "paid",
      payment_date: "2024-01-15"
    },
    {
      id: "8",
      customer: "Heavy Haul Co",
      trailer: "TRL-005",
      location: "Ohio Turnpike",
      authority: "Ohio Turnpike Commission",
      amount: 289.25,
      toll_date: "2024-01-08",
      status: "overdue",
      payment_date: null
    }
  ];

  const filteredTolls = tolls.filter((toll) => {
    const matchesSearch = 
      toll.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toll.trailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toll.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || toll.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      paid: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      overdue: { variant: "destructive", icon: AlertCircle }
    };
    
    const { variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const totalPending = tolls.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);
  const totalOverdue = tolls.filter(t => t.status === "overdue").reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = tolls.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Toll Management</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Toll
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Toll Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Tolls
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tolls.filter(t => t.status === "pending").length} tolls
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Tolls
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
                  <p className="text-xs text-red-600 mt-1">
                    {tolls.filter(t => t.status === "overdue").length} tolls overdue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paid This Month
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {tolls.filter(t => t.status === "paid").length} tolls paid
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tolls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={statusFilter === "all" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === "pending" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
                <Button 
                  variant={statusFilter === "overdue" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("overdue")}
                >
                  Overdue
                </Button>
                <Button 
                  variant={statusFilter === "paid" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("paid")}
                >
                  Paid
                </Button>
              </div>
            </div>

            {/* Tolls Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Tolls</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Trailer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTolls.map((toll) => (
                      <TableRow key={toll.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {new Date(toll.toll_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{toll.customer}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{toll.trailer}</Badge>
                        </TableCell>
                        <TableCell>{toll.location}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {toll.authority}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${toll.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(toll.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {toll.payment_date 
                            ? new Date(toll.payment_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {toll.status !== "paid" && (
                            <Button variant="ghost" size="sm">
                              Mark Paid
                            </Button>
                          )}
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
