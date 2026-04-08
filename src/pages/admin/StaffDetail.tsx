import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Loader2, Star, DollarSign, Users, TrendingUp, FileText, Sparkles, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ALL_SECTION_KEYS, SECTION_LABELS, SectionKey } from "@/hooks/useStaffPermissions";

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewQuarter, setReviewQuarter] = useState(() => {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    return `${now.getFullYear()}-Q${q}`;
  });
  const [reviewRating, setReviewRating] = useState("3");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewGoals, setReviewGoals] = useState("");
  const [reviewBonus, setReviewBonus] = useState("0");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch staff profile + user profile
  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staff-detail", id],
    queryFn: async () => {
      const { data: staffProfile, error } = await supabase
        .from("staff_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", staffProfile.user_id)
        .single();

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", staffProfile.user_id)
        .single();

      return { staffProfile, profile, role: role?.role };
    },
    enabled: !!id,
  });

  // Fetch leads (applications with this staff's referral)
  const { data: leads } = useQuery({
    queryKey: ["staff-leads", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id, status, created_at, phone_number, customer_id, profiles!customer_applications_user_id_fkey(email, first_name, last_name)")
        .eq("staff_referral_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch subscriptions from referred customers
  const { data: subscriptions } = useQuery({
    queryKey: ["staff-subscriptions", id],
    queryFn: async () => {
      if (!leads || leads.length === 0) return [];
      const customerIds = leads
        .filter(l => l.customer_id)
        .map(l => l.customer_id as string);
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

  // Fetch performance reviews
  const { data: reviews } = useQuery({
    queryKey: ["staff-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_reviews")
        .select("*, profiles!performance_reviews_reviewer_id_fkey(first_name, last_name)")
        .eq("staff_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: {
      staff_id: string;
      review_quarter: string;
      performance_rating: number;
      notes: string;
      goals: string;
      bonus_amount: number;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("performance_reviews")
        .insert({
          ...data,
          reviewer_id: session.session?.user.id,
          status: "submitted",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review Created", description: "Performance review has been saved." });
      setIsReviewOpen(false);
      setReviewNotes("");
      setReviewGoals("");
      setReviewBonus("0");
      queryClient.invalidateQueries({ queryKey: ["staff-reviews", id] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // AI Review
  const handleAiReview = async () => {
    if (!staffData) return;
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-staff-performance", {
        body: {
          staffProfileId: id,
          userId: staffData.staffProfile.user_id,
          quarter: reviewQuarter,
        },
      });
      if (error) throw error;
      if (data?.summary) {
        setReviewNotes(prev => prev ? `${prev}\n\n--- AI Summary ---\n${data.summary}` : `--- AI Summary ---\n${data.summary}`);
        toast({ title: "AI Review Generated", description: "Summary has been added to your notes." });
      }
    } catch (error: any) {
      toast({ title: "AI Review Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (staffData?.staffProfile.referral_code) {
      navigator.clipboard.writeText(staffData.staffProfile.referral_code);
      toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    }
  };

  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter(l => l.status === "approved" || l.customer_id).length || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const commissionRate = staffData?.staffProfile.commission_rate || 0.15;

  // Calculate total bonus from billing history of referred subscriptions
  const totalBonusEarned = (reviews || []).reduce((sum, r) => sum + Number(r.bonus_amount || 0), 0);

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

  if (!staffData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <p className="text-muted-foreground">Staff member not found.</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const displayName = [staffData.profile?.first_name, staffData.profile?.last_name].filter(Boolean).join(" ") || staffData.profile?.email || "Unknown";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin/staff")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">{staffData.staffProfile.position} • {staffData.profile?.email}</p>
            </div>
            <Badge variant={staffData.staffProfile.is_active ? "default" : "secondary"}>
              {staffData.staffProfile.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bonus Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">${totalBonusEarned.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code & Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Code</CardTitle>
                <CardDescription>This code tracks leads generated by this salesman</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono bg-muted px-4 py-2 rounded-md">
                    {staffData.staffProfile.referral_code || "Not assigned"}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Commission rate: {(commissionRate * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium capitalize">{staffData.staffProfile.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="outline" className="capitalize">{staffData.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hire Date</span>
                  <span>{staffData.staffProfile.hire_date ? new Date(staffData.staffProfile.hire_date).toLocaleDateString() : "Not set"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Panel — only show for non-admin roles */}
          {staffData.role !== "admin" && (
            <StaffPermissionsPanel userId={staffData.staffProfile.user_id} />
          )}

          {/* Leads Table */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leads Generated</CardTitle>
                <CardDescription>Applications that used this salesman's referral code</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!leads || leads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No leads generated yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => {
                      const profile = lead.profiles as any;
                      const name = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : lead.phone_number;
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{name || "—"}</TableCell>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Quarterly performance evaluations</CardDescription>
              </div>
              <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogTrigger asChild>
                  <Button><Star className="h-4 w-4 mr-2" /> New Review</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Performance Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quarter</Label>
                        <Input value={reviewQuarter} onChange={(e) => setReviewQuarter(e.target.value)} placeholder="2026-Q1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rating (1-5)</Label>
                        <Select value={reviewRating} onValueChange={setReviewRating}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={String(n)}>{n} — {["Poor", "Below Average", "Average", "Good", "Excellent"][n - 1]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Notes</Label>
                        <Button variant="outline" size="sm" onClick={handleAiReview} disabled={isAiLoading}>
                          {isAiLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          AI Review
                        </Button>
                      </div>
                      <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={4} placeholder="Performance observations..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Goals for Next Quarter</Label>
                      <Textarea value={reviewGoals} onChange={(e) => setReviewGoals(e.target.value)} rows={3} placeholder="Goals and targets..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Bonus Amount ($)</Label>
                      <Input type="number" value={reviewBonus} onChange={(e) => setReviewBonus(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
                    <Button
                      onClick={() => createReviewMutation.mutate({
                        staff_id: id!,
                        review_quarter: reviewQuarter,
                        performance_rating: Number(reviewRating),
                        notes: reviewNotes,
                        goals: reviewGoals,
                        bonus_amount: Number(reviewBonus),
                      })}
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => {
                      const reviewer = review.profiles as any;
                      return (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.review_quarter}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < (review.performance_rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>${Number(review.bonus_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={review.status === "submitted" ? "default" : "secondary"}>{review.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {reviewer ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
