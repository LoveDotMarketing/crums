import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Loader2, Star, DollarSign, Users, TrendingUp, FileText } from "lucide-react";

export default function EmployeeDashboard() {
  const { user, effectiveUserId } = useAuth();
  const { toast } = useToast();

  // Fetch my staff profile
  const { data: staffProfile, isLoading } = useQuery({
    queryKey: ["my-staff-profile", effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("*")
        .eq("user_id", effectiveUserId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  // Fetch my leads
  const { data: leads } = useQuery({
    queryKey: ["my-leads", staffProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id, status, created_at, phone_number, customer_id, profiles!customer_applications_user_id_fkey(email, first_name, last_name)")
        .eq("staff_referral_id", staffProfile!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!staffProfile?.id,
  });

  // Fetch subscriptions from my referred customers
  const { data: subscriptions } = useQuery({
    queryKey: ["my-subscriptions", staffProfile?.id],
    queryFn: async () => {
      if (!leads || leads.length === 0) return [];
      const customerIds = leads.filter(l => l.customer_id).map(l => l.customer_id as string);
      if (customerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select("id, status, billing_cycle, contract_start_date, customer_id")
        .in("customer_id", customerIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!leads,
  });

  // Fetch my reviews
  const { data: reviews } = useQuery({
    queryKey: ["my-reviews", staffProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_reviews")
        .select("*")
        .eq("staff_id", staffProfile!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!staffProfile?.id,
  });

  const handleCopyCode = () => {
    if (staffProfile?.referral_code) {
      navigator.clipboard.writeText(staffProfile.referral_code);
      toast({ title: "Copied!", description: "Your referral code has been copied." });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!staffProfile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No Staff Profile Found</h2>
              <p className="text-muted-foreground">Contact an administrator to set up your staff profile.</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter(l => l.status === "approved" || l.customer_id).length || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const totalBonusEarned = (reviews || []).reduce((sum, r) => sum + Number(r.bonus_amount || 0), 0);

  // Current quarter
  const now = new Date();
  const currentQ = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const currentQuarterBonus = (reviews || [])
    .filter(r => r.review_quarter === currentQ)
    .reduce((sum, r) => sum + Number(r.bonus_amount || 0), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">Your sales performance and referral tracking</p>
            </div>
          </div>

          {/* Referral Code */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>Share this code with potential customers to track your leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-mono bg-muted px-6 py-3 rounded-md tracking-wider">
                  {staffProfile.referral_code}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Commission rate: {((staffProfile.commission_rate || 0.15) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{totalLeads}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Converted Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">{convertedLeads}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Leases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{activeSubscriptions}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bonus This Quarter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">${currentQuarterBonus.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All-time: ${totalBonusEarned.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Leads Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Leads</CardTitle>
              <CardDescription>Customers who signed up using your referral code</CardDescription>
            </CardHeader>
            <CardContent>
              {!leads || leads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No leads yet. Share your referral code to start generating leads!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => {
                      const profile = lead.profiles as any;
                      const name = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : "—";
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>{profile?.email || lead.phone_number}</TableCell>
                          <TableCell>
                            <Badge variant={lead.status === "approved" ? "default" : lead.status === "pending" ? "secondary" : "outline"}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Performance Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Your quarterly evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No reviews available yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{review.review_quarter}</CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < (review.performance_rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                            {Number(review.bonus_amount || 0) > 0 && (
                              <Badge variant="outline">${Number(review.bonus_amount).toLocaleString()} bonus</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {review.notes && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="text-sm whitespace-pre-wrap">{review.notes}</p>
                          </div>
                        )}
                        {review.goals && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Goals</p>
                            <p className="text-sm whitespace-pre-wrap">{review.goals}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
