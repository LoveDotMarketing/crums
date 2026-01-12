import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { ChatBot } from "@/components/ChatBot";
import { ApplicationAlert } from "@/components/customer/ApplicationAlert";
import { SEO } from "@/components/SEO";
import { ReferralCard } from "@/components/customer/ReferralCard";
import { ApplicationStatusTracker } from "@/components/customer/ApplicationStatusTracker";
import { format } from "date-fns";

interface Toll {
  id: string;
  toll_location: string | null;
  amount: number;
  toll_date: string;
  status: string;
}

interface TollStats {
  outstanding: number;
  paidThisMonth: number;
  pendingCount: number;
}

export default function CustomerDashboard() {
  const { user, signOut } = useAuth();
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [tollStats, setTollStats] = useState<TollStats>({ outstanding: 0, paidThisMonth: 0, pendingCount: 0 });
  const [trailerCount, setTrailerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
      fetchTolls();
      fetchTrailers();

      // Set up real-time subscription for tolls
      const tollChannel = supabase
        .channel('customer-tolls')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tolls',
            filter: `customer_id=eq.${user.id}`
          },
          () => {
            fetchTolls();
          }
        )
        .subscribe();

      // Set up real-time subscription for trailers
      const trailerChannel = supabase
        .channel('customer-trailers')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trailers'
          },
          () => {
            fetchTrailers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(tollChannel);
        supabase.removeChannel(trailerChannel);
      };
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setApplicationStatus(data.status);
        
        const requiredFields = [
          data.phone_number,
          data.trailer_type,
          data.drivers_license_url,
          data.drivers_license_back_url,
          data.insurance_docs_url,
        ];
        
        const completed = requiredFields.filter(field => field && field.length > 0).length;
        setApplicationProgress(Math.round((completed / requiredFields.length) * 100));
      } else {
        setApplicationProgress(0);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const fetchTolls = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tolls")
        .select("id, toll_location, amount, toll_date, status")
        .eq("customer_id", user.id)
        .order("toll_date", { ascending: false })
        .limit(10);

      if (error) throw error;

      setTolls(data || []);

      // Calculate stats
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const outstanding = (data || [])
        .filter(t => t.status === "pending" || t.status === "overdue")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const paidThisMonth = (data || [])
        .filter(t => t.status === "paid" && new Date(t.toll_date) >= firstOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pendingCount = (data || []).filter(t => t.status === "pending").length;

      setTollStats({ outstanding, paidThisMonth, pendingCount });
    } catch (error) {
      console.error("Error fetching tolls:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailers = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from("trailers")
        .select("id", { count: "exact", head: true })
        .or(`customer_id.eq.${user.id},assigned_to.eq.${user.id}`);

      if (error) throw error;

      setTrailerCount(count || 0);
    } catch (error) {
      console.error("Error fetching trailers:", error);
    }
  };

  const stats = [
    {
      title: "Outstanding Tolls",
      value: `$${tollStats.outstanding.toFixed(2)}`,
      icon: Receipt,
      color: tollStats.outstanding > 0 ? "text-yellow-600" : "text-muted-foreground"
    },
    {
      title: "Assigned Trailers",
      value: trailerCount.toString(),
      icon: Truck,
      color: trailerCount > 0 ? "text-blue-600" : "text-muted-foreground"
    },
    {
      title: "Paid This Month",
      value: `$${tollStats.paidThisMonth.toFixed(2)}`,
      icon: CheckCircle,
      color: "text-green-600"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Customer Dashboard"
        description="Manage your CRUMS Leasing account, view tolls, and access your trailer information."
        noindex
      />
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>

          {/* Application Status Tracker */}
          {user && (
            <div className="mb-8">
              <ApplicationStatusTracker userId={user.id} />
            </div>
          )}

          {/* Application Status Alert */}
          {user && (
            <div className="mb-8">
              <ApplicationAlert userId={user.id} />
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Tolls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Tolls</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tolls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tolls on your account</p>
                  <p className="text-sm">Any toll charges will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tolls.map((toll) => (
                    <div key={toll.id} className="flex items-center justify-between py-3 border-b last:border-0 border-border">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{toll.toll_location || "Unknown Location"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(toll.toll_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground">${Number(toll.amount).toFixed(2)}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          toll.status === "paid" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : toll.status === "overdue"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {toll.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Required Alert - only show if pending tolls */}
          {tollStats.pendingCount > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="h-5 w-5" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  You have {tollStats.pendingCount} pending toll{tollStats.pendingCount > 1 ? 's' : ''} totaling ${tollStats.outstanding.toFixed(2)} that require{tollStats.pendingCount === 1 ? 's' : ''} payment.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Welcome Message - only show if no tolls */}
          {tolls.length === 0 && !loading && (
            <Card className="border-primary/30 bg-primary/5 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-5 w-5" />
                  Welcome to CRUMS Leasing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  Complete your application to get started with trailer leasing. We'll be in touch soon!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Referral Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Referral Program</h2>
            <ReferralCard />
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot userType="customer" />
    </div>
  );
}
