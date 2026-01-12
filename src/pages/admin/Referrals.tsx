import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Gift, 
  Users, 
  DollarSign, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2,
  Copy
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface ReferralCode {
  id: string;
  customer_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  customer?: {
    full_name: string;
    email: string;
  };
}

interface Referral {
  id: string;
  referrer_code_id: string;
  referred_customer_id: string | null;
  referred_email: string;
  status: string;
  credit_amount: number;
  approved_at: string | null;
  credited_at: string | null;
  notes: string | null;
  created_at: string;
  referral_code?: {
    code: string;
    customer?: {
      full_name: string;
      email: string;
    };
  };
  referred_customer?: {
    full_name: string;
  };
}

export default function Referrals() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  // Fetch referral codes with customer info
  const { data: referralCodes, isLoading: codesLoading } = useQuery({
    queryKey: ["referral-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes")
        .select(`
          *,
          customer:customers(full_name, email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ReferralCode[];
    }
  });

  // Fetch referrals with related data
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referral_code:referral_codes(
            code,
            customer:customers(full_name, email)
          ),
          referred_customer:customers(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Referral[];
    }
  });

  // Update referral status mutation
  const updateReferralMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: Record<string, unknown> = {
        status,
        notes,
        updated_at: new Date().toISOString()
      };
      
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      } else if (status === "credited") {
        updateData.credited_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("referrals")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Referral updated successfully");
      setActionDialogOpen(false);
      setSelectedReferral(null);
      setActionNotes("");
    },
    onError: (error) => {
      toast.error("Failed to update referral: " + error.message);
    }
  });

  // Toggle referral code active status
  const toggleCodeMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("referral_codes")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
      toast.success("Referral code updated");
    },
    onError: (error) => {
      toast.error("Failed to update code: " + error.message);
    }
  });

  const filteredReferrals = referrals?.filter(referral => {
    const matchesSearch = 
      referral.referred_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referral_code?.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referral_code?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCodes: referralCodes?.length || 0,
    activeCodes: referralCodes?.filter(c => c.is_active).length || 0,
    totalReferrals: referrals?.length || 0,
    pendingReferrals: referrals?.filter(r => r.status === "pending").length || 0,
    approvedReferrals: referrals?.filter(r => r.status === "approved" || r.status === "credited").length || 0,
    totalCredits: referrals?.filter(r => r.status === "credited").reduce((sum, r) => sum + (r.credit_amount || 250), 0) || 0
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "credited":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><DollarSign className="h-3 w-3 mr-1" />Credited</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = (referral: Referral, type: "approve" | "reject") => {
    setSelectedReferral(referral);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReferral || !actionType) return;
    
    updateReferralMutation.mutate({
      id: selectedReferral.id,
      status: actionType === "approve" ? "approved" : "rejected",
      notes: actionNotes
    });
  };

  const markAsCredited = (referral: Referral) => {
    updateReferralMutation.mutate({
      id: referral.id,
      status: "credited"
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <SidebarProvider>
      <SEO title="Referral Management" description="Manage customer referral codes and track referrals" noindex />
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Referral Management</h1>
                <p className="text-muted-foreground">Manage referral codes and track referrals</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Codes</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCodes}</div>
                <p className="text-xs text-muted-foreground">{stats.activeCodes} active</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingReferrals} pending review</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'approved' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedReferrals}</div>
                <p className="text-xs text-muted-foreground">successful referrals</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'credited' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter('credited')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Credits Issued</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalCredits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">total credited</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="referrals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="codes">Referral Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, referrer name, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "approved", "credited", "rejected"].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Referrals Table */}
              <Card>
                <CardContent className="p-0">
                  {referralsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredReferrals && filteredReferrals.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Referred Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Credit</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{referral.referral_code?.customer?.full_name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{referral.referral_code?.customer?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded text-sm">{referral.referral_code?.code}</code>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{referral.referred_email}</p>
                                {referral.referred_customer && (
                                  <p className="text-sm text-muted-foreground">{referral.referred_customer.full_name}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                            <TableCell>${referral.credit_amount || 250}</TableCell>
                            <TableCell>{format(new Date(referral.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {referral.status === "pending" && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(referral, "approve")}>
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(referral, "reject")}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {referral.status === "approved" && (
                                  <Button size="sm" variant="outline" onClick={() => markAsCredited(referral)}>
                                    Mark Credited
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No referrals found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="codes" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  {codesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : referralCodes && referralCodes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referralCodes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{code.customer?.full_name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{code.customer?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCode(code.code)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {code.is_active ? (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell>{format(new Date(code.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleCodeMutation.mutate({ id: code.id, is_active: !code.is_active })}
                              >
                                {code.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No referral codes found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Dialog */}
          <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === "approve" ? "Approve Referral" : "Reject Referral"}
                </DialogTitle>
                <DialogDescription>
                  {actionType === "approve" 
                    ? "Confirm that this referral is valid and the referred customer has signed a lease."
                    : "Reject this referral. Please provide a reason."
                  }
                </DialogDescription>
              </DialogHeader>
              {selectedReferral && (
                <div className="py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Referrer</p>
                      <p className="font-medium">{selectedReferral.referral_code?.customer?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Referred Email</p>
                      <p className="font-medium">{selectedReferral.referred_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Amount</p>
                      <p className="font-medium">${selectedReferral.credit_amount || 250}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{format(new Date(selectedReferral.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder={actionType === "reject" ? "Reason for rejection..." : "Additional notes..."}
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAction}
                  className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                  disabled={updateReferralMutation.isPending}
                >
                  {updateReferralMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {actionType === "approve" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}