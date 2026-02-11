import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, MessageSquare, Loader2, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WorkOrder {
  id: string;
  trailer_id: string;
  mechanic_id: string;
  repair_type: string;
  description: string;
  work_start_date: string;
  work_completion_date: string | null;
  labor_hours: number;
  labor_rate: number;
  travel_fee: number;
  labor_total: number;
  parts_total: number;
  grand_total: number;
  status: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  created_at: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
  item_type: string;
}

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-gray-500",
  submitted: "bg-yellow-500",
  under_review: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  needs_info: "bg-orange-500",
};

export default function AdminWorkOrders() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [trailerMap, setTrailerMap] = useState<Record<string, string>>({});
  const [mechanicMap, setMechanicMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("submitted");

  useEffect(() => {
    fetchWorkOrders();

    const channel = supabase
      .channel("work-orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "work_orders" }, () => fetchWorkOrders())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchWorkOrders = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkOrders(data || []);

      // Fetch trailer numbers
      const trailerIds = [...new Set((data || []).map((wo: WorkOrder) => wo.trailer_id))] as string[];
      if (trailerIds.length > 0) {
        const { data: tData } = await supabase.from("trailers").select("id, trailer_number").in("id", trailerIds);
        const map: Record<string, string> = {};
        tData?.forEach((t) => { map[t.id] = t.trailer_number; });
        setTrailerMap(map);
      }

      // Fetch mechanic names
      const mechIds = [...new Set((data || []).map((wo: WorkOrder) => wo.mechanic_id))] as string[];
      if (mechIds.length > 0) {
        const { data: pData } = await supabase.from("profiles").select("id, first_name, last_name").in("id", mechIds);
        const map: Record<string, string> = {};
        pData?.forEach((p) => { map[p.id] = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Mechanic"; });
        setMechanicMap(map);
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast.error("Failed to load work orders");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (wo: WorkOrder) => {
    setSelectedWO(wo);
    setApprovalNotes(wo.approval_notes || "");
    setLoadingItems(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("work_order_line_items")
        .select("*")
        .eq("work_order_id", wo.id)
        .order("created_at");
      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error("Error fetching line items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAction = async (action: "approved" | "rejected" | "needs_info") => {
    if (!selectedWO || !user) return;
    setActionLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        status: action,
        approval_notes: approvalNotes || null,
      };
      if (action === "approved") {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("work_orders")
        .update(updateData)
        .eq("id", selectedWO.id);

      if (error) throw error;

      const labels = { approved: "Approved", rejected: "Rejected", needs_info: "Requested more info" };
      toast.success(`Work order ${labels[action].toLowerCase()}`);
      setSelectedWO(null);
      fetchWorkOrders();
    } catch (error) {
      console.error("Error updating work order:", error);
      toast.error("Failed to update work order");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = workOrders.filter((wo) =>
    statusFilter === "all" ? true : wo.status === statusFilter
  );

  const submittedCount = workOrders.filter((wo) => wo.status === "submitted").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Work Orders</h1>
                {submittedCount > 0 && (
                  <Badge variant="destructive">{submittedCount} awaiting review</Badge>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { value: "submitted", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "needs_info", label: "Needs Info" },
                { value: "in_progress", label: "Drafts" },
                { value: "all", label: "All" },
              ].map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No work orders in this category</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trailer</TableHead>
                      <TableHead>Mechanic</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((wo) => (
                      <TableRow key={wo.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(wo)}>
                        <TableCell className="font-medium">{trailerMap[wo.trailer_id] || "—"}</TableCell>
                        <TableCell>{mechanicMap[wo.mechanic_id] || "—"}</TableCell>
                        <TableCell>{wo.repair_type}</TableCell>
                        <TableCell>{format(new Date(wo.work_start_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">${wo.grand_total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[wo.status] || "bg-gray-500"} text-white`}>
                            {wo.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedWO} onOpenChange={(open) => !open && setSelectedWO(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedWO && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Work Order — {trailerMap[selectedWO.trailer_id] || "Trailer"}
                  <Badge className={`${STATUS_COLORS[selectedWO.status]} text-white`}>
                    {selectedWO.status.replace("_", " ")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Mechanic:</span> {mechanicMap[selectedWO.mechanic_id] || "—"}</div>
                  <div><span className="text-muted-foreground">Repair Type:</span> {selectedWO.repair_type}</div>
                  <div><span className="text-muted-foreground">Start:</span> {format(new Date(selectedWO.work_start_date), "MMM d, yyyy")}</div>
                  <div><span className="text-muted-foreground">Completion:</span> {selectedWO.work_completion_date ? format(new Date(selectedWO.work_completion_date), "MMM d, yyyy") : "—"}</div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedWO.description}</p>
                </div>

                <Separator />

                {/* Labor */}
                <div>
                  <h4 className="font-semibold mb-2">Labor</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>{selectedWO.labor_hours} hrs × ${selectedWO.labor_rate}/hr = <strong>${(selectedWO.labor_hours * selectedWO.labor_rate).toFixed(2)}</strong></div>
                    <div>Travel: <strong>${selectedWO.travel_fee.toFixed(2)}</strong></div>
                    <div className="text-right font-semibold">Labor Total: ${selectedWO.labor_total.toFixed(2)}</div>
                  </div>
                </div>

                <Separator />

                {/* Parts */}
                <div>
                  <h4 className="font-semibold mb-2">Parts</h4>
                  {loadingItems ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : lineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No parts listed</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Part</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.map((li) => (
                            <TableRow key={li.id}>
                              <TableCell>{li.description}</TableCell>
                              <TableCell className="text-right">{li.quantity}</TableCell>
                              <TableCell className="text-right">${li.unit_cost.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">${li.line_total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="text-right mt-2 text-sm">
                    Parts Total: <strong>${selectedWO.parts_total.toFixed(2)}</strong>
                  </div>
                </div>

                <Separator />

                {/* Grand Total */}
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">Grand Total</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">${selectedWO.grand_total.toFixed(2)}</span>
                </div>

                {/* Approval info */}
                {selectedWO.approved_at && (
                  <div className="text-xs text-muted-foreground">
                    Approved on {format(new Date(selectedWO.approved_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                )}

                {/* Actions for submitted orders */}
                {(selectedWO.status === "submitted" || selectedWO.status === "under_review") && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Notes (optional — required for rejection or info request)"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleAction("needs_info")}
                          disabled={actionLoading || !approvalNotes.trim()}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Request Info
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleAction("rejected")}
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          onClick={() => handleAction("approved")}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                          Approve
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
