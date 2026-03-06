import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerFormDialog } from "@/components/admin/CustomerFormDialog";
import { CustomerStatementsPanel } from "@/components/admin/CustomerStatementsPanel";
import { ChargeCustomerDialog } from "@/components/admin/ChargeCustomerDialog";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  CreditCard,
  FileText,
  FolderOpen,
  Truck,
  Loader2,
  Download,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Eye,
  Plus,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AdminAchSetupDialog } from "@/components/admin/AdminAchSetupDialog";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const statusColor: Record<string, string> = {
  paid: "text-green-600",
  pending: "text-yellow-600",
  failed: "text-destructive",
  active: "text-green-600",
  cancelled: "text-muted-foreground",
  archived: "text-muted-foreground",
};

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startImpersonation } = useAuth();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [statementsOpen, setStatementsOpen] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadingStatId, setDownloadingStatId] = useState<string | null>(null);

  // ── Core customer record ──────────────────────────────────────────────────
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["admin-customer-detail", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  // ── Profile (linked auth user) ────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ["admin-customer-profile", customer?.email],
    queryFn: async () => {
      if (!customer?.email) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", customer.email)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!customer?.email,
  });

  // ── Application ───────────────────────────────────────────────────────────
  const { data: application } = useQuery({
    queryKey: ["admin-customer-application", profile?.id, customerId],
    queryFn: async () => {
      // Try profile-based lookup first
      if (profile?.id) {
        const { data, error } = await supabase
          .from("customer_applications")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (!error && data) return data;
      }
      // Fallback: lookup by customer_id column
      if (customerId) {
        const { data, error } = await supabase
          .from("customer_applications")
          .select("*")
          .eq("customer_id", customerId)
          .maybeSingle();
        if (!error && data) return data;
      }
      return null;
    },
    enabled: !!profile?.id || !!customerId,
  });

  // ── Subscriptions (all for this customer) ─────────────────────────────────
  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-customer-subscriptions", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select("*")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data || [];
    },
    enabled: !!customerId,
  });

  const subscriptionIds = subscriptions.map((s) => s.id);

  // ── Subscription items + trailers ─────────────────────────────────────────
  const { data: subscriptionItems = [] } = useQuery({
    queryKey: ["admin-customer-sub-items", subscriptionIds],
    queryFn: async () => {
      if (subscriptionIds.length === 0) return [];
      const { data, error } = await supabase
        .from("subscription_items")
        .select(`*, trailers:trailer_id (trailer_number, type, vin, status)`)
        .in("subscription_id", subscriptionIds);
      if (error) throw error;
      return data || [];
    },
    enabled: subscriptionIds.length > 0,
  });

  // ── All assigned trailers (via trailers.customer_id) ──────────────────────
  const { data: assignedTrailers = [] } = useQuery({
    queryKey: ["admin-customer-assigned-trailers", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, type, vin, status, make, model, year")
        .eq("customer_id", customerId!)
        .neq("status", "archived")
        .order("trailer_number", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });

  // ── Billing history ───────────────────────────────────────────────────────
  const { data: billingHistory = [] } = useQuery({
    queryKey: ["admin-customer-billing", subscriptionIds],
    queryFn: async () => {
      if (subscriptionIds.length === 0) return [];
      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .in("subscription_id", subscriptionIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: subscriptionIds.length > 0,
  });

  // ── Statements ────────────────────────────────────────────────────────────
  const { data: statements = [], isLoading: statementsLoading } = useQuery({
    queryKey: ["customer-statements", customerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("customer_statements")
        .select("*")
        .eq("customer_id", customerId!)
        .order("statement_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });

  // ── Tolls ─────────────────────────────────────────────────────────────────
  const { data: tolls = [] } = useQuery({
    queryKey: ["admin-customer-tolls", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tolls")
        .select("*")
        .eq("customer_id", customerId!)
        .order("toll_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });

  // ── Documents helper ──────────────────────────────────────────────────────
  const docFields = application
    ? [
        { label: "Driver's License (Front)", path: application.drivers_license_url },
        { label: "Driver's License (Back)", path: application.drivers_license_back_url },
        { label: "Insurance Documents", path: application.insurance_docs_url },
        { label: "DOT Number", path: application.dot_number_url },
      ].filter((d) => d.path)
    : [];

  const handleDownloadDoc = async (path: string, label: string) => {
    setDownloadingDocId(path);
    try {
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Error generating download link", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDownloadStatement = async (fileUrl: string, id: string) => {
    setDownloadingStatId(id);
    try {
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(fileUrl, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Error generating download link", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingStatId(null);
    }
  };

  const handleViewAsCustomer = async () => {
    if (!customer?.email || !profile) {
      toast({ title: "No account linked to this customer.", variant: "destructive" });
      return;
    }
    const displayName = profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : customer.full_name;
    startImpersonation({ id: profile.id, email: customer.email, role: "customer", displayName });
  };

  if (customerLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!customer) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Customer not found.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard/admin/customers")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const outstandingTolls = tolls.filter((t) => t.status === "pending").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          {/* ── Header ── */}
          <header className="h-16 border-b border-border flex items-center px-6 bg-card gap-4">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/admin/customers")}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Customers
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold text-foreground truncate flex-1">
              {customer.full_name}
            </h1>
            <div className="flex items-center gap-2">
              {profile && (
                <Button variant="outline" size="sm" onClick={handleViewAsCustomer}>
                  <Eye className="h-4 w-4 mr-2" />
                  View As Customer
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {subscriptions.some((s) => s.stripe_customer_id) && (
                <ChargeCustomerDialog
                  customerId={customerId!}
                  customerName={customer.full_name}
                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-customer-billing"] })}
                />
              )}
              <Button size="sm" onClick={() => setStatementsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Statement
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* ── Summary cards ── */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Account #</p>
                  <p className="font-mono font-semibold">{customer.account_number}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={customer.status === "active" ? "default" : "secondary"} className="capitalize">
                    {customer.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Trailers</p>
                  <p className="font-semibold">{assignedTrailers.length || subscriptionItems.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Outstanding Tolls</p>
                  <p className={`font-semibold ${outstandingTolls > 0 ? "text-destructive" : ""}`}>
                    {formatCurrency(outstandingTolls)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="subscription">
                  <Truck className="h-4 w-4 mr-2" />
                  Subscription
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing History
                </TabsTrigger>
                <TabsTrigger value="statements">
                  <FileText className="h-4 w-4 mr-2" />
                  Statements
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* ══ PROFILE TAB ══════════════════════════════════════════════ */}
              <TabsContent value="profile">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Customer record */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={customer.full_name} />
                      {customer.company_name && (
                        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company" value={customer.company_name} />
                      )}
                      {customer.email && (
                        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={customer.email} />
                      )}
                      {customer.phone && (
                        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={customer.phone} />
                      )}
                      {(customer.city || customer.state || customer.zip) && (
                        <InfoRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Location"
                          value={[customer.city, customer.state, customer.zip].filter(Boolean).join(", ")}
                        />
                      )}
                      {customer.birthday && (
                        <InfoRow
                          icon={<Calendar className="h-4 w-4" />}
                          label="Birthday"
                          value={format(new Date(customer.birthday), "MMMM d, yyyy")}
                        />
                      )}
                      {customer.payment_type && (
                        <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Payment Type" value={customer.payment_type} />
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-muted-foreground w-28">ACH Status</span>
                        {application?.stripe_payment_method_id ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Linked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Not Linked</Badge>
                        )}
                        <AdminAchSetupDialog
                          targetUserId={profile?.id}
                          customerId={customerId}
                          customerEmail={customer.email || undefined}
                          customerName={customer.full_name}
                        />
                      </div>
                      {customer.notes && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{customer.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Application details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Application Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {!application ? (
                        <p className="text-muted-foreground text-sm">No application on file.</p>
                      ) : (
                        <>
                          {application.business_type && (
                            <InfoRow icon={<Building2 className="h-4 w-4" />} label="Business Type" value={application.business_type} />
                          )}
                          {application.company_address && (
                            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Company Address" value={application.company_address} />
                          )}
                          {application.truck_vin && (
                            <InfoRow icon={<Truck className="h-4 w-4" />} label="Truck VIN" value={application.truck_vin} />
                          )}
                          {application.insurance_company && (
                            <InfoRow icon={<FileText className="h-4 w-4" />} label="Insurance Co." value={application.insurance_company} />
                          )}
                          {application.insurance_company_phone && (
                            <InfoRow icon={<Phone className="h-4 w-4" />} label="Insurance Phone" value={application.insurance_company_phone} />
                          )}
                          {application.secondary_contact_name && (
                            <InfoRow icon={<User className="h-4 w-4" />} label="Secondary Contact" value={`${application.secondary_contact_name} (${application.secondary_contact_relationship || "—"}) ${application.secondary_contact_phone || ""}`} />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-28">App Status</span>
                            <Badge variant="secondary" className="text-xs capitalize">{application.status}</Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ══ SUBSCRIPTION TAB ══════════════════════════════════════════ */}
              <TabsContent value="subscription">
                {subscriptions.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                      <Truck className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No subscription on file.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {subscriptions.map((sub) => {
                      const subItems = subscriptionItems.filter((item: any) => item.subscription_id === sub.id);
                      const anchorDay = subItems.length > 0 ? subItems[0].billing_anchor_day : null;
                      return (
                        <div key={sub.id} className="space-y-4">
                          {/* Subscription overview */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                <span>
                                  Subscription Overview
                                  {anchorDay && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                      — Bills on the {anchorDay}{anchorDay === 1 ? "st" : anchorDay === 2 ? "nd" : anchorDay === 3 ? "rd" : "th"}
                                    </span>
                                  )}
                                </span>
                                <Badge
                                  variant={sub.status === "active" ? "default" : "secondary"}
                                  className="capitalize"
                                >
                                  {sub.status}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Type</p>
                                <p className="capitalize">{(sub.subscription_type || "—").replace(/_/g, " ")}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Billing Cycle</p>
                                <p className="capitalize">{sub.billing_cycle}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Next Billing</p>
                                <p>
                                  {sub.next_billing_date
                                    ? format(new Date(sub.next_billing_date), "MMM d, yyyy")
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Contract Start</p>
                                <p>
                                  {sub.contract_start_date
                                    ? format(new Date(sub.contract_start_date), "MMM d, yyyy")
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                                <p>
                                  {sub.end_date
                                    ? format(new Date(sub.end_date), "MMM d, yyyy")
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Deposit</p>
                                <p>
                                  {sub.deposit_amount ? formatCurrency(Number(sub.deposit_amount)) : "—"}
                                  {sub.deposit_paid && (
                                    <span className="ml-2 text-xs text-green-600">✓ Paid</span>
                                  )}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Trailers on this subscription */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Trailers ({subItems.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {subItems.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No trailers assigned.</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Trailer #</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>VIN</TableHead>
                                      <TableHead>Billing Cycle</TableHead>
                                      <TableHead>Anchor Day</TableHead>
                                      <TableHead className="text-right">Rate</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {subItems.map((item: any) => (
                                      <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                          {item.trailers?.trailer_number || "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground capitalize">
                                          {item.trailers?.type || "—"}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                          {item.trailers?.vin || "—"}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                          {item.billing_cycle || sub.billing_cycle}
                                        </TableCell>
                                        <TableCell>
                                          {item.billing_anchor_day ? `${item.billing_anchor_day}${item.billing_anchor_day === 1 ? "st" : item.billing_anchor_day === 2 ? "nd" : item.billing_anchor_day === 3 ? "rd" : "th"}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          {item.monthly_rate ? formatCurrency(Number(item.monthly_rate)) : "—"}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                                            {item.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}

                    {/* All Assigned Trailers (from trailers table) */}
                    {assignedTrailers.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            All Assigned Trailers ({assignedTrailers.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Trailer #</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Make / Model</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>VIN</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assignedTrailers.map((t: any) => (
                                <TableRow key={t.id} className="cursor-pointer" onClick={() => navigate(`/dashboard/admin/fleet/${t.id}`)}>
                                  <TableCell className="font-medium">{t.trailer_number}</TableCell>
                                  <TableCell className="text-muted-foreground capitalize">{t.type}</TableCell>
                                  <TableCell className="text-muted-foreground">{[t.make, t.model].filter(Boolean).join(" ") || "—"}</TableCell>
                                  <TableCell className="text-muted-foreground">{t.year || "—"}</TableCell>
                                  <TableCell className="font-mono text-xs text-muted-foreground">{t.vin || "—"}</TableCell>
                                  <TableCell>
                                    <Badge variant={t.status === "leased" ? "default" : "secondary"} className="text-xs capitalize">
                                      {t.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ══ BILLING HISTORY TAB ═══════════════════════════════════════ */}
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscriptions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No subscription linked — no billing history available.</p>
                    ) : billingHistory.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No billing records yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Net</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingHistory.map((bh: any) => (
                            <TableRow key={bh.id}>
                              <TableCell className="text-sm whitespace-nowrap">
                                {bh.paid_at
                                  ? format(new Date(bh.paid_at), "MMM d, yyyy")
                                  : format(new Date(bh.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {bh.billing_period_start && bh.billing_period_end
                                  ? `${format(new Date(bh.billing_period_start), "MMM d")} – ${format(new Date(bh.billing_period_end), "MMM d, yyyy")}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-sm capitalize text-muted-foreground">
                                {bh.payment_method || "—"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(Number(bh.amount))}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {bh.discount_amount && Number(bh.discount_amount) > 0
                                  ? `-${formatCurrency(Number(bh.discount_amount))}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(Number(bh.net_amount))}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {bh.status === "paid" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                                  {bh.status === "pending" && <Clock className="h-3.5 w-3.5 text-yellow-500" />}
                                  {bh.status === "failed" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                                  <span className={`text-xs capitalize ${statusColor[bh.status] || ""}`}>
                                    {bh.status}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══ STATEMENTS TAB ════════════════════════════════════════════ */}
              <TabsContent value="statements">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      Statements & Tax Records
                      <Button size="sm" onClick={() => setStatementsOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Statement
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statementsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : statements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">No statements on file.</p>
                        <Button variant="outline" size="sm" onClick={() => setStatementsOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Statement
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="text-right">PDF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statements.map((s: any) => (
                            <TableRow key={s.id}>
                              <TableCell className="whitespace-nowrap text-sm">
                                {format(new Date(s.statement_date), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div>{s.description}</div>
                                {s.notes && (
                                  <div className="text-xs text-muted-foreground">{s.notes}</div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {s.period_start && s.period_end
                                  ? `${format(new Date(s.period_start), "MMM d")} – ${format(new Date(s.period_end), "MMM d, yyyy")}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(Number(s.amount))}
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.source === "stripe" ? "default" : "secondary"} className="text-xs capitalize">
                                  {s.source}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {s.file_url ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownloadStatement(s.file_url, s.id)}
                                    disabled={downloadingStatId === s.id}
                                  >
                                    {downloadingStatId === s.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══ DOCUMENTS TAB ═════════════════════════════════════════════ */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Application Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {docFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {docFields.map((doc) => (
                          <div
                            key={doc.path!}
                            className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{doc.label}</p>
                                <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                                  {doc.path!.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDoc(doc.path!, doc.label)}
                              disabled={downloadingDocId === doc.path}
                            >
                              {downloadingDocId === doc.path ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  View
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lease Agreement */}
                    {subscriptions.some((s) => s.lease_agreement_url) && (
                      <div className="mt-6">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Lease Agreement</p>
                        {subscriptions.filter((s) => s.lease_agreement_url).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-card mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Lease Agreement</p>
                              {sub.docusign_completed_at && (
                                <p className="text-xs text-green-600">
                                  Signed {format(new Date(sub.docusign_completed_at), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setDownloadingDocId("lease-" + sub.id);
                              try {
                                const { data, error } = await supabase.storage
                                  .from("customer-documents")
                                  .createSignedUrl(sub.lease_agreement_url!, 3600);
                                if (error) throw error;
                                window.open(data.signedUrl, "_blank");
                              } catch (err: any) {
                                toast({ title: "Error", description: err.message, variant: "destructive" });
                              } finally {
                                setDownloadingDocId(null);
                              }
                            }}
                            disabled={downloadingDocId === "lease-" + sub.id}
                          >
                            {downloadingDocId === "lease-" + sub.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                View
                              </>
                            )}
                          </Button>
                        </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Dialogs */}
      <CustomerFormDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) queryClient.invalidateQueries({ queryKey: ["admin-customer-detail", customerId] });
        }}
        customer={customer as any}
      />

      <CustomerStatementsPanel
        open={statementsOpen}
        onOpenChange={setStatementsOpen}
        customerId={customerId!}
        customerName={customer.full_name}
      />
    </SidebarProvider>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{value}</p>
      </div>
    </div>
  );
}
