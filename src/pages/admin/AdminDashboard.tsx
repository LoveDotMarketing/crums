import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, Truck, DollarSign, TrendingUp, AlertCircle, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChatBot } from "@/components/ChatBot";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { TollFormDialog } from "@/components/admin/TollFormDialog";
import { CustomerFormDialog } from "@/components/admin/CustomerFormDialog";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [tollDialogOpen, setTollDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const handleSendTestACHEmail = async () => {
    setSendingTestEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-ach-setup-email", {
        body: { testMode: true }
      });
      if (error) throw error;
      toast.success("Test ACH setup email sent to your inbox!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSendingTestEmail(false);
    }
  };

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
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const [tollsResult, applicationsResult, profilesResult, customersResult] = await Promise.all([
        supabase
          .from("tolls")
          .select("id, amount, status, created_at, customer_id, toll_authority, toll_location")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("customer_applications")
          .select("id, status, created_at, updated_at, user_id")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, company_name, email"),
        supabase
          .from("customers")
          .select("id, full_name, company_name, email"),
      ]);

      const customersMap = new Map<string, { full_name: string; company_name: string | null; email: string | null }>(
        (customersResult.data || []).map(c => [c.id, c])
      );

      const profilesData = profilesResult.data || [];
      const profilesMap = new Map<string, { id: string; first_name: string | null; last_name: string | null; company_name: string | null; email: string }>(
        profilesData.map(p => [p.id, p])
      );

      const activities: Array<{
        type: string;
        customer: string;
        detail: string;
        amount: string;
        status: string;
        time: string;
        timestamp: number;
      }> = [];

      tollsResult.data?.forEach(toll => {
        // customer_id in tolls references profiles.id
        const profile = profilesMap.get(toll.customer_id);
        const customer = customersMap.get(toll.customer_id);
        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
        const customerName = fullName || customer?.full_name || profile?.company_name || customer?.company_name || profile?.email || "Unknown";
        const tollDetail = toll.toll_authority || toll.toll_location || "Toll";
        activities.push({
          type: "toll",
          customer: customerName,
          detail: tollDetail,
          amount: `$${Number(toll.amount).toFixed(2)}`,
          status: toll.status,
          time: formatDistanceToNow(new Date(toll.created_at), { addSuffix: true }),
          timestamp: new Date(toll.created_at).getTime(),
        });
      });

      applicationsResult.data?.forEach(app => {
        const profile = profilesMap.get(app.user_id);
        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
        const customerName = fullName 
          ? (profile?.company_name ? `${fullName} - ${profile.company_name}` : fullName)
          : profile?.company_name || profile?.email || "New Applicant";
        const appTime = (app as any).updated_at || app.created_at;
        activities.push({
          type: "application",
          customer: customerName,
          detail: "Application",
          amount: `Application`,
          status: app.status,
          time: formatDistanceToNow(new Date(appTime), { addSuffix: true }),
          timestamp: new Date(appTime).getTime(),
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);
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

  const handleTollSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-toll-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-recent-activity"] });
  };

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="CRUMS Leasing admin dashboard for fleet and customer management."
        noindex
      />
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
                    {isLoadingActivity ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !recentActivity || recentActivity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No recent activity</p>
                    ) : (
                      recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-border">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{activity.customer}</p>
                              <p className="text-sm text-muted-foreground">
                                {activity.detail} · {activity.time}
                              </p>
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
                    <button 
                      onClick={() => setTollDialogOpen(true)}
                      className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add New Toll</p>
                          <p className="text-sm text-muted-foreground">Record a new toll charge</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setCustomerDialogOpen(true)}
                      className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add Customer</p>
                          <p className="text-sm text-muted-foreground">Register a new customer</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate("/dashboard/admin/fleet")}
                      className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Add Trailer</p>
                          <p className="text-sm text-muted-foreground">Add to fleet inventory</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={handleSendTestACHEmail}
                      disabled={sendingTestEmail}
                      className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {sendingTestEmail ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">Test ACH Email</p>
                          <p className="text-sm text-muted-foreground">Send test payment setup email</p>
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
                      <button 
                        onClick={() => navigate("/dashboard/admin/tolls")}
                        className="block text-sm text-foreground hover:text-primary hover:underline transition-colors text-left"
                      >
                        • {tollStats?.overdueCount} tolls are overdue by more than 30 days
                      </button>
                    )}
                    {(pendingApplications || 0) > 0 && (
                      <button 
                        onClick={() => navigate("/dashboard/admin/applications")}
                        className="block text-sm text-foreground hover:text-primary hover:underline transition-colors text-left"
                      >
                        • {pendingApplications} new customer applications need review
                      </button>
                    )}
                    {(maintenanceAlerts || 0) > 0 && (
                      <button 
                        onClick={() => navigate("/dashboard/admin/fleet")}
                        className="block text-sm text-foreground hover:text-primary hover:underline transition-colors text-left"
                      >
                        • {maintenanceAlerts} trailers have open maintenance requests
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
      <ChatBot userType="admin" />
      
      <TollFormDialog 
        open={tollDialogOpen} 
        onOpenChange={setTollDialogOpen}
        onSuccess={handleTollSuccess}
      />
      <CustomerFormDialog 
        open={customerDialogOpen} 
        onOpenChange={setCustomerDialogOpen}
      />
    </SidebarProvider>
    </>
  );
}
