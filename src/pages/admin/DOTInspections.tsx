import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ClipboardCheck,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  FileText,
  User,
  Truck,
  Calendar,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DOTInspection {
  id: string;
  trailer_id: string;
  trailer_number: string;
  vin: string | null;
  license_plate: string | null;
  trailer_type: string | null;
  inspector_id: string;
  inspector_name: string | null;
  inspection_date: string;
  status: string;
  customer_acknowledged: boolean;
  customer_acknowledged_at: string | null;
  customer_name: string | null;
  customer_company_name: string | null;
  customer_signer_name: string | null;
  customer_signature: string | null;
  inspector_signature: string | null;
  brakes_operational: boolean;
  tires_tread_depth: boolean;
  brake_lights_operational: boolean;
  frame_no_cracks: boolean;
  rear_doors_operational: boolean;
  dot_reflective_tape_present: boolean;
  dot_release_confirmed: boolean;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  in_progress: { label: "In Progress", variant: "outline", icon: Clock },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle },
  customer_acknowledged: { label: "Customer Signed", variant: "default", icon: CheckCircle },
};

export default function DOTInspections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInspection, setSelectedInspection] = useState<DOTInspection | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["dot-inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dot_inspections")
        .select("*")
        .order("inspection_date", { ascending: false });

      if (error) throw error;
      return data as DOTInspection[];
    },
  });

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.trailer_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspector_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const effectiveStatus = inspection.customer_acknowledged ? "customer_acknowledged" : inspection.status;
    const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (inspection: DOTInspection) => {
    const effectiveStatus = inspection.customer_acknowledged ? "customer_acknowledged" : inspection.status;
    const config = statusConfig[effectiveStatus] || statusConfig.in_progress;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: inspections.length,
    inProgress: inspections.filter((i) => i.status === "in_progress").length,
    completed: inspections.filter((i) => i.status === "completed" && !i.customer_acknowledged).length,
    customerSigned: inspections.filter((i) => i.customer_acknowledged).length,
  };

  const handleViewDetails = (inspection: DOTInspection) => {
    setSelectedInspection(inspection);
    setDetailDialogOpen(true);
  };

  const handleDownloadPDF = (inspection: DOTInspection) => {
    // Open a new window with print-friendly inspection report
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const checklistItems = [
      { label: "Brakes Operational", value: inspection.brakes_operational },
      { label: "Tires Tread Depth", value: inspection.tires_tread_depth },
      { label: "Lights Operational", value: inspection.brake_lights_operational },
      { label: "Frame No Cracks", value: inspection.frame_no_cracks },
      { label: "Rear Doors Operational", value: inspection.rear_doors_operational },
      { label: "DOT Reflective Tape", value: inspection.dot_reflective_tape_present },
      { label: "DOT Release Confirmed", value: inspection.dot_release_confirmed },
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DOT Inspection Report - ${inspection.trailer_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 8px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { margin-bottom: 8px; }
          .field-label { font-size: 12px; color: #666; }
          .field-value { font-size: 14px; font-weight: 500; }
          .checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
          .check { width: 16px; height: 16px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; }
          .check.passed { background: #22c55e; color: white; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
          .signature-box { border-top: 1px solid #333; padding-top: 10px; }
          .signature-box img { max-height: 60px; margin-bottom: 5px; }
          .signature-label { font-size: 12px; color: #666; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DOT Inspection Report</h1>
          <p>CRUMS Leasing - Trailer Inspection Certificate</p>
        </div>

        <div class="section">
          <div class="section-title">Trailer Information</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Trailer Number</div>
              <div class="field-value">${inspection.trailer_number}</div>
            </div>
            <div class="field">
              <div class="field-label">VIN</div>
              <div class="field-value">${inspection.vin || "N/A"}</div>
            </div>
            <div class="field">
              <div class="field-label">License Plate</div>
              <div class="field-value">${inspection.license_plate || "N/A"}</div>
            </div>
            <div class="field">
              <div class="field-label">Trailer Type</div>
              <div class="field-value">${inspection.trailer_type || "N/A"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Inspection Details</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Inspection Date</div>
              <div class="field-value">${format(new Date(inspection.inspection_date), "MMMM d, yyyy h:mm a")}</div>
            </div>
            <div class="field">
              <div class="field-label">Inspector</div>
              <div class="field-value">${inspection.inspector_name || "Unknown"}</div>
            </div>
            <div class="field">
              <div class="field-label">Status</div>
              <div class="field-value">${inspection.customer_acknowledged ? "Customer Signed" : inspection.status}</div>
            </div>
            <div class="field">
              <div class="field-label">Customer Acknowledged</div>
              <div class="field-value">${inspection.customer_acknowledged_at ? format(new Date(inspection.customer_acknowledged_at), "MMMM d, yyyy h:mm a") : "Pending"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Inspection Checklist</div>
          <div class="checklist">
            ${checklistItems.map((item) => `
              <div class="checklist-item">
                <span class="check ${item.value ? "passed" : ""}">${item.value ? "✓" : ""}</span>
                ${item.label}
              </div>
            `).join("")}
          </div>
        </div>

        ${inspection.customer_name ? `
        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Customer Name</div>
              <div class="field-value">${inspection.customer_name}</div>
            </div>
            <div class="field">
              <div class="field-label">Company</div>
              <div class="field-value">${inspection.customer_company_name || "N/A"}</div>
            </div>
            <div class="field">
              <div class="field-label">Signer Name</div>
              <div class="field-value">${inspection.customer_signer_name || "N/A"}</div>
            </div>
          </div>
        </div>
        ` : ""}

        <div class="signatures">
          <div class="signature-box">
            ${inspection.inspector_signature ? `<img src="${inspection.inspector_signature}" alt="Inspector Signature" />` : "<p>No signature</p>"}
            <div class="signature-label">Inspector Signature</div>
          </div>
          <div class="signature-box">
            ${inspection.customer_signature ? `<img src="${inspection.customer_signature}" alt="Customer Signature" />` : "<p>Pending customer signature</p>"}
            <div class="signature-label">Customer Signature</div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${format(new Date(), "MMMM d, yyyy")} | CRUMS Leasing</p>
          <p>This document certifies the DOT inspection was performed on the above trailer.</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
              <h1 className="text-2xl font-bold text-foreground">DOT Inspections</h1>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "in_progress" ? "ring-2 ring-yellow-500" : ""}`}
                onClick={() => setStatusFilter("in_progress")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "completed" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setStatusFilter("completed")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "customer_acknowledged" ? "ring-2 ring-green-500" : ""}`}
                onClick={() => setStatusFilter("customer_acknowledged")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customer Signed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.customerSigned}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by trailer number, VIN, inspector, or customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Awaiting Customer</SelectItem>
                      <SelectItem value="customer_acknowledged">Customer Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trailer</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInspections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No inspections found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{inspection.trailer_number}</div>
                                <div className="text-xs text-muted-foreground">{inspection.trailer_type || "N/A"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{inspection.inspector_name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(inspection.inspection_date), "MMM d, yyyy")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {inspection.customer_name ? (
                              <div>
                                <div className="font-medium">{inspection.customer_name}</div>
                                <div className="text-xs text-muted-foreground">{inspection.customer_company_name}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(inspection)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleViewDetails(inspection)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadPDF(inspection)}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              DOT Inspection Details
            </DialogTitle>
          </DialogHeader>

          {selectedInspection && (
            <div className="space-y-6">
              {/* Trailer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trailer Number</p>
                  <p className="font-medium">{selectedInspection.trailer_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-medium">{selectedInspection.vin || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{selectedInspection.license_plate || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedInspection.trailer_type || "N/A"}</p>
                </div>
              </div>

              {/* Inspector Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Inspection Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Inspector</p>
                    <p className="font-medium">{selectedInspection.inspector_name || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(selectedInspection.inspection_date), "MMM d, yyyy h:mm a")}</p>
                  </div>
                </div>
              </div>

              {/* Checklist Summary */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Checklist Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Brakes Operational", value: selectedInspection.brakes_operational },
                    { label: "Tires Tread Depth", value: selectedInspection.tires_tread_depth },
                    { label: "Lights Operational", value: selectedInspection.brake_lights_operational },
                    { label: "Frame No Cracks", value: selectedInspection.frame_no_cracks },
                    { label: "Rear Doors Operational", value: selectedInspection.rear_doors_operational },
                    { label: "DOT Reflective Tape", value: selectedInspection.dot_reflective_tape_present },
                    { label: "DOT Release Confirmed", value: selectedInspection.dot_release_confirmed },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.value ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Signatures</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Inspector Signature</p>
                    {selectedInspection.inspector_signature ? (
                      <img
                        src={selectedInspection.inspector_signature}
                        alt="Inspector signature"
                        className="h-16 border rounded p-1 bg-white"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not signed</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Customer Signature</p>
                    {selectedInspection.customer_signature ? (
                      <img
                        src={selectedInspection.customer_signature}
                        alt="Customer signature"
                        className="h-16 border rounded p-1 bg-white"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Pending</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 flex justify-end">
                <Button onClick={() => handleDownloadPDF(selectedInspection)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
