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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Copy,
  Building2,
  Plus,
  Handshake,
  TrendingUp,
  ChevronDown,
  ChevronRight,
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

interface Partner {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface PartnerCommission {
  id: string;
  partner_id: string;
  subscription_id: string;
  billing_history_id: string | null;
  commission_amount: number;
  commission_rate: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  customer_subscriptions?: {
    customers?: {
      full_name: string;
      company_name: string | null;
    };
  };
  subscription_items?: Array<{
    monthly_rate: number;
    status: string;
  }>;
}

const defaultPartnerForm = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  referral_code: "",
  commission_rate: 15,
  notes: "",
};

export default function Referrals() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  // Partner state
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState(defaultPartnerForm);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerDetailOpen, setPartnerDetailOpen] = useState(false);
  const [logCommissionOpen, setLogCommissionOpen] = useState(false);
  const [logCommissionForm, setLogCommissionForm] = useState({
    subscription_id: "",
    commission_amount: "",
    billing_period_start: "",
    billing_period_end: "",
    notes: "",
  });

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

  // Fetch partners
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  // Fetch partner commissions
  const { data: partnerCommissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ["partner-commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_commissions")
        .select(`
          *,
          customer_subscriptions(
            customers(full_name, company_name)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PartnerCommission[];
    }
  });

  // Fetch ALL active subscriptions (attributed and unattributed) for the commission picker
  const { data: partnerSubscriptions } = useQuery({
    queryKey: ["partner-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          id,
          partner_id,
          status,
          subscription_type,
          customers(full_name, company_name),
          subscription_items(monthly_rate, status)
        `)
        .in("status", ["active", "trialing", "past_due", "pending"]);

      if (error) throw error;
      return data;
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

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (form: typeof partnerForm) => {
      const { error } = await supabase
        .from("partners")
        .insert({
          name: form.name,
          company_name: form.company_name || null,
          email: form.email || null,
          phone: form.phone || null,
          referral_code: form.referral_code.toUpperCase(),
          commission_rate: form.commission_rate / 100,
          notes: form.notes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner created successfully");
      setCreatePartnerOpen(false);
      setPartnerForm(defaultPartnerForm);
    },
    onError: (error) => {
      toast.error("Failed to create partner: " + error.message);
    }
  });

  // Toggle partner active status
  const togglePartnerMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("partners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner status updated");
    },
    onError: (error) => {
      toast.error("Failed to update partner: " + error.message);
    }
  });

  // Log commission mutation
  const logCommissionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPartner) return;
      const { error } = await supabase
        .from("partner_commissions")
        .insert({
          partner_id: selectedPartner.id,
          subscription_id: logCommissionForm.subscription_id,
          commission_amount: parseFloat(logCommissionForm.commission_amount),
          commission_rate: selectedPartner.commission_rate,
          billing_period_start: logCommissionForm.billing_period_start || null,
          billing_period_end: logCommissionForm.billing_period_end || null,
          notes: logCommissionForm.notes || null,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-commissions"] });
      toast.success("Commission logged successfully");
      setLogCommissionOpen(false);
      setLogCommissionForm({ subscription_id: "", commission_amount: "", billing_period_start: "", billing_period_end: "", notes: "" });
    },
    onError: (error) => {
      toast.error("Failed to log commission: " + error.message);
    }
  });

  // Mark commission as paid
  const markCommissionPaidMutation = useMutation({
    mutationFn: async (commissionId: string) => {
      const { error } = await supabase
        .from("partner_commissions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", commissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-commissions"] });
      toast.success("Commission marked as paid");
    },
    onError: (error) => {
      toast.error("Failed to update commission: " + error.message);
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

  // Partner stats
  const totalOwedToPartners = partnerCommissions?.filter(c => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
  const totalPaidToPartners = partnerCommissions?.filter(c => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

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

  const getCommissionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "voided":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300"><XCircle className="h-3 w-3 mr-1" />Voided</Badge>;
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

  const openPartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner);
    setPartnerDetailOpen(true);
  };

  const selectedPartnerCommissions = partnerCommissions?.filter(c => c.partner_id === selectedPartner?.id) || [];
  const selectedPartnerSubscriptions = partnerSubscriptions?.filter(s => s.partner_id === selectedPartner?.id) || [];
  const partnerOwed = selectedPartnerCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const partnerPaid = selectedPartnerCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + Number(c.commission_amount), 0);

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
                <p className="text-muted-foreground">Manage referral codes, track referrals, and partner commissions</p>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Partner Commissions Owed</CardTitle>
                <Handshake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">${totalOwedToPartners.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">${totalPaidToPartners.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid to date</p>
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
              <TabsTrigger value="partners">
                <Handshake className="h-4 w-4 mr-1" />
                Partners
                {partners && partners.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{partners.filter(p => p.is_active).length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ===== REFERRALS TAB ===== */}
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

            {/* ===== REFERRAL CODES TAB ===== */}
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

            {/* ===== PARTNERS TAB ===== */}
            <TabsContent value="partners" className="space-y-6">
              {/* Partner summary cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partners?.filter(p => p.is_active).length || 0}</div>
                    <p className="text-xs text-muted-foreground">{partners?.length || 0} total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Commissions Owed</CardTitle>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">${totalOwedToPartners.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">pending payment</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid Out</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalPaidToPartners.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">paid to partners</p>
                  </CardContent>
                </Card>
              </div>

              {/* Partners table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Business Partners
                  </CardTitle>
                  <Button onClick={() => setCreatePartnerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {partnersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : partners && partners.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partner</TableHead>
                          <TableHead>Referral Code</TableHead>
                          <TableHead>Commission Rate</TableHead>
                          <TableHead>Customers</TableHead>
                          <TableHead>Owed</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners.map((partner) => {
                          const partnerSubs = partnerSubscriptions?.filter(s => s.partner_id === partner.id) || [];
                          const activeCustomers = partnerSubs.filter(s => s.status === "active").length;
                          const owed = partnerCommissions?.filter(c => c.partner_id === partner.id && c.status === "pending")
                            .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
                          return (
                            <TableRow key={partner.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openPartnerDetail(partner)}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{partner.name}</p>
                                  {partner.company_name && (
                                    <p className="text-sm text-muted-foreground">{partner.company_name}</p>
                                  )}
                                  {partner.email && (
                                    <p className="text-xs text-muted-foreground">{partner.email}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{partner.referral_code}</code>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyCode(partner.referral_code); }}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {(partner.commission_rate * 100).toFixed(0)}%/mo
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{activeCustomers}</span>
                                <span className="text-muted-foreground text-sm"> active</span>
                              </TableCell>
                              <TableCell>
                                {owed > 0 ? (
                                  <span className="font-medium text-amber-600">${owed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {partner.is_active ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Button size="sm" variant="outline" onClick={() => openPartnerDetail(partner)}>
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => togglePartnerMutation.mutate({ id: partner.id, is_active: !partner.is_active })}
                                  >
                                    {partner.is_active ? "Deactivate" : "Activate"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Handshake className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No partners yet</p>
                      <p className="text-sm mt-1">Add your first business partner to start tracking referral commissions.</p>
                      <Button className="mt-4" onClick={() => setCreatePartnerOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Partner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All commissions table */}
              {(partnerCommissions?.length || 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">All Commission Records</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {commissionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Partner</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partnerCommissions?.map((commission) => {
                            const partner = partners?.find(p => p.id === commission.partner_id);
                            return (
                              <TableRow key={commission.id}>
                                <TableCell>
                                  <p className="font-medium">{commission.customer_subscriptions?.customers?.full_name || "—"}</p>
                                  {commission.customer_subscriptions?.customers?.company_name && (
                                    <p className="text-sm text-muted-foreground">{commission.customer_subscriptions.customers.company_name}</p>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{partner?.name || "—"}</span>
                                </TableCell>
                                <TableCell className="font-medium">
                                  ${Number(commission.commission_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{(commission.commission_rate * 100).toFixed(0)}%</Badge>
                                </TableCell>
                                <TableCell>
                                  {commission.billing_period_start && commission.billing_period_end ? (
                                    <div className="text-sm">
                                      <p>{format(new Date(commission.billing_period_start), "MMM d")}</p>
                                      <p className="text-muted-foreground">to {format(new Date(commission.billing_period_end), "MMM d, yyyy")}</p>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                                <TableCell>
                                  {commission.status === "pending" && (
                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => markCommissionPaidMutation.mutate(commission.id)}>
                                      Mark Paid
                                    </Button>
                                  )}
                                  {commission.paid_at && (
                                    <p className="text-xs text-muted-foreground">{format(new Date(commission.paid_at), "MMM d, yyyy")}</p>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Dialog — approve/reject referral */}
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

          {/* Create Partner Dialog */}
          <Dialog open={createPartnerOpen} onOpenChange={setCreatePartnerOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Business Partner</DialogTitle>
                <DialogDescription>
                  Create a partner profile and assign them a unique referral code for tracking commissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-name">Contact Name *</Label>
                    <Input
                      id="partner-name"
                      placeholder="e.g. John Smith"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-company">Company Name</Label>
                    <Input
                      id="partner-company"
                      placeholder="e.g. Big Bird Trans"
                      value={partnerForm.company_name}
                      onChange={(e) => setPartnerForm(f => ({ ...f, company_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-email">Email</Label>
                    <Input
                      id="partner-email"
                      type="email"
                      placeholder="partner@example.com"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-phone">Phone</Label>
                    <Input
                      id="partner-phone"
                      placeholder="(555) 000-0000"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-code">Referral Code *</Label>
                    <Input
                      id="partner-code"
                      placeholder="e.g. BIGBIRD-2025"
                      value={partnerForm.referral_code}
                      onChange={(e) => setPartnerForm(f => ({ ...f, referral_code: e.target.value.toUpperCase() }))}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Uppercase letters and numbers only</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-rate">Commission Rate (%)</Label>
                    <Input
                      id="partner-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={partnerForm.commission_rate}
                      onChange={(e) => setPartnerForm(f => ({ ...f, commission_rate: parseFloat(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-muted-foreground">% of net monthly payment</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="partner-notes">Notes</Label>
                  <Textarea
                    id="partner-notes"
                    placeholder="Contract details, terms, etc."
                    value={partnerForm.notes}
                    onChange={(e) => setPartnerForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreatePartnerOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => createPartnerMutation.mutate(partnerForm)}
                  disabled={!partnerForm.name || !partnerForm.referral_code || createPartnerMutation.isPending}
                >
                  {createPartnerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Partner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Partner Detail Dialog */}
          <Dialog open={partnerDetailOpen} onOpenChange={setPartnerDetailOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedPartner?.name}
                  {selectedPartner?.company_name && (
                    <span className="text-muted-foreground font-normal">— {selectedPartner.company_name}</span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Commission tracking for partner referrals
                </DialogDescription>
              </DialogHeader>

              {selectedPartner && (
                <div className="space-y-6">
                  {/* Partner info */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg text-sm">
                    <div>
                      <p className="text-muted-foreground">Referral Code</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono font-medium">{selectedPartner.referral_code}</code>
                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => copyCode(selectedPartner.referral_code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission Rate</p>
                      <p className="font-medium mt-1">{(selectedPartner.commission_rate * 100).toFixed(0)}% per month</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="mt-1">{selectedPartner.email || selectedPartner.phone || "—"}</p>
                    </div>
                  </div>

                  {/* Financials summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Active Customers</p>
                        <p className="text-2xl font-bold mt-1">{selectedPartnerSubscriptions.filter(s => s.status === "active").length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Commissions Owed</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">${partnerOwed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">${partnerPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Attributed subscriptions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Attributed Customers</h3>
                    </div>
                    {selectedPartnerSubscriptions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Monthly Rate</TableHead>
                            <TableHead>Commission ({(selectedPartner.commission_rate * 100).toFixed(0)}%)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPartnerSubscriptions.map((sub: any) => {
                            const monthlyRate = sub.subscription_items?.filter((i: any) => i.status === "active")
                              .reduce((sum: number, i: any) => sum + Number(i.monthly_rate), 0) || 0;
                            const commission = monthlyRate * selectedPartner.commission_rate;
                            return (
                              <TableRow key={sub.id}>
                                <TableCell>
                                  <p className="font-medium">{sub.customers?.full_name || "—"}</p>
                                  {sub.customers?.company_name && (
                                    <p className="text-sm text-muted-foreground">{sub.customers.company_name}</p>
                                  )}
                                </TableCell>
                                <TableCell>${monthlyRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</TableCell>
                                <TableCell className="font-medium text-amber-700">${commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</TableCell>
                                <TableCell>
                                  <Badge variant={sub.status === "active" ? "default" : "outline"} className="capitalize">{sub.status}</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">No customers attributed to this partner yet.</p>
                    )}
                  </div>

                  {/* Commission records */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Commission Records</h3>
                      <Button size="sm" onClick={() => { setLogCommissionOpen(true); }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Log Commission
                      </Button>
                    </div>
                    {selectedPartnerCommissions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Amount</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPartnerCommissions.map((commission) => (
                            <TableRow key={commission.id}>
                              <TableCell className="font-medium">
                                ${Number(commission.commission_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                {commission.billing_period_start && commission.billing_period_end ? (
                                  <span className="text-sm">
                                    {format(new Date(commission.billing_period_start), "MMM d")} – {format(new Date(commission.billing_period_end), "MMM d, yyyy")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                              <TableCell>
                                {commission.status === "pending" && (
                                  <Button size="sm" variant="outline" className="text-green-600" onClick={() => markCommissionPaidMutation.mutate(commission.id)}>
                                    Mark Paid
                                  </Button>
                                )}
                                {commission.paid_at && (
                                  <p className="text-xs text-muted-foreground">Paid {format(new Date(commission.paid_at), "MMM d, yyyy")}</p>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">No commission records yet.</p>
                    )}
                  </div>

                  {selectedPartner.notes && (
                    <div className="p-3 bg-muted/40 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{selectedPartner.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Log Commission Dialog */}
          <Dialog open={logCommissionOpen} onOpenChange={setLogCommissionOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Commission</DialogTitle>
                <DialogDescription>
                  Record a commission owed to {selectedPartner?.name} for a billing period.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Subscription ID</Label>
                  <Input
                    placeholder="Paste subscription UUID"
                    value={logCommissionForm.subscription_id}
                    onChange={(e) => setLogCommissionForm(f => ({ ...f, subscription_id: e.target.value }))}
                  />
                  {selectedPartnerSubscriptions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Or select an attributed customer:</p>
                      {selectedPartnerSubscriptions.map((sub: any) => (
                        <button
                          key={sub.id}
                          className="w-full text-left text-sm px-3 py-2 rounded border hover:bg-muted transition-colors"
                          onClick={() => setLogCommissionForm(f => ({ ...f, subscription_id: sub.id }))}
                        >
                          {sub.customers?.full_name || "Unknown"} — {sub.id.slice(0, 8)}...
                          {logCommissionForm.subscription_id === sub.id && <CheckCircle className="h-3 w-3 inline ml-2 text-green-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Commission Amount ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={logCommissionForm.commission_amount}
                    onChange={(e) => setLogCommissionForm(f => ({ ...f, commission_amount: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Period Start</Label>
                    <Input
                      type="date"
                      value={logCommissionForm.billing_period_start}
                      onChange={(e) => setLogCommissionForm(f => ({ ...f, billing_period_start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Period End</Label>
                    <Input
                      type="date"
                      value={logCommissionForm.billing_period_end}
                      onChange={(e) => setLogCommissionForm(f => ({ ...f, billing_period_end: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Any notes about this commission..."
                    value={logCommissionForm.notes}
                    onChange={(e) => setLogCommissionForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogCommissionOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => logCommissionMutation.mutate()}
                  disabled={!logCommissionForm.subscription_id || !logCommissionForm.commission_amount || logCommissionMutation.isPending}
                >
                  {logCommissionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Log Commission
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </SidebarProvider>
  );
}
