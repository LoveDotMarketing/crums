import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, Save, FileText, Settings, History, Mail, Users, TestTube, Trash2, Edit, Eye, Power, AlertTriangle, Play, CheckCircle, XCircle, Clock, UserCheck, Truck, Download, Camera, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  status: string;
}

interface CustomerOutreachStatus {
  id: string;
  customer_id: string;
  welcome_sent_at: string | null;
  password_set_at: string | null;
  profile_completed_at: string | null;
  last_password_reminder_at: string | null;
  last_profile_reminder_at: string | null;
  reminder_count: number;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
}

interface CustomerWithOutreach extends Customer {
  outreach_status?: CustomerOutreachStatus | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string | null;
  status: string;
  target_audience: string;
  custom_recipients: string[] | null;
  template_id: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at: string | null;
}

interface OutreachSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

interface OutreachLog {
  id: string;
  email: string;
  email_type: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  error_message: string | null;
  created_at: string;
  customer_id: string | null;
  campaign_id: string | null;
}

interface PlannedEmail {
  customer_id: string;
  customer_name: string;
  email: string;
  type: "welcome" | "password_reminder" | "profile_reminder";
  reason: string;
}

interface AutomationResult {
  success: boolean;
  dry_run: boolean;
  message?: string;
  // For actual runs
  emails_sent?: number;
  results?: { customer: string; type: string; status: string }[];
  // For dry runs (preview)
  total_planned?: number;
  welcome_count?: number;
  password_reminder_count?: number;
  profile_reminder_count?: number;
  planned_emails?: PlannedEmail[];
}

