import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Search, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
  FileImage,
  FileCheck,
  Lock,
  Loader2 as LucideLoader2,
  CreditCard,
  Send
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Application {
  id: string;
  user_id: string;
  status: string;
  phone_number: string;
  trailer_type: string | null;
  truck_vin: string | null;
  company_address: string | null;
  business_type: string | null;
  number_of_trailers: number | null;
  date_needed: string | null;
  insurance_company: string | null;
  insurance_company_phone: string | null;
  message: string | null;
  ssn: string | null;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
  secondary_contact_relationship: string | null;
  drivers_license_url: string | null;
  drivers_license_back_url: string | null;
  dot_number_url: string | null;
  insurance_docs_url: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  payment_setup_status: string | null;
  payment_setup_sent_at: string | null;
  stripe_payment_method_id: string | null;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  new: { label: "New", variant: "outline", icon: FileText },
  pending_review: { label: "Under Review", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

const DocumentLink = ({ label, url }: { label: string; url: string | null }) => {
  const handleViewDocument = async () => {
    if (!url) return;
    
    // Extract the path from the full URL or use as-is
    const path = url.includes('customer-documents/') 
      ? url.split('customer-documents/')[1] 
      : url;
    
    // Get a signed URL for private bucket access
    const { data, error } = await supabase.storage
      .from('customer-documents')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error || !data?.signedUrl) {
      toast({
        title: "Error",
        description: "Could not access document. It may have been removed.",
        variant: "destructive"
      });
      return;
    }
    
    window.open(data.signedUrl, '_blank');
  };

  if (!url) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-muted-foreground">
        <FileImage className="h-4 w-4" />
        <span className="text-sm">{label}</span>
        <Badge variant="outline" className="ml-auto text-xs">Not uploaded</Badge>
      </div>
    );
  }

  return (
    <button
      onClick={handleViewDocument}
      className="flex items-center gap-2 p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-left w-full group"
    >
      <FileImage className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium flex-1">{label}</span>
      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
    </button>
  );
};

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [decryptedSSN, setDecryptedSSN] = useState<string | null>(null);
  const [isDecryptingSSN, setIsDecryptingSSN] = useState(false);
  const [sendingACHSetup, setSendingACHSetup] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_applications')
        .select(`
          *,
          profiles!customer_applications_user_id_fkey (
            email,
            first_name,
            last_name,
            company_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, notes, sendNotification }: { 
      applicationId: string; 
      status: string; 
      notes: string;
      sendNotification: boolean;
    }) => {
      // Update the application status
      const { error: updateError } = await supabase
        .from('customer_applications')
        .update({ 
          status, 
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Send email notification if requested
      if (sendNotification && selectedApplication?.profiles?.email) {
        const customerName = selectedApplication.profiles.first_name 
          ? `${selectedApplication.profiles.first_name} ${selectedApplication.profiles.last_name || ''}`.trim()
          : 'Customer';

        const { data: sessionData } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke('send-application-status-email', {
          body: {
            applicationId,
            newStatus: status,
            customerEmail: selectedApplication.profiles.email,
            customerName,
            adminNotes: notes || undefined
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });

        if (response.error) {
          console.error('Email send error:', response.error);
          // Don't throw - status update succeeded, email failed
          toast({
            title: "Status Updated",
            description: "Application status updated but email notification failed to send.",
            variant: "destructive"
          });
          return;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setStatusDialogOpen(false);
      setSelectedApplication(null);
      setNewStatus("");
      setAdminNotes("");
      toast({
        title: "Status Updated",
        description: sendEmail 
          ? "Application status updated and notification email sent."
          : "Application status updated successfully."
      });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredApplications = applications.filter((app) => {
    const customerName = app.profiles 
      ? `${app.profiles.first_name || ''} ${app.profiles.last_name || ''}`.toLowerCase()
      : '';
    const customerEmail = app.profiles?.email?.toLowerCase() || '';
    
    const matchesSearch = 
      customerName.includes(searchQuery.toLowerCase()) ||
      customerEmail.includes(searchQuery.toLowerCase()) ||
      app.phone_number?.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const openStatusDialog = (app: Application) => {
    setSelectedApplication(app);
    setNewStatus(app.status);
    setAdminNotes(app.admin_notes || "");
    setStatusDialogOpen(true);
  };

  const handleDecryptSSN = async () => {
    if (!selectedApplication?.ssn) return;
    
    setIsDecryptingSSN(true);
    try {
      const { data, error } = await supabase.functions.invoke('ssn-crypto', {
        body: { action: 'decrypt', ssn: selectedApplication.ssn }
      });
      
      if (error) throw error;
      
      setDecryptedSSN(data.decrypted);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setDecryptedSSN(null);
      }, 10000);
      
    } catch (err) {
      console.error("SSN decryption error:", err);
      toast({
        title: "Error",
        description: "Failed to decrypt SSN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDecryptingSSN(false);
    }
  };

  const formatSSN = (ssn: string): string => {
    if (ssn.length === 9) {
      return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5)}`;
    }
    return ssn;
  };

  const handleStatusUpdate = () => {
    if (!selectedApplication || !newStatus) return;
    
    updateStatusMutation.mutate({
      applicationId: selectedApplication.id,
      status: newStatus,
      notes: adminNotes,
      sendNotification: sendEmail && ['pending_review', 'approved', 'rejected'].includes(newStatus)
    });
  };

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    pending: applications.filter(a => a.status === 'pending_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (isLoading) {
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Applications</h1>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5 mb-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'new' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter('new')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending_review' ? 'ring-2 ring-yellow-500' : ''}`}
                onClick={() => setStatusFilter('pending_review')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Trailer Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {app.profiles?.first_name} {app.profiles?.last_name}
                              </p>
                              {app.profiles?.company_name && (
                                <p className="text-sm text-muted-foreground">{app.profiles.company_name}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {app.profiles?.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {app.phone_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{app.trailer_type || "—"}</TableCell>
                          <TableCell>
                            {format(new Date(app.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusDialog(app)}
                              >
                                Update
                              </Button>
                              {app.status === "approved" && app.payment_setup_status !== "completed" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={sendingACHSetup === app.id}
                                  onClick={async () => {
                                    setSendingACHSetup(app.id);
                                    try {
                                      const { error } = await supabase.functions.invoke("send-ach-setup-email", {
                                        body: { applicationId: app.id }
                                      });
                                      if (error) throw error;
                                      toast({ title: "Success", description: "ACH setup email sent!" });
                                      queryClient.invalidateQueries({ queryKey: ['applications'] });
                                    } catch (err) {
                                      toast({ title: "Error", description: "Failed to send ACH setup email", variant: "destructive" });
                                    } finally {
                                      setSendingACHSetup(null);
                                    }
                                  }}
                                  title={app.payment_setup_status === "sent" ? "Resend ACH Setup" : "Send ACH Setup"}
                                >
                                  {sendingACHSetup === app.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CreditCard className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {app.payment_setup_status === "completed" && (
                                <Badge variant="outline" className="ml-1 bg-green-100 text-green-700 text-xs">ACH ✓</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={(open) => { setDetailDialogOpen(open); if (!open) setDecryptedSSN(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Applicant</label>
                  <p className="font-medium">
                    {selectedApplication.profiles?.first_name} {selectedApplication.profiles?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedApplication.profiles?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedApplication.phone_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p>{selectedApplication.profiles?.company_name || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trailer Type</label>
                  <p>{selectedApplication.trailer_type || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cab VIN# (Optional)</label>
                  <p>{selectedApplication.truck_vin || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                  <p>{selectedApplication.business_type || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trailers Needed</label>
                  <p>{selectedApplication.number_of_trailers || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Needed</label>
                  <p>{selectedApplication.date_needed || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Company</label>
                  <p>{selectedApplication.insurance_company || "—"}</p>
                </div>
                {selectedApplication.message && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Message</label>
                    <p className="whitespace-pre-wrap">{selectedApplication.message}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p>{format(new Date(selectedApplication.created_at), "PPP 'at' p")}</p>
                </div>
                {selectedApplication.reviewed_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reviewed</label>
                    <p>{format(new Date(selectedApplication.reviewed_at), "PPP 'at' p")}</p>
                  </div>
                )}
                {selectedApplication.admin_notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                    <p className="whitespace-pre-wrap bg-muted p-3 rounded-md mt-1">
                      {selectedApplication.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* SSN Section - Secure Display */}
              {selectedApplication.ssn && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Social Security Number or EIN (Encrypted)
                  </h4>
                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                    {decryptedSSN ? (
                      <>
                        <span className="font-mono text-lg tracking-wider">{formatSSN(decryptedSSN)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDecryptedSSN(null)}
                          className="ml-auto"
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide
                        </Button>
                        <span className="text-xs text-muted-foreground">Auto-hides in 10s</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-lg tracking-wider text-muted-foreground">XXX-XX-XXXX</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDecryptSSN}
                          disabled={isDecryptingSSN}
                          className="ml-auto"
                        >
                          {isDecryptingSSN ? (
                            <LucideLoader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-1" />
                          )}
                          View SSN
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Uploaded Documents
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <DocumentLink 
                    label="Driver's License (Front)" 
                    url={selectedApplication.drivers_license_url} 
                  />
                  <DocumentLink 
                    label="Driver's License (Back)" 
                    url={selectedApplication.drivers_license_back_url} 
                  />
                  <DocumentLink 
                    label="DOT Registration" 
                    url={selectedApplication.dot_number_url} 
                  />
                  <DocumentLink 
                    label="Insurance Documents" 
                    url={selectedApplication.insurance_docs_url} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setDetailDialogOpen(false);
                  openStatusDialog(selectedApplication);
                }}>
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedApplication?.profiles?.first_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                className="mt-1"
                rows={3}
              />
            </div>
            {['pending_review', 'approved', 'rejected'].includes(newStatus) && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="sendEmail" className="text-sm">
                  Send email notification to customer
                </label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending || !newStatus}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
