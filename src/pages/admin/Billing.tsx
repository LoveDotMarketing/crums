import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Plus, 
  Search, 
  TrendingUp,
  FileText,
  CreditCard,
  Calendar
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock billing data
  const invoices = [
    {
      id: "INV-001",
      customer: "ABC Transport",
      amount: 4800.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "paid",
      payment_date: "2024-01-15",
      items: "Trailer Rental (Jan)"
    },
    {
      id: "INV-002",
      customer: "XYZ Logistics",
      amount: 3200.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "pending",
      payment_date: null,
      items: "Trailer Rental (Jan)"
    },
    {
      id: "INV-003",
      customer: "Heavy Haul Co",
      amount: 8500.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "pending",
      payment_date: null,
      items: "Trailer Rental (Jan) + Maintenance"
    },
    {
      id: "INV-004",
      customer: "Fuel Express",
      amount: 4500.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "paid",
      payment_date: "2024-01-20",
      items: "Trailer Rental (Jan)"
    },
    {
      id: "INV-005",
      customer: "Cold Chain LLC",
      amount: 2800.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "overdue",
      payment_date: null,
      items: "Trailer Rental (Jan)"
    },
    {
      id: "INV-006",
      customer: "ABC Transport",
      amount: 4800.00,
      issued_date: "2023-12-01",
      due_date: "2023-12-31",
      status: "paid",
      payment_date: "2023-12-28",
      items: "Trailer Rental (Dec)"
    },
    {
      id: "INV-007",
      customer: "FastTrack Inc",
      amount: 1800.00,
      issued_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "pending",
      payment_date: null,
      items: "Trailer Rental (Jan)"
    },
    {
      id: "INV-008",
      customer: "Heavy Haul Co",
      amount: 8500.00,
      issued_date: "2023-12-01",
      due_date: "2023-12-31",
      status: "paid",
      payment_date: "2023-12-15",
      items: "Trailer Rental (Dec)"
    }
  ];

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
  const thisMonthRevenue = invoices.filter(i => 
    i.status === "paid" && 
    new Date(i.payment_date || "").getMonth() === new Date().getMonth()
  ).reduce((sum, i) => sum + i.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Billing Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All-time collected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    This Month
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${thisMonthRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${pendingAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoices.filter(i => i.status === "pending").length} invoices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${overdueAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {invoices.filter(i => i.status === "overdue").length} invoices overdue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.items}
                        </TableCell>
                        <TableCell className="font-bold">
                          ${invoice.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(invoice.issued_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.payment_date 
                            ? new Date(invoice.payment_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button variant="ghost" size="sm">
                                Send
                              </Button>
                            )}
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
