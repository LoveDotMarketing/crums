import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, AlertCircle, CheckCircle, Loader2, Bell } from "lucide-react";
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
import { toast } from "sonner";

interface Toll {
  id: string;
  toll_location: string | null;
  toll_authority: string | null;
  amount: number;
  toll_date: string;
  status: string;
}

interface TollStats {
  pendingAmount: number;
  paidThisMonth: number;
  pendingCount: number;
}

export default function CustomerDashboard() {
  const { user, signOut } = useAuth();
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [tollStats, setTollStats] = useState<TollStats>({ pendingAmount: 0, paidThisMonth: 0, pendingCount: 0 });
  const [trailerCount, setTrailerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

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
        .select("id, toll_location, toll_authority, amount, toll_date, status")
        .eq("customer_id", user.id)
        .order("toll_date", { ascending: false })
        .limit(20);

      if (error) throw error;

      setTolls(data || []);

      // Calculate stats
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const pendingAmount = (data || [])
        .filter(t => t.status === "pending" || t.status === "overdue")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const paidThisMonth = (data || [])
        .filter(t => t.status === "paid" && new Date(t.toll_date) >= firstOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pendingCount = (data || []).filter(t => t.status === "pending" || t.status === "overdue").length;

      setTollStats({ pendingAmount, paidThisMonth, pendingCount });
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

  const markTollAsPaid = async (tollId: string) => {
    setMarkingPaid(tollId);
    try {
      const { error } = await supabase
        .from("tolls")
        .update({ 
          status: "paid", 
          payment_date: new Date().toISOString() 
        })
        .eq("id", tollId)
        .eq("customer_id", user?.id);

      if (error) throw error;

      toast.success("Toll marked as paid", {
        description: "Thank you! Notifications for this toll have been stopped."
      });
      
      // Refresh tolls list
      fetchTolls();
    } catch (error) {
      console.error("Error marking toll as paid:", error);
      toast.error("Failed to update toll status");
    } finally {
      setMarkingPaid(null);
    }
  };

  const stats = [
    {
      title: "Pending Toll Notices",
      value: tollStats.pendingCount.toString(),
      subtext: `$${tollStats.pendingAmount.toFixed(2)} total`,
      icon: Bell,
      color: tollStats.pendingCount > 0 ? "text-yellow-600" : "text-muted-foreground"
    },
    {
      title: "Assigned Trailers",
      value: trailerCount.toString(),
      subtext: "Active assignments",
      icon: Truck,
      color: trailerCount > 0 ? "text-blue-600" : "text-muted-foreground"
    },
    {
      title: "Cleared This Month",
      value: `$${tollStats.paidThisMonth.toFixed(2)}`,
      subtext: "Marked as paid",
      icon: CheckCircle,
      color: "text-green-600"
    },
  ];

  const pendingTolls = tolls.filter(t => t.status === "pending" || t.status === "overdue");
  const paidTolls = tolls.filter(t => t.status === "paid");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Customer Dashboard"
        description="Manage your CRUMS Leasing account, view toll notices, and access your trailer information."
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
                    <>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Toll Notices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Toll Notices Requiring Payment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                These tolls were billed to our trailers. Please pay directly to the toll authority, then click "I've Paid This" to stop reminders.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingTolls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-70" />
                  <p className="font-medium text-green-600">All caught up!</p>
                  <p className="text-sm">No pending toll notices</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTolls.map((toll) => (
                    <div key={toll.id} className="flex items-center justify-between py-4 px-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{toll.toll_location || "Toll Location"}</p>
                        <p className="text-sm text-muted-foreground">
                          {toll.toll_authority && <span>{toll.toll_authority} • </span>}
                          {format(new Date(toll.toll_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-foreground">${Number(toll.amount).toFixed(2)}</span>
                        <Button 
                          onClick={() => markTollAsPaid(toll.id)}
                          disabled={markingPaid === toll.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {markingPaid === toll.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          I've Paid This
                        </Button>
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
                  You have {tollStats.pendingCount} toll notice{tollStats.pendingCount > 1 ? 's' : ''} totaling ${tollStats.pendingAmount.toFixed(2)}. 
                  Please pay these directly to the toll authority, then mark them as paid above to stop reminders.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recently Paid Tolls */}
          {paidTolls.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Recently Cleared</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paidTolls.slice(0, 5).map((toll) => (
                    <div key={toll.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{toll.toll_location || "Toll Location"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(toll.toll_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">${Number(toll.amount).toFixed(2)}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  Complete your application to get started with trailer leasing. Any toll notices for your assigned trailers will appear here.
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
