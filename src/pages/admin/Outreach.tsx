import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Send, Save, FileText, Settings, History, Mail, Users, TestTube, Trash2, Edit, Eye, Power, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  status: string;
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
  status: string;
  target_audience: string;
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

  // Get setting value helper
  const getSetting = (key: string) => settings.find(s => s.setting_key === key)?.setting_value || "";

  // Filter customers based on target audience
  const filteredCustomers = customers.filter(c => {
    if (targetAudience === "all") return true;
    if (targetAudience === "active") return c.status === "active";
    if (targetAudience === "archived") return c.status === "archived";
    if (targetAudience === "pending") return c.status === "pending";
    if (targetAudience === "custom") return selectedCustomers.includes(c.id);
    return true;
  });

  // Get recipient count
  const recipientCount = targetAudience === "custom" 
    ? selectedCustomers.length 
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

  // Send test email
  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error("Please enter a test email address");
      if (!subject || !body) throw new Error("Please fill in subject and body");
      
      const { data, error } = await supabase.functions.invoke("send-outreach-email", {
        body: { to: testEmail, subject, body, email_type: "test" },
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

      // Get recipients
      const recipients = filteredCustomers.filter(c => c.email);
      const emails = recipients.map(r => r.email);
      const customerIds = recipients.map(r => r.id);

      // Send emails
      const { data, error } = await supabase.functions.invoke("send-outreach-email", {
        body: {
          to: emails,
          subject,
          body,
          campaign_id: campaign.id,
          template_id: selectedTemplate || null,
          customer_ids: customerIds,
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
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* Compose Tab */}
            <TabsContent value="compose">
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
                          Variables: {"{{customer_name}}"}, {"{{login_url}}"}, {"{{profile_url}}"}
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
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
                  dangerouslySetInnerHTML={{ __html: body }}
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
        </main>
      </div>
    </SidebarProvider>
  );
}