function EventLeadsTab() {
  const queryClient = useQueryClient();
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{ full_name: string; email: string; phone: string; company: string } | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualData, setManualData] = useState({ full_name: "", email: "", phone: "", company: "" });
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");

  const handleManualAdd = async () => {
    if (!manualData.full_name || !manualData.email || !manualData.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }
    setIsAddingManual(true);
    try {
      const { error } = await supabase.from("event_leads").insert({
        full_name: manualData.full_name.trim(),
        email: manualData.email.trim().toLowerCase(),
        phone: manualData.phone.trim(),
        company: manualData.company.trim() || null,
        event_name: "MATS 2026",
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["event-leads"] });
      queryClient.invalidateQueries({ queryKey: ["event-leads-mats2026"] });
      toast.success(`${manualData.full_name.trim()} added to MATS 2026 list`);
      setShowManualDialog(false);
      setManualData({ full_name: "", email: "", phone: "", company: "" });
    } catch (err: any) {
      toast.error("Failed to add lead: " + (err.message || "Unknown error"));
    } finally {
      setIsAddingManual(false);
    }
  };

  const { data: eventLeads = [], isLoading } = useQuery({
    queryKey: ["event-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_leads" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateLeadType = useMutation({
    mutationFn: async ({ id, lead_type }: { id: string; lead_type: string }) => {
      const { error } = await supabase.from("event_leads").update({ lead_type } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-leads"] });
      queryClient.invalidateQueries({ queryKey: ["event-leads-mats2026"] });
    },
    onError: () => toast.error("Failed to update lead type"),
  });

  const toggleLeadUnsubscribe = useMutation({
    mutationFn: async ({ id, unsubscribed }: { id: string; unsubscribed: boolean }) => {
      const { error } = await supabase.from("event_leads").update({ unsubscribed } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["event-leads"] });
      queryClient.invalidateQueries({ queryKey: ["event-leads-mats2026"] });
      toast.success(vars.unsubscribed ? "Lead unsubscribed" : "Lead resubscribed");
    },
    onError: () => toast.error("Failed to update"),
  });

  const filteredLeads = eventLeads.filter((l: any) => {
    if (leadTypeFilter !== "all" && l.lead_type !== leadTypeFilter) return false;
    return true;
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-leads"] });
      toast.success("Lead removed");
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  const exportCSV = () => {
    if (!eventLeads.length) return;
    const headers = ["Name", "Company", "Email", "Phone", "Event", "Type", "Unsubscribed", "Notes", "Submitted At"];
    const rows = eventLeads.map((l: any) => [
      l.full_name, l.company || "", l.email, l.phone, l.event_name, l.lead_type || "prospect", l.unsubscribed ? "Yes" : "No", l.notes || "", format(new Date(l.created_at), "yyyy-MM-dd HH:mm"),
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setScanImage(reader.result as string);
      setScannedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!scanImage) return;
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-business-card", {
        body: { image: scanImage },
      });
      if (error) throw error;
      setScannedData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
      });
    } catch (err: any) {
      toast.error("Scan failed: " + (err.message || "Unknown error"));
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddLead = async () => {
    if (!scannedData?.full_name || !scannedData?.email || !scannedData?.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }
    setIsAddingLead(true);
    try {
      const { error } = await supabase.from("event_leads").insert({
        full_name: scannedData.full_name,
        email: scannedData.email,
        phone: scannedData.phone,
        company: scannedData.company || null,
        event_name: "MATS 2026",
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["event-leads"] });
      queryClient.invalidateQueries({ queryKey: ["event-leads-mats2026"] });
      toast.success(`${scannedData.full_name} added to MATS 2026 list`);
      setShowScanDialog(false);
      setScanImage(null);
      setScannedData(null);
    } catch (err: any) {
      toast.error("Failed to add lead: " + (err.message || "Unknown error"));
    } finally {
      setIsAddingLead(false);
    }
  };

  const resetScanDialog = () => {
    setShowScanDialog(false);
    setScanImage(null);
    setScannedData(null);
    setIsScanning(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Event Leads
              </CardTitle>
              <CardDescription>{eventLeads.length} total leads collected</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={leadTypeFilter} onValueChange={setLeadTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowManualDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Lead
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowScanDialog(true)}>
                <Camera className="h-4 w-4 mr-2" /> Scan Card
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={!eventLeads.length}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filteredLeads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No event leads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead: any) => (
                  <TableRow key={lead.id} className={lead.unsubscribed ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{lead.full_name}</TableCell>
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      <Select
                        value={lead.lead_type || "prospect"}
                        onValueChange={(val) => updateLeadType.mutate({ id: lead.id, lead_type: val })}
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{lead.event_name}</Badge></TableCell>
                    <TableCell>
                      <Switch
                        checked={!lead.unsubscribed}
                        onCheckedChange={(checked) => toggleLeadUnsubscribe.mutate({ id: lead.id, unsubscribed: !checked })}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Remove ${lead.full_name}?`)) {
                            deleteLead.mutate(lead.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showScanDialog} onOpenChange={resetScanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Business Card</DialogTitle>
            <DialogDescription>Upload or capture a business card photo to extract contact info and add to MATS 2026 leads.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!scannedData ? (
              <>
                <div>
                  <Label htmlFor="card-image">Business Card Photo</Label>
                  <Input
                    id="card-image"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="mt-1"
                  />
                </div>

                {scanImage && (
                  <div className="space-y-3">
                    <img src={scanImage} alt="Business card preview" className="w-full rounded-md border" />
                    <Button onClick={handleScan} disabled={isScanning} className="w-full">
                      {isScanning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</> : <><Camera className="h-4 w-4 mr-2" /> Scan Card</>}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="scan-name">Full Name *</Label>
                  <Input id="scan-name" value={scannedData.full_name} onChange={e => setScannedData({ ...scannedData, full_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="scan-email">Email *</Label>
                  <Input id="scan-email" type="email" value={scannedData.email} onChange={e => setScannedData({ ...scannedData, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="scan-phone">Phone *</Label>
                  <Input id="scan-phone" value={scannedData.phone} onChange={e => setScannedData({ ...scannedData, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="scan-company">Company / Notes</Label>
                  <Input id="scan-company" value={scannedData.company} onChange={e => setScannedData({ ...scannedData, company: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {scannedData && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => { setScannedData(null); setScanImage(null); }}>
                Re-scan
              </Button>
              <Button onClick={handleAddLead} disabled={isAddingLead}>
                {isAddingLead ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add to MATS 2026"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showManualDialog} onOpenChange={(open) => { if (!open) { setShowManualDialog(false); setManualData({ full_name: "", email: "", phone: "", company: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead Manually</DialogTitle>
            <DialogDescription>Add a new lead to the MATS 2026 list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="John Smith" value={manualData.full_name} onChange={(e) => setManualData(d => ({ ...d, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="john@example.com" value={manualData.email} onChange={(e) => setManualData(d => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input type="tel" placeholder="(555) 123-4567" value={manualData.phone} onChange={(e) => setManualData(d => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="ABC Trucking" value={manualData.company} onChange={(e) => setManualData(d => ({ ...d, company: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowManualDialog(false); setManualData({ full_name: "", email: "", phone: "", company: "" }); }}>Cancel</Button>
            <Button onClick={handleManualAdd} disabled={isAddingManual}>
              {isAddingManual ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add to MATS 2026"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}




export default function Outreach() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("compose");
  
  // Compose state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [testEmail, setTestEmail] = useState("");
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Automation run state
  const [showAutomationResults, setShowAutomationResults] = useState(false);
  const [automationResults, setAutomationResults] = useState<AutomationResult | null>(null);

  // Customer status filter
  const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
  const [outreachFilter, setOutreachFilter] = useState("all");
  const [eventLeadTypeFilter, setEventLeadTypeFilter] = useState("all");

  // Fetch customers
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers-outreach"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, status")
        .not("email", "is", null)
        .order("full_name");
      if (error) throw error;
      return data as Customer[];
    },
  });

  // Fetch MATS 2026 event leads
  const { data: eventLeads = [] } = useQuery({
    queryKey: ["event-leads-mats2026"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_leads")
        .select("*")
        .eq("event_name", "MATS 2026")
        .eq("unsubscribed", false as any)
        .order("full_name");
      if (error) throw error;
      return data as unknown as Array<{ id: string; full_name: string; email: string; phone: string; event_name: string; lead_type: string; unsubscribed: boolean }>;
    },
  });

  // Fetch customer outreach status
  const { data: outreachStatuses = [], isLoading: loadingOutreachStatus } = useQuery({
    queryKey: ["customer-outreach-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_outreach_status")
        .select("*");
      if (error) throw error;
      return data as CustomerOutreachStatus[];
    },
  });

  // Merge customers with outreach status
  const customersWithOutreach: CustomerWithOutreach[] = customers.map(customer => ({
    ...customer,
    outreach_status: outreachStatuses.find(s => s.customer_id === customer.id) || null,
  }));

  // Filter customers for status tab
  const filteredCustomersForStatus = customersWithOutreach.filter(c => {
    // Status filter
    if (customerStatusFilter !== "all" && c.status !== customerStatusFilter) return false;
    
    // Outreach filter
    if (outreachFilter === "needs_password") {
      return !c.outreach_status?.password_set_at;
    }
    if (outreachFilter === "needs_profile") {
      return c.outreach_status?.password_set_at && !c.outreach_status?.profile_completed_at;
    }
    if (outreachFilter === "unsubscribed") {
      return c.outreach_status?.unsubscribed;
    }
    if (outreachFilter === "complete") {
      return c.outreach_status?.password_set_at && c.outreach_status?.profile_completed_at;
    }
    
    return true;
  });

  // Stats for customer status tab
  const statusStats = {
    total: customers.length,
    welcomeSent: outreachStatuses.filter(s => s.welcome_sent_at).length,
    passwordSet: outreachStatuses.filter(s => s.password_set_at).length,
    profileComplete: outreachStatuses.filter(s => s.profile_completed_at).length,
    unsubscribed: outreachStatuses.filter(s => s.unsubscribed).length,
  };

  // Fetch templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmailCampaign[];
    },
  });

  // Fetch settings
  const { data: settings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ["outreach-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_settings")
        .select("*");
      if (error) throw error;
      return data as OutreachSetting[];
    },
  });

  // Fetch outreach logs
  const { data: outreachLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["outreach-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as OutreachLog[];
    },
  });

  // Get setting value helper
  const getSetting = (key: string) => settings.find(s => s.setting_key === key)?.setting_value || "";

  // Filter customers based on target audience
  const filteredCustomers = customers.filter(c => {
    if (targetAudience === "all") return true;
    if (targetAudience === "active") return c.status === "active";
    if (targetAudience === "archived") return c.status === "archived";
    if (targetAudience === "pending") return c.status === "pending";
    if (targetAudience === "custom") return selectedCustomers.includes(c.id);
    if (targetAudience === "event_mats_2026") return false; // handled separately
    return true;
  });

  // Get recipient count
  const recipientCount = targetAudience === "custom" 
    ? selectedCustomers.length 
    : targetAudience === "event_mats_2026"
    ? eventLeads.length
    : filteredCustomers.length;

  // Load template into compose
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setSelectedTemplate(templateId);
    }
  };

  // Preview automation (dry run)
  const previewAutomationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("process-outreach-automation", {
        body: { dry_run: true },
      });
      if (error) throw error;
      return data as AutomationResult;
    },
    onSuccess: (data) => {
      setAutomationResults(data);
      setShowAutomationResults(true);
    },
    onError: (error: Error) => {
      toast.error(`Preview failed: ${error.message}`);
    },
  });

  // Run automation manually
  const runAutomationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("process-outreach-automation", {
        body: { dry_run: false },
      });
      if (error) throw error;
      return data as AutomationResult;
    },
    onSuccess: (data) => {
      setAutomationResults(data);
      setShowAutomationResults(true);
      queryClient.invalidateQueries({ queryKey: ["customer-outreach-status"] });
      toast.success(`Automation complete! ${data.emails_sent} emails sent.`);
    },
    onError: (error: Error) => {
      toast.error(`Automation failed: ${error.message}`);
    },
  });

  // Toggle unsubscribe status
  const toggleUnsubscribeMutation = useMutation({
    mutationFn: async ({ customerId, email, unsubscribe }: { customerId: string; email: string; unsubscribe: boolean }) => {
      const { error } = await supabase.functions.invoke("update-outreach-status", {
        body: {
          action: unsubscribe ? "unsubscribed" : "resubscribed",
          customer_id: customerId,
          email,
        },
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-outreach-status"] });
      toast.success(variables.unsubscribe ? "Customer unsubscribed" : "Customer resubscribed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Replace template variables with sample/test values
  const replaceTemplateVariables = (text: string, customerName = "Test Customer") => {
    const baseUrl = "https://crumsleasing.com";
    return text
      .replace(/\{\{customer_name\}\}/g, customerName)
      .replace(/\{\{login_url\}\}/g, `${baseUrl}/login`)
      .replace(/\{\{profile_url\}\}/g, `${baseUrl}/dashboard/customer/profile`)
      .replace(/\{\{unsubscribe_url\}\}/g, `${baseUrl}/unsubscribe?email=test@example.com`);
  };

  // Send test email
  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error("Please enter a test email address");
      if (!subject || !body) throw new Error("Please fill in subject and body");
      
      // Replace template variables with test values
      const processedSubject = replaceTemplateVariables(subject, "Test Customer");
      const processedBody = replaceTemplateVariables(body, "Test Customer");
      
      const { data, error } = await supabase.functions.invoke("send-outreach-email", {
        body: { to: testEmail, subject: processedSubject, body: processedBody, email_type: "test" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Test email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Save as draft
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!campaignName) throw new Error("Please enter a campaign name");
      
      const { error } = await supabase.from("email_campaigns").insert({
        name: campaignName,
        subject,
        body,
        status: "draft",
        target_audience: targetAudience,
        custom_recipients: targetAudience === "custom" ? selectedCustomers : [],
        recipient_count: recipientCount,
        template_id: selectedTemplate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign saved as draft");
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      resetComposeForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Send campaign
  const sendCampaignMutation = useMutation({
    mutationFn: async () => {
      if (!campaignName) throw new Error("Please enter a campaign name");
      if (!subject || !body) throw new Error("Please fill in subject and body");
      if (recipientCount === 0) throw new Error("No recipients selected");

      setIsSending(true);

      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: campaignName,
          subject,
          body,
          status: "sending",
          target_audience: targetAudience,
          custom_recipients: targetAudience === "custom" ? selectedCustomers : [],
          recipient_count: recipientCount,
          template_id: selectedTemplate || null,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Get recipients with customer data for personalization
      let recipientsWithData;
      if (targetAudience === "event_mats_2026") {
        recipientsWithData = eventLeads
          .filter(l => l.email)
          .map(l => ({
            email: l.email,
            customer_id: l.id,
            customer_name: l.full_name || "Valued Visitor",
          }));
      } else {
        recipientsWithData = filteredCustomers
          .filter(c => c.email)
          .map(c => ({
            email: c.email,
            customer_id: c.id,
            customer_name: c.full_name || "Valued Customer",
          }));
      }

      // Send emails with new format that includes customer data
      const { data, error } = await supabase.functions.invoke("send-outreach-email", {
        body: {
          recipients: recipientsWithData,
          subject,
          body,
          campaign_id: campaign.id,
          template_id: selectedTemplate || null,
          email_type: "campaign",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Campaign sent! ${data.sent} emails sent, ${data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      resetComposeForm();
      setIsSending(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsSending(false);
    },
  });

  // Save template
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: { name?: string; subject?: string; body?: string; template_type?: string; is_active?: boolean }) => {
      if (editingTemplate?.id) {
        const { error } = await supabase
          .from("email_templates")
          .update(template)
          .eq("id", editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_templates").insert({
          name: template.name || "",
          subject: template.subject || "",
          body: template.body || "",
          template_type: template.template_type || "custom",
          is_active: template.is_active ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingTemplate?.id ? "Template updated" : "Template created");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setShowTemplateDialog(false);
      setEditingTemplate(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("outreach_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Setting updated");
      queryClient.invalidateQueries({ queryKey: ["outreach-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetComposeForm = () => {
    setSubject("");
    setBody("");
    setCampaignName("");
    setTargetAudience("all");
    setSelectedCustomers([]);
    setSelectedTemplate("");
  };

  // Load draft into compose form
  const loadDraft = (campaign: EmailCampaign) => {
    setCampaignName(campaign.name);
    setSubject(campaign.subject || "");
    setBody(campaign.body || "");
    setTargetAudience(campaign.target_audience);
    if (campaign.target_audience === "custom" && campaign.custom_recipients) {
      setSelectedCustomers(campaign.custom_recipients);
    }
    if (campaign.template_id) {
      setSelectedTemplate(campaign.template_id);
    }
    setActiveTab("compose");
    toast.success("Draft loaded into compose form");
  };

  // Delete draft
  const deleteDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft deleted");
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sending: "default",
      completed: "outline",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Outreach</h1>
                <p className="text-muted-foreground">Email campaigns and customer communications</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="compose" className="gap-2">
                <Mail className="h-4 w-4" /> Compose
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="h-4 w-4" /> Templates
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2">
                <History className="h-4 w-4" /> Campaigns
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <FileText className="h-4 w-4" /> Logs
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <UserCheck className="h-4 w-4" /> Customers
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Truck className="h-4 w-4" /> Events
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* Compose Tab */}
            <TabsContent value="compose">
              {/* Saved Drafts Section */}
              {campaigns.filter(c => c.status === "draft").length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Saved Drafts ({campaigns.filter(c => c.status === "draft").length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {campaigns.filter(c => c.status === "draft").map((draft) => (
                        <div key={draft.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{draft.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {draft.subject || "No subject"} • Saved {format(new Date(draft.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => loadDraft(draft)}>
                              Load
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteDraftMutation.mutate(draft.id)}
                              disabled={deleteDraftMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compose Email</CardTitle>
                      <CardDescription>Create and send email campaigns to customers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="campaign-name">Campaign Name</Label>
                          <Input
                            id="campaign-name"
                            placeholder="e.g., Welcome Email Blast"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template">Load Template</Label>
                          <Select value={selectedTemplate} onValueChange={loadTemplate}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.filter(t => t.is_active).map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject Line</Label>
                        <Input
                          id="subject"
                          placeholder="Email subject..."
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="body">Email Body (HTML)</Label>
                        <Textarea
                          id="body"
                          placeholder="Enter HTML email content..."
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Variables: {"{{customer_name}}"}, {"{{login_url}}"}, {"{{profile_url}}"}, {"{{unsubscribe_url}}"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowPreview(true)}>
                          <Eye className="h-4 w-4 mr-2" /> Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Test Email */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Send Test Email</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                      <Input
                        placeholder="test@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => sendTestEmailMutation.mutate()}
                        disabled={sendTestEmailMutation.isPending}
                      >
                        {sendTestEmailMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4 mr-2" />
                        )}
                        Send Test
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recipients & Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4" /> Recipients
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select value={targetAudience} onValueChange={setTargetAudience}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="archived">Archived Only</SelectItem>
                            <SelectItem value="pending">Pending Only</SelectItem>
                            <SelectItem value="event_mats_2026">Event — MATS 2026</SelectItem>
                            <SelectItem value="custom">Custom Selection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {targetAudience === "custom" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowCustomerSelector(true)}
                        >
                          Select Customers ({selectedCustomers.length} selected)
                        </Button>
                      )}

                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-3xl font-bold">{recipientCount}</p>
                        <p className="text-sm text-muted-foreground">Recipients</p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>• Active: {customers.filter(c => c.status === "active").length}</p>
                        <p>• Archived: {customers.filter(c => c.status === "archived").length}</p>
                        <p>• Pending: {customers.filter(c => c.status === "pending").length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => sendCampaignMutation.mutate()}
                        disabled={isSending || !campaignName || !subject || !body || recipientCount === 0}
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Campaign
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => saveDraftMutation.mutate()}
                        disabled={saveDraftMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" /> Save as Draft
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={resetComposeForm}>
                        Clear Form
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Manage reusable email templates</CardDescription>
                  </div>
                  <Button onClick={() => { setEditingTemplate({} as EmailTemplate); setShowTemplateDialog(true); }}>
                    Create Template
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingTemplates ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{template.template_type}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                            <TableCell>
                              <Badge variant={template.is_active ? "default" : "secondary"}>
                                {template.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(template.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingTemplate(template); setShowTemplateDialog(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign History</CardTitle>
                  <CardDescription>View past email campaigns and their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCampaigns ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No campaigns yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Recipients</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Failed</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{campaign.subject}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{campaign.target_audience}</Badge>
                            </TableCell>
                            <TableCell>{campaign.recipient_count}</TableCell>
                            <TableCell className="text-green-600">{campaign.sent_count}</TableCell>
                            <TableCell className="text-destructive">{campaign.failed_count}</TableCell>
                            <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                            <TableCell>{format(new Date(campaign.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              {campaign.status === "draft" && (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadDraft(campaign)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteDraftMutation.mutate(campaign.id)}
                                    disabled={deleteDraftMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Email Logs</CardTitle>
                  <CardDescription>View all sent emails and their delivery status</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : outreachLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No email logs yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outreachLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.email_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.status === "sent" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>
                                {log.status === "sent" ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Sent</>
                                ) : log.status === "failed" ? (
                                  <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" /> {log.status}</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.sent_at ? format(new Date(log.sent_at), "MMM d, yyyy HH:mm") : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-destructive">
                              {log.error_message || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{statusStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{statusStats.welcomeSent}</p>
                    <p className="text-sm text-muted-foreground">Welcome Sent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{statusStats.passwordSet}</p>
                    <p className="text-sm text-muted-foreground">Password Set</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{statusStats.profileComplete}</p>
                    <p className="text-sm text-muted-foreground">Profile Complete</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">{statusStats.unsubscribed}</p>
                    <p className="text-sm text-muted-foreground">Unsubscribed</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Customer Outreach Status</CardTitle>
                    <CardDescription>Track customer engagement and onboarding progress</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={outreachFilter} onValueChange={setOutreachFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Outreach" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Outreach</SelectItem>
                        <SelectItem value="needs_password">Needs Password</SelectItem>
                        <SelectItem value="needs_profile">Needs Profile</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingCustomers || loadingOutreachStatus ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredCustomersForStatus.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No customers match the filters</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Welcome</TableHead>
                          <TableHead className="text-center">Password</TableHead>
                          <TableHead className="text-center">Profile</TableHead>
                          <TableHead className="text-center">Reminders</TableHead>
                          <TableHead className="text-center">Subscribed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomersForStatus.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.full_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{customer.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.status}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.outreach_status?.welcome_sent_at ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(customer.outreach_status.welcome_sent_at), "M/d")}
                                  </span>
                                </div>
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.outreach_status?.password_set_at ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(customer.outreach_status.password_set_at), "M/d")}
                                  </span>
                                </div>
                              ) : (
                                <Clock className="h-4 w-4 text-amber-500 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.outreach_status?.profile_completed_at ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(customer.outreach_status.profile_completed_at), "M/d")}
                                  </span>
                                </div>
                              ) : (
                                <Clock className="h-4 w-4 text-amber-500 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">{customer.outreach_status?.reminder_count || 0}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={!customer.outreach_status?.unsubscribed}
                                onCheckedChange={(checked) => {
                                  toggleUnsubscribeMutation.mutate({
                                    customerId: customer.id,
                                    email: customer.email,
                                    unsubscribe: !checked,
                                  });
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <EventLeadsTab />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              {/* Master Automation Switch */}
              <Card className={`mb-6 border-2 ${getSetting("automation_enabled") === "true" ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : "border-destructive bg-destructive/5"}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Power className={`h-6 w-6 ${getSetting("automation_enabled") === "true" ? "text-green-600" : "text-destructive"}`} />
                      <div>
                        <CardTitle className="text-xl">Master Automation Switch</CardTitle>
                        <CardDescription>
                          {getSetting("automation_enabled") === "true" 
                            ? "Automation is ACTIVE - automated emails will be sent based on settings below"
                            : "Automation is OFF - no automated emails will be sent regardless of other settings"
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={getSetting("automation_enabled") === "true" ? "default" : "destructive"}
                        className={`text-sm px-3 py-1 ${getSetting("automation_enabled") === "true" ? "bg-green-600" : ""}`}
                      >
                        {getSetting("automation_enabled") === "true" ? "ACTIVE" : "OFF"}
                      </Badge>
                      <Switch
                        id="automation-master"
                        checked={getSetting("automation_enabled") === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({ key: "automation_enabled", value: String(checked) })
                        }
                        className="scale-125"
                      />
                    </div>
                  </div>
                </CardHeader>
                {getSetting("automation_enabled") !== "true" && (
                  <CardContent>
                    <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 dark:text-amber-200">Automation Disabled</AlertTitle>
                      <AlertDescription className="text-amber-700 dark:text-amber-300">
                        Configure your templates and settings below, then turn on the master switch when ready to start sending automated emails.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>

              {/* Run Automation Now Card */}
              <Card className="mb-6 border-2 border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">Run Automation Now</CardTitle>
                        <CardDescription>
                          Preview what emails would be sent, or run automation immediately without waiting for the scheduled run.
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => previewAutomationMutation.mutate()}
                        disabled={previewAutomationMutation.isPending || getSetting("automation_enabled") !== "true"}
                      >
                        {previewAutomationMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </>
                        )}
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => runAutomationMutation.mutate()}
                        disabled={runAutomationMutation.isPending || getSetting("automation_enabled") !== "true"}
                      >
                        {runAutomationMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Automation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {getSetting("automation_enabled") !== "true" && (
                  <CardContent>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Enable the Master Automation Switch above to preview or run automation.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Email Settings</CardTitle>
                    <CardDescription>Configure automatic welcome emails for new customers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="welcome-enabled">Enable Welcome Emails</Label>
                      <Switch
                        id="welcome-enabled"
                        checked={getSetting("welcome_email_enabled") === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({ key: "welcome_email_enabled", value: String(checked) })
                        }
                        disabled={getSetting("automation_enabled") !== "true"}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password Reminder Settings</CardTitle>
                    <CardDescription>Automatic reminders for customers who haven't set passwords</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-enabled">Enable Password Reminders</Label>
                      <Switch
                        id="password-enabled"
                        checked={getSetting("password_reminder_enabled") === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({ key: "password_reminder_enabled", value: String(checked) })
                        }
                        disabled={getSetting("automation_enabled") !== "true"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-days">Days Between Reminders</Label>
                      <Input
                        id="password-days"
                        type="number"
                        value={getSetting("password_reminder_days")}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "password_reminder_days", value: e.target.value })
                        }
                        disabled={getSetting("automation_enabled") !== "true"}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Completion Reminders</CardTitle>
                    <CardDescription>Automatic reminders for incomplete profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile-enabled">Enable Profile Reminders</Label>
                      <Switch
                        id="profile-enabled"
                        checked={getSetting("profile_reminder_enabled") === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({ key: "profile_reminder_enabled", value: String(checked) })
                        }
                        disabled={getSetting("automation_enabled") !== "true"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-days">Days Between Reminders</Label>
                      <Input
                        id="profile-days"
                        type="number"
                        value={getSetting("profile_reminder_days")}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "profile_reminder_days", value: e.target.value })
                        }
                        disabled={getSetting("automation_enabled") !== "true"}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Toll Payment Reminders</CardTitle>
                    <CardDescription>Automatic reminders for unpaid toll notices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="toll-enabled">Enable Toll Reminders</Label>
                      <Switch
                        id="toll-enabled"
                        checked={getSetting("toll_reminder_enabled") === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({ key: "toll_reminder_enabled", value: String(checked) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toll-days">Days Between Reminders</Label>
                      <Input
                        id="toll-days"
                        type="number"
                        value={getSetting("toll_reminder_interval_days") || "3"}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "toll_reminder_interval_days", value: e.target.value })
                        }
                        disabled={getSetting("toll_reminder_enabled") !== "true"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reminders are sent daily at 9 AM for pending tolls older than this interval
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Default email configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={getSetting("from_name")}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "from_name", value: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reply-to">Reply-To Email</Label>
                      <Input
                        id="reply-to"
                        type="email"
                        value={getSetting("reply_to")}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "reply_to", value: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-reminders">Maximum Reminders</Label>
                      <Input
                        id="max-reminders"
                        type="number"
                        value={getSetting("max_reminders")}
                        onChange={(e) =>
                          updateSettingMutation.mutate({ key: "max_reminders", value: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Customer Selector Dialog */}
          <Dialog open={showCustomerSelector} onOpenChange={setShowCustomerSelector}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select Customers</DialogTitle>
                <DialogDescription>Choose specific customers to receive this email</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter((id) => id !== customer.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <Badge variant="outline">{customer.status}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCustomers([])}>
                  Clear All
                </Button>
                <Button onClick={() => setShowCustomerSelector(false)}>
                  Done ({selectedCustomers.length} selected)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
                <DialogDescription>Subject: {subject}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[500px]">
                <div
                  className="p-4 bg-white text-black rounded"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Template Edit Dialog */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate?.id ? "Edit Template" : "Create Template"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={editingTemplate?.name || ""}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate!, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={editingTemplate?.template_type || "custom"}
                      onValueChange={(value) => setEditingTemplate({ ...editingTemplate!, template_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="password_reminder">Password Reminder</SelectItem>
                        <SelectItem value="profile_reminder">Profile Reminder</SelectItem>
                        <SelectItem value="reengagement">Re-engagement</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={editingTemplate?.subject || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate!, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body (HTML)</Label>
                  <Textarea
                    value={editingTemplate?.body || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate!, body: e.target.value })}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingTemplate?.is_active ?? true}
                    onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate!, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => saveTemplateMutation.mutate({
                    name: editingTemplate?.name,
                    subject: editingTemplate?.subject,
                    body: editingTemplate?.body,
                    template_type: editingTemplate?.template_type || "custom",
                    is_active: editingTemplate?.is_active ?? true,
                  })}
                  disabled={saveTemplateMutation.isPending}
                >
                  {saveTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Automation Results Dialog */}
          <Dialog open={showAutomationResults} onOpenChange={setShowAutomationResults}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {automationResults?.dry_run ? "Automation Preview" : "Automation Results"}
                </DialogTitle>
                <DialogDescription>
                  {automationResults?.dry_run
                    ? "This is a preview - no emails have been sent"
                    : automationResults?.success
                      ? "Automation completed successfully"
                      : "Automation encountered issues"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {automationResults?.dry_run ? (
                  <>
                    {/* Preview Mode Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{automationResults?.total_planned || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Emails</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{automationResults?.welcome_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Welcome</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600">{automationResults?.password_reminder_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Password</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{automationResults?.profile_reminder_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Profile</p>
                      </div>
                    </div>

                    {automationResults?.planned_emails && automationResults.planned_emails.length > 0 && (
                      <div className="space-y-2">
                        <Label>Emails to be sent:</Label>
                        <ScrollArea className="h-[250px] border rounded-md p-3">
                          {automationResults.planned_emails.map((planned, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{planned.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{planned.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={
                                  planned.type === "welcome" ? "default" :
                                  planned.type === "password_reminder" ? "secondary" : "outline"
                                }>
                                  {planned.type.replace("_", " ")}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">{planned.reason}</p>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    {automationResults?.total_planned === 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>No emails to send</AlertTitle>
                        <AlertDescription>
                          All customers are up to date or do not meet the criteria for automated emails.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <>
                    {/* Actual Run Stats */}
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{automationResults?.emails_sent || 0}</p>
                      <p className="text-sm text-muted-foreground">Emails Sent</p>
                    </div>
                    
                    {automationResults?.results && automationResults.results.length > 0 && (
                      <div className="space-y-2">
                        <Label>Details</Label>
                        <ScrollArea className="h-[200px] border rounded-md p-3">
                          {automationResults.results.map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="text-sm font-medium">{result.customer}</p>
                                <p className="text-xs text-muted-foreground">{result.type}</p>
                              </div>
                              {result.status === "sent" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                {automationResults?.dry_run && automationResults?.total_planned && automationResults.total_planned > 0 && (
                  <Button
                    onClick={() => {
                      setShowAutomationResults(false);
                      runAutomationMutation.mutate();
                    }}
                    disabled={runAutomationMutation.isPending}
                  >
                    {runAutomationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send {automationResults.total_planned} Emails Now
                      </>
                    )}
                  </Button>
                )}
                <Button variant={automationResults?.dry_run ? "outline" : "default"} onClick={() => setShowAutomationResults(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}
