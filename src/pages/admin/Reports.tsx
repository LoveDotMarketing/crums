import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");

  // Empty data - no mock data for production
  const unpaidTolls: { customer: string; amount: number; days_overdue: number; toll_date: string }[] = [];

  // Empty data - will be populated from real database
  const newUsers: { name: string; email: string; role: string; joined: string }[] = [];

  // Empty billing summary
  const billingSummary = {
    total_invoiced: 0,
    total_collected: 0,
    total_outstanding: 0,
    invoices: [] as { id: string; customer: string; amount: number; status: string }[]
  };

  // Empty support tickets summary
  const supportTicketsSummary = {
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    avg_resolution_time: "N/A",
    tickets: [] as { id: string; customer: string; priority: string; status: string; created: string }[]
  };

  const totalUnpaid = unpaidTolls.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
              <div className="flex gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Summary Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Outstanding
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalUnpaid.toFixed(2)}
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {unpaidTolls.length} unpaid tolls
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    New Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{newUsers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last {dateRange} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Collection Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {((billingSummary.total_collected / billingSummary.total_invoiced) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${billingSummary.total_collected.toLocaleString()} collected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Tickets
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportTicketsSummary.open}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: {supportTicketsSummary.avg_resolution_time}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reports Tabs */}
            <Tabs defaultValue="unpaid-tolls" className="space-y-6">
              <TabsList>
                <TabsTrigger value="unpaid-tolls">Unpaid Tolls</TabsTrigger>
                <TabsTrigger value="new-users">New Users</TabsTrigger>
                <TabsTrigger value="billing">Billing Summary</TabsTrigger>
                <TabsTrigger value="support">Support Tickets</TabsTrigger>
              </TabsList>

              <TabsContent value="unpaid-tolls">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Unpaid Tolls Report</CardTitle>
                      <CardDescription>
                        Tolls outstanding for more than 3 days
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Toll Date</TableHead>
                          <TableHead>Days Overdue</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidTolls.map((toll, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{toll.customer}</TableCell>
                            <TableCell className="text-red-600 font-bold">
                              ${toll.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>{new Date(toll.toll_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={toll.days_overdue > 7 ? "destructive" : "secondary"}>
                                {toll.days_overdue} days
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Send Reminder</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-red-600">${totalUnpaid.toFixed(2)}</TableCell>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="new-users">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>New Users Report</CardTitle>
                      <CardDescription>
                        Users registered in the last {dateRange} days
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newUsers.map((user, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">View Profile</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Billing Summary Report</CardTitle>
                      <CardDescription>
                        Invoice and payment overview
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Invoiced</p>
                        <p className="text-2xl font-bold">
                          ${billingSummary.total_invoiced.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Collected</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${billingSummary.total_collected.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Outstanding</p>
                        <p className="text-2xl font-bold text-red-600">
                          ${billingSummary.total_outstanding.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingSummary.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.customer}</TableCell>
                            <TableCell className="font-bold">
                              ${invoice.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                                {invoice.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Support Tickets Report</CardTitle>
                      <CardDescription>
                        High priority and open tickets
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Tickets</p>
                        <p className="text-2xl font-bold">{supportTicketsSummary.total}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Open</p>
                        <p className="text-2xl font-bold text-red-600">{supportTicketsSummary.open}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold">{supportTicketsSummary.in_progress}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">{supportTicketsSummary.resolved}</p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supportTicketsSummary.tickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id}</TableCell>
                            <TableCell>{ticket.customer}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{ticket.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={ticket.status === "open" ? "destructive" : "secondary"}>
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(ticket.created).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
