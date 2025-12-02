import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, Truck, DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChatBot } from "@/components/ChatBot";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch fleet stats
  const { data: fleetStats } = useQuery({
    queryKey: ["admin-fleet-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, status, is_rented");
      if (error) throw error;
      const total = data?.length || 0;
      const available = data?.filter(t => t.status === "available" && !t.is_rented).length || 0;
      const rented = data?.filter(t => t.is_rented).length || 0;
      const maintenance = data?.filter(t => t.status === "maintenance").length || 0;
      return { total, available, rented, maintenance };
    },
  });

  // Fetch customer stats
  const { data: customerStats } = useQuery({
    queryKey: ["admin-customer-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, status, created_at");
      if (error) throw error;
      const total = data?.length || 0;
      const active = data?.filter(c => c.status === "active").length || 0;
      const thisMonth = data?.filter(c => {
        const created = new Date(c.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0;
      return { total, active, thisMonth };
    },
  });

  // Fetch toll stats
  const { data: tollStats } = useQuery({
    queryKey: ["admin-toll-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tolls")
        .select("id, amount, status, payment_date, toll_date");
      if (error) throw error;
      
      const pending = data?.filter(t => t.status === "pending") || [];
      const outstandingAmount = pending.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const now = new Date();
      const thisMonth = data?.filter(t => {
        if (t.status !== "paid" || !t.payment_date) return false;
        const paymentDate = new Date(t.payment_date);
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      }) || [];
      const collectedThisMonth = thisMonth.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdue = pending.filter(t => new Date(t.toll_date) < thirtyDaysAgo).length;
      
      return { outstandingAmount, collectedThisMonth, pendingCount: pending.length, overdueCount: overdue };
    },
  });

  // Fetch recent activity (tolls and applications)
  const { data: recentActivity } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const [tollsResult, applicationsResult] = await Promise.all([
        supabase
          .from("tolls")
          .select("id, amount, status, created_at, customer_id, profiles:customer_id(first_name, last_name, company_name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("customer_applications")
          .select("id, status, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, company_name"),
      ]);

      const profilesData = applicationsResult[1].data || [];
      const profilesMap = new Map<string, { id: string; first_name: string | null; last_name: string | null; company_name: string | null }>(
        profilesData.map(p => [p.id, p])
      );

      const activities: Array<{
        type: string;
        customer: string;
        amount: string;
        status: string;
        time: string;
      }> = [];

      tollsResult.data?.forEach(toll => {
        const profile = toll.profiles as { first_name: string | null; last_name: string | null; company_name: string | null } | null;
        const customerName = profile?.company_name || 
          [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || 
          "Unknown";
        activities.push({
          type: toll.status === "paid" ? "payment" : "toll",
          customer: customerName,
          amount: `$${Number(toll.amount).toFixed(2)}`,
          status: toll.status,
          time: formatDistanceToNow(new Date(toll.created_at), { addSuffix: true }),
        });
      });

      applicationsResult[0].data?.forEach(app => {
        const profile = profilesMap.get(app.user_id);
        const customerName = profile?.company_name || 
          [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || 
          "New Applicant";
        activities.push({
          type: "application",
          customer: customerName,
          amount: `Application`,
          status: app.status,
          time: formatDistanceToNow(new Date(app.created_at), { addSuffix: true }),
        });
      });

      return activities.slice(0, 6);
    },
  });

  // Fetch maintenance alerts
  const { data: maintenanceAlerts } = useQuery({
    queryKey: ["admin-maintenance-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("id, status")
        .in("status", ["open", "in_progress"]);
      if (error) throw error;
      return data?.length || 0;
    },
  });

  // Fetch pending applications count
  const { data: pendingApplications } = useQuery({
    queryKey: ["admin-pending-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id")
        .eq("status", "new");
      if (error) throw error;
      return data?.length || 0;
    },
  });

  const stats = [
    {
      title: "Outstanding Tolls",
      value: tollStats ? `$${tollStats.outstandingAmount.toLocaleString()}` : "...",
      icon: Receipt,
      change: `${tollStats?.pendingCount || 0} pending`,
      trend: "neutral" as const
    },
    {
      title: "Active Customers",
      value: customerStats?.active?.toString() || "...",
      icon: Users,
      change: customerStats?.thisMonth ? `+${customerStats.thisMonth} this month` : "Loading...",
      trend: customerStats?.thisMonth ? "up" as const : "neutral" as const
    },
    {
      title: "Fleet Size",
      value: fleetStats?.total?.toString() || "...",
      icon: Truck,
      change: `${fleetStats?.available || 0} available`,
      trend: "neutral" as const
    },
    {
      title: "Collected This Month",
      value: tollStats ? `$${tollStats.collectedThisMonth.toLocaleString()}` : "...",
      icon: DollarSign,
      change: "From paid tolls",
      trend: tollStats?.collectedThisMonth ? "up" as const : "neutral" as const
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${
                      stat.trend === "up" ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!recentActivity ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No recent activity</p>
                    ) : (
                      recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-border">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{activity.customer}</p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">{activity.amount}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.status === "paid" 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : activity.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : activity.status === "new"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add New Toll</p>
                          <p className="text-sm text-muted-foreground">Record a new toll charge</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add Customer</p>
                          <p className="text-sm text-muted-foreground">Register a new customer</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add Trailer</p>
                          <p className="text-sm text-muted-foreground">Add to fleet inventory</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {((tollStats?.overdueCount || 0) > 0 || (maintenanceAlerts || 0) > 0 || (pendingApplications || 0) > 0) && (
              <Card className="mt-6 border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(tollStats?.overdueCount || 0) > 0 && (
                      <p className="text-sm text-foreground">• {tollStats?.overdueCount} tolls are overdue by more than 30 days</p>
                    )}
                    {(pendingApplications || 0) > 0 && (
                      <p className="text-sm text-foreground">• {pendingApplications} new customer applications need review</p>
                    )}
                    {(maintenanceAlerts || 0) > 0 && (
                      <p className="text-sm text-foreground">• {maintenanceAlerts} trailers have open maintenance requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
      <ChatBot userType="admin" />
    </SidebarProvider>
  );
}
