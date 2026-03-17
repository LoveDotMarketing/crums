import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, AlertCircle, CheckCircle, Loader2, Bell, Phone, ExternalLink, Mail, ClipboardCheck, CreditCard, AlertTriangle, KeyRound, FileText, Download } from "lucide-react";
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
import { findTollAuthority, TollAuthority } from "@/lib/tollAuthorities";
import { Link } from "react-router-dom";

interface Toll {
  id: string;
  toll_location: string | null;
  toll_authority: string | null;
  amount: number;
  toll_date: string;
  status: string;
  last_reminder_sent_at: string | null;
  reminder_count: number | null;
}

interface TollStats {
  pendingAmount: number;
  paidThisMonth: number;
  pendingCount: number;
}

interface PendingCheckout {
  id: string;
  trailer_number: string;
  trailer_type: string | null;
  inspection_date: string;
}

export default function CustomerDashboard() {
  const { user, signOut, effectiveUserId, isImpersonating, impersonatedUser } = useAuth();
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [paymentSetupStatus, setPaymentSetupStatus] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [tollStats, setTollStats] = useState<TollStats>({ pendingAmount: 0, paidThisMonth: 0, pendingCount: 0 });
  const [trailerCount, setTrailerCount] = useState(0);
  const [pendingCheckouts, setPendingCheckouts] = useState<PendingCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{ first_name: string | null; last_name: string | null; company_name: string | null } | null>(null);
  const [hasLeaseToOwn, setHasLeaseToOwn] = useState(false);
  const [leaseAgreementUrl, setLeaseAgreementUrl] = useState<string | null>(null);
  const [completedCheckouts, setCompletedCheckouts] = useState<{ id: string; trailer_number: string; trailer_type: string | null; inspection_date: string; customer_acknowledged_at: string | null }[]>([]);
  const [downloadingLease, setDownloadingLease] = useState(false);

  // Use effectiveUserId for queries when impersonating
  const currentUserId = effectiveUserId;

  useEffect(() => {
    if (currentUserId) {
      checkApplicationStatus();
      fetchTolls();
      fetchTrailers();
      fetchPendingCheckouts();
      fetchSubscriptionStatus();
      fetchProfile();
      checkLeaseToOwnSubscription();
      fetchMyDocuments();

      // Set up real-time subscription for tolls
      const tollChannel = supabase
        .channel('customer-tolls')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tolls',
            filter: `customer_id=eq.${currentUserId}`
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
  }, [currentUserId]);

  const fetchProfile = async () => {
    if (!currentUserId) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, company_name")
        .eq("id", currentUserId)
        .maybeSingle();
      if (data) setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const checkLeaseToOwnSubscription = async () => {
    const email = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;
    if (!email) return;
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (!customer) return;
      const { data: sub } = await supabase
        .from("customer_subscriptions")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("subscription_type", "lease_to_own")
        .in("status", ["active", "paused"])
        .maybeSingle();
      setHasLeaseToOwn(!!sub);
    } catch (error) {
      console.error("Error checking lease-to-own:", error);
    }
  };

  const fetchMyDocuments = async () => {
    if (!currentEmail || !currentUserId) return;
    try {
      // Fetch lease agreement URL
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();

      if (customer) {
        const { data: sub } = await supabase
          .from("customer_subscriptions")
          .select("lease_agreement_url")
          .eq("customer_id", customer.id)
          .not("lease_agreement_url", "is", null)
          .limit(1)
          .maybeSingle();
        setLeaseAgreementUrl(sub?.lease_agreement_url || null);
      }

      // Fetch completed DOT checkouts for this customer's trailers
      const { data: trailers } = await supabase
        .from("trailers")
        .select("id")
        .or(`customer_id.eq.${currentUserId},assigned_to.eq.${currentUserId}`);

      if (trailers?.length) {
        const { data: inspections } = await supabase
          .from("dot_inspections")
          .select("id, trailer_number, trailer_type, inspection_date, customer_acknowledged_at")
          .in("trailer_id", trailers.map(t => t.id))
          .eq("customer_acknowledged", true)
          .order("customer_acknowledged_at", { ascending: false })
          .limit(10);
        setCompletedCheckouts(inspections || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleViewLeaseAgreement = async () => {
    if (!leaseAgreementUrl) return;
    setDownloadingLease(true);
    try {
      // lease_agreement_url is a storage path — generate a signed URL
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(leaseAgreementUrl, 300);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error("Error generating signed URL:", error);
      // Fallback: try as a direct URL (e.g. DocuSign hosted)
      window.open(leaseAgreementUrl, "_blank");
    } finally {
      setDownloadingLease(false);
    }
  };

  const checkApplicationStatus = async () => {

    try {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("*")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setApplicationStatus(data.status);
        setPaymentSetupStatus(data.payment_setup_status);
        
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
        setPaymentSetupStatus(null);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const fetchTolls = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from("tolls")
        .select("id, toll_location, toll_authority, amount, toll_date, status, last_reminder_sent_at, reminder_count")
        .eq("customer_id", currentUserId)
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

  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;

  const fetchSubscriptionStatus = async () => {
    if (!currentEmail) return;

    try {
      // Find customer by email
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();

      if (!customer) {
        setSubscriptionStatus(null);
        return;
      }

      // Get subscription status
      const { data: subscription } = await supabase
        .from("customer_subscriptions")
        .select("status")
        .eq("customer_id", customer.id)
        .maybeSingle();

      setSubscriptionStatus(subscription?.status || null);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  const fetchTrailers = async () => {
    if (!currentEmail) return;

    try {
      // First find the customer record by email (since customers.id ≠ profiles.id)
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();

      if (!customer) {
        setTrailerCount(0);
        return;
      }

      // Count active subscription items for this customer
      const { count, error } = await supabase
        .from("subscription_items")
        .select("id, subscription:customer_subscriptions!inner(customer_id)", { count: "exact", head: true })
        .eq("subscription.customer_id", customer.id)
        .in("status", ["active", "paused"]);

      if (error) throw error;

      setTrailerCount(count || 0);
    } catch (error) {
      console.error("Error fetching trailers:", error);
    }
  };

  const fetchPendingCheckouts = async () => {
    if (!currentUserId) return;
    try {
      const { data: trailers } = await supabase.from("trailers").select("id").or(`customer_id.eq.${currentUserId},assigned_to.eq.${currentUserId}`);
      if (!trailers?.length) { setPendingCheckouts([]); return; }
      const { data } = await supabase.from("dot_inspections").select("id, trailer_number, trailer_type, inspection_date").in("trailer_id", trailers.map(t => t.id)).eq("status", "completed").eq("customer_acknowledged", false);
      setPendingCheckouts(data || []);
    } catch (error) { console.error("Error fetching pending checkouts:", error); }
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
        .eq("customer_id", currentUserId);

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
      color: tollStats.pendingCount > 0 ? "text-yellow-600" : "text-muted-foreground",
      link: null
    },
    {
      title: "Assigned Trailers",
      value: trailerCount.toString(),
      subtext: "Active assignments",
      icon: Truck,
      color: trailerCount > 0 ? "text-primary" : "text-muted-foreground",
      link: "/dashboard/customer/rentals"
    },
    {
      title: "Cleared This Month",
      value: `$${tollStats.paidThisMonth.toFixed(2)}`,
      subtext: "Marked as paid",
      icon: CheckCircle,
      color: "text-green-600",
      link: null
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
      {!isImpersonating && <Navigation />}
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {(() => {
                  if (isImpersonating && impersonatedUser) return impersonatedUser.displayName || impersonatedUser.email;
                  const fullName = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ");
                  if (fullName && profileData?.company_name) return `${fullName}, ${profileData.company_name}`;
                  if (fullName) return fullName;
                  return user?.email;
                })()}
              </p>
            </div>
            {!isImpersonating && (
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            )}
          </div>

          {/* Suspension Alert */}
          {subscriptionStatus === "suspended" && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Account Suspended</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span>
                  Your account has been suspended due to non-payment. Please update your payment method to restore access. 
                  Service will be automatically reinstated once payment is received.
                </span>
                <Link to="/dashboard/customer/billing">
                  <Button size="sm" variant="outline" className="whitespace-nowrap">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Application Status Tracker */}
          {currentUserId && (
            <div className="mb-8">
              <ApplicationStatusTracker userId={currentUserId} />
            </div>
          )}

          {/* Application Status Alert - only for incomplete/pending states */}
          {currentUserId && (
            <div className="mb-8">
              <ApplicationAlert userId={currentUserId} />
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {stats.map((stat) => {
              const cardContent = (
                <Card key={stat.title} className={`border-border ${stat.link ? "hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" : ""}`}>
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
              );

              return stat.link ? (
                <Link key={stat.title} to={stat.link}>
                  {cardContent}
                </Link>
              ) : (
                <div key={stat.title}>{cardContent}</div>
              );
            })}
          </div>

          {/* Pending Trailer Checkouts */}
          {pendingCheckouts.length > 0 && (
            <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  Pending Trailer Checkouts
                </CardTitle>
                <CardDescription>Complete the checkout process for these trailers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingCheckouts.map((checkout) => (
                    <div key={checkout.id} className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg border">
                      <div>
                        <p className="font-medium">Trailer #{checkout.trailer_number}</p>
                        <p className="text-sm text-muted-foreground">{checkout.trailer_type} • Inspected {format(new Date(checkout.inspection_date), "MMM d, yyyy")}</p>
                      </div>
                      <Link to={`/dashboard/customer/checkout/${checkout.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Complete Checkout</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lease to Own Quick Link */}
          {hasLeaseToOwn && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Lease-to-Own Agreement Active</p>
                      <p className="text-sm text-muted-foreground">View your payment schedule, remaining balance, and agreement documents</p>
                    </div>
                  </div>
                  <Link to="/dashboard/customer/lease-to-own">
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

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
                  {pendingTolls.map((toll) => {
                    const authorityInfo = findTollAuthority(toll.toll_authority);
                    return (
                      <div key={toll.id} className="py-4 px-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between mb-3">
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
                        {/* Toll Authority Contact Info */}
                        {authorityInfo && (
                          <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700 flex flex-wrap items-center gap-4 text-sm">
                            <span className="font-medium text-foreground">Pay here:</span>
                            <a 
                              href={`tel:${authorityInfo.phone}`}
                              className="inline-flex items-center gap-1.5 text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {authorityInfo.phone}
                            </a>
                            <a 
                              href={authorityInfo.paymentUrl || authorityInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {authorityInfo.paymentUrl ? "Pay Online" : "Website"}
                            </a>
                          </div>
                        )}
                        {!authorityInfo && toll.toll_authority && (
                          <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700 text-sm text-muted-foreground">
                            Contact <span className="font-medium">{toll.toll_authority}</span> directly to pay this toll.
                          </div>
                        )}
                        {/* Reminder History */}
                        {(toll.reminder_count && toll.reminder_count > 0) && (
                          <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>
                              {toll.reminder_count} reminder{toll.reminder_count > 1 ? 's' : ''} sent
                              {toll.last_reminder_sent_at && (
                                <> • Last sent {format(new Date(toll.last_reminder_sent_at), "MMM d, yyyy 'at' h:mm a")}</>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

