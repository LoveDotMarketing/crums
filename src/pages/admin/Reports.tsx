import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
  Receipt,
  Code,
  FileText,
  Search
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
import { format, subDays, differenceInDays } from "date-fns";
import { DevelopmentTab } from "@/components/admin/DevelopmentTab";
import { ContentTab } from "@/components/admin/ContentTab";
import { SEOTab } from "@/components/admin/SEOTab";

interface UnpaidToll {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  toll_date: string;
  days_overdue: number;
  status: string;
}

interface NewUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  customer_email: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");

  const startDate = subDays(new Date(), parseInt(dateRange));

  // Fetch unpaid tolls (pending or overdue) within date range
  const { data: unpaidTolls = [], isLoading: loadingTolls } = useQuery({
    queryKey: ["reports-unpaid-tolls", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tolls")
        .select(`
          id,
          amount,
          toll_date,
          status,
          customer_id,
          customers:customer_id (
            full_name,
            company_name,
            email
          )
        `)
        .in("status", ["pending", "overdue"])
        .gte("toll_date", startDate.toISOString().split("T")[0])
        .order("toll_date", { ascending: true });

      if (error) throw error;

      const today = new Date();
      return (data || []).map((toll) => {
        const tollDate = new Date(toll.toll_date);
        const daysOverdue = differenceInDays(today, tollDate);
        const customer = toll.customers as { full_name: string; company_name: string | null; email: string | null } | null;
        
        return {
          id: toll.id,
          customer_name: customer?.full_name || customer?.email || "Unknown",
          customer_email: customer?.email || "",
          customer_email: profile?.email || "",
          amount: Number(toll.amount),
          toll_date: toll.toll_date,
          days_overdue: Math.max(0, daysOverdue),
          status: toll.status,
        };
      }) as UnpaidToll[];
    },
  });

  // Fetch new users within date range
  const { data: newUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["reports-new-users", dateRange],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for these users
      const userIds = (profiles || []).map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      return (profiles || []).map((profile) => ({
        id: profile.id,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "No Name",
        email: profile.email,
        role: roleMap.get(profile.id) || "customer",
        joined: profile.created_at,
      })) as NewUser[];
    },
  });

  // Fetch billing summary from tolls within date range
  const { data: billingSummary, isLoading: loadingBilling } = useQuery({
    queryKey: ["reports-billing", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tolls")
        .select("id, amount, status, toll_date, customer_id, customers:customer_id (full_name, company_name, email)")
        .gte("toll_date", startDate.toISOString().split("T")[0]);

      if (error) throw error;

      const tolls = data || [];
      const total_invoiced = tolls.reduce((sum, t) => sum + Number(t.amount), 0);
      const total_collected = tolls.filter(t => t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0);
      const total_outstanding = tolls.filter(t => t.status !== "paid").reduce((sum, t) => sum + Number(t.amount), 0);

      // Group tolls by customer for invoice-like view
      const customerTolls = new Map<string, { customer: string; amount: number; status: string; id: string }>();
      tolls.forEach(toll => {
        const customer = toll.customers as { full_name: string; company_name: string | null; email: string | null } | null;
        const customerName = customer?.full_name || customer?.email || "Unknown";
        const key = toll.customer_id;
        
        if (customerTolls.has(key)) {
          const existing = customerTolls.get(key)!;
          existing.amount += Number(toll.amount);
          if (toll.status !== "paid") existing.status = "pending";
        } else {
          customerTolls.set(key, {
            id: key,
            customer: customerName,
            amount: Number(toll.amount),
            status: toll.status === "paid" ? "paid" : "pending",
          });
        }
      });

      return {
        total_invoiced,
        total_collected,
        total_outstanding,
        invoices: Array.from(customerTolls.values()).slice(0, 10),
      };
    },
  });

  // Fetch support tickets
  const { data: supportData, isLoading: loadingTickets } = useQuery({
    queryKey: ["reports-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, subject, status, priority, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tickets = data || [];
      
      // Fetch user emails separately
      const userIds = [...new Set(tickets.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      
      const emailMap = new Map((profiles || []).map(p => [p.id, p.email]));
      
      const open = tickets.filter(t => t.status === "open").length;
      const in_progress = tickets.filter(t => t.status === "in_progress" || t.status === "in-progress").length;
      const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

      return {
        total: tickets.length,
        open,
        in_progress,
        resolved,
        avg_resolution_time: "N/A",
        tickets: tickets.slice(0, 10).map(t => ({
          id: t.id.slice(0, 8).toUpperCase(),
          subject: t.subject,
          customer_email: emailMap.get(t.user_id) || "Unknown",
          priority: t.priority,
          status: t.status,
          created_at: t.created_at,
        })) as SupportTicket[],
      };
    },
  });

  const totalUnpaid = unpaidTolls.reduce((sum, t) => sum + t.amount, 0);
  const collectionRate = billingSummary && billingSummary.total_invoiced > 0 
    ? ((billingSummary.total_collected / billingSummary.total_invoiced) * 100).toFixed(1)
    : "0.0";

  const isLoading = loadingTolls || loadingUsers || loadingBilling || loadingTickets;

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
                    Pending Notices
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingTolls ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${totalUnpaid > 0 ? "text-yellow-600" : "text-foreground"}`}>
                        ${totalUnpaid.toFixed(2)}
                      </div>
                      <p className={`text-xs mt-1 ${totalUnpaid > 0 ? "text-yellow-600" : "text-muted-foreground"}`}>
                        {unpaidTolls.length} awaiting driver payment
                      </p>
                    </>
                  )}
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
                  {loadingUsers ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{newUsers.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last {dateRange} days
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cleared Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingBilling ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {collectionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(billingSummary?.total_collected || 0).toLocaleString()} marked paid
                      </p>
                    </>
                  )}
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
                  {loadingTickets ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{supportData?.open || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {supportData?.total || 0} total tickets
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reports Tabs */}
            <Tabs defaultValue="unpaid-tolls" className="space-y-6">
              <TabsList>
                <TabsTrigger value="unpaid-tolls">Pending Notices</TabsTrigger>
                <TabsTrigger value="new-users">New Users</TabsTrigger>
                <TabsTrigger value="billing">Toll Summary</TabsTrigger>
                <TabsTrigger value="support">Support Tickets</TabsTrigger>
                <TabsTrigger value="development" className="flex items-center gap-1">
                  <Code className="h-3.5 w-3.5" />
                  Development
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-1">
                  <Search className="h-3.5 w-3.5" />
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unpaid-tolls">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pending Toll Notices</CardTitle>
                      <CardDescription>
                        Tolls awaiting driver payment confirmation
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingTolls ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : unpaidTolls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No pending toll notices</p>
                        <p className="text-sm">All drivers have confirmed payment</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Toll Date</TableHead>
                            <TableHead>Days Pending</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unpaidTolls.map((toll) => (
                            <TableRow key={toll.id}>
                              <TableCell className="font-medium">{toll.customer_name}</TableCell>
                              <TableCell className="text-red-600 font-bold">
                                ${toll.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>{format(new Date(toll.toll_date), "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                <Badge variant={toll.days_overdue > 14 ? "destructive" : toll.days_overdue > 7 ? "secondary" : "outline"}>
                                  {toll.days_overdue} day{toll.days_overdue !== 1 ? "s" : ""}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Awaiting Payment</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {unpaidTolls.length > 0 && (
                            <TableRow className="font-bold bg-muted/50">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-red-600">${totalUnpaid.toFixed(2)}</TableCell>
                              <TableCell colSpan={3}></TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
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
                    {loadingUsers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : newUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No new users</p>
                        <p className="text-sm">No users registered in this period</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{user.role}</Badge>
                              </TableCell>
                              <TableCell>{format(new Date(user.joined), "MMM d, yyyy")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Toll Summary Report</CardTitle>
                      <CardDescription>
                        Overview of toll notices sent to drivers
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingBilling ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Notices Sent</p>
                            <p className="text-2xl font-bold">
                              ${(billingSummary?.total_invoiced || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Confirmed Paid</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${(billingSummary?.total_collected || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Awaiting Confirmation</p>
                            <p className={`text-2xl font-bold ${(billingSummary?.total_outstanding || 0) > 0 ? "text-yellow-600" : "text-foreground"}`}>
                              ${(billingSummary?.total_outstanding || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {(billingSummary?.invoices?.length || 0) === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No toll data</p>
                            <p className="text-sm">Toll notices will appear here</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {billingSummary?.invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                  <TableCell className="font-medium">{invoice.customer}</TableCell>
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
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Support Tickets Report</CardTitle>
                      <CardDescription>
                        All support tickets overview
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingTickets ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 md:grid-cols-4 mb-6">
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Tickets</p>
                            <p className="text-2xl font-bold">{supportData?.total || 0}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Open</p>
                            <p className={`text-2xl font-bold ${(supportData?.open || 0) > 0 ? "text-red-600" : "text-foreground"}`}>
                              {supportData?.open || 0}
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">In Progress</p>
                            <p className="text-2xl font-bold">{supportData?.in_progress || 0}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">{supportData?.resolved || 0}</p>
                          </div>
                        </div>

                        {(supportData?.tickets?.length || 0) === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No support tickets</p>
                            <p className="text-sm">Support requests will appear here</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ticket ID</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {supportData?.tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                  <TableCell className="font-medium font-mono">{ticket.id}</TableCell>
                                  <TableCell>{ticket.subject}</TableCell>
                                  <TableCell>{ticket.customer_email}</TableCell>
                                  <TableCell>
                                    <Badge variant={ticket.priority === "high" ? "destructive" : "secondary"}>
                                      {ticket.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={ticket.status === "open" ? "destructive" : ticket.status === "resolved" ? "default" : "secondary"}>
                                      {ticket.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{format(new Date(ticket.created_at), "MMM d, yyyy")}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="development">
                <DevelopmentTab />
              </TabsContent>

              <TabsContent value="content">
                <ContentTab />
              </TabsContent>

              <TabsContent value="seo">
                <SEOTab />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
