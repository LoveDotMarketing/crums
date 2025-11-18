import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, Truck, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChatBot } from "@/components/ChatBot";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Outstanding Tolls",
      value: "$12,450",
      icon: Receipt,
      change: "+12% from last month",
      trend: "up"
    },
    {
      title: "Active Customers",
      value: "47",
      icon: Users,
      change: "+3 this month",
      trend: "up"
    },
    {
      title: "Fleet Size",
      value: "152",
      icon: Truck,
      change: "8 available",
      trend: "neutral"
    },
    {
      title: "Collected This Month",
      value: "$28,340",
      icon: DollarSign,
      change: "+18% from last month",
      trend: "up"
    },
  ];

  const recentActivity = [
    { type: "toll", customer: "ABC Transport", amount: "$145.50", status: "pending", time: "2 hours ago" },
    { type: "payment", customer: "XYZ Logistics", amount: "$890.00", status: "paid", time: "5 hours ago" },
    { type: "toll", customer: "FastTrack Inc", amount: "$67.25", status: "pending", time: "1 day ago" },
    { type: "ticket", customer: "Global Shipping", amount: "Support #1234", status: "open", time: "1 day ago" },
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
                    {recentActivity.map((activity, i) => (
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
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
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
            <Card className="mt-6 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-foreground">• 5 tolls are overdue by more than 30 days</p>
                  <p className="text-sm text-foreground">• 3 support tickets need response</p>
                  <p className="text-sm text-foreground">• 2 trailers require maintenance review</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <ChatBot userType="admin" />
    </SidebarProvider>
  );
}
