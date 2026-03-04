import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfYear, endOfYear } from "date-fns";
import { Trash2, Loader2, FileText, Plus, Download, Save, CalendarIcon, DollarSign, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DatePreset = "all" | "current_year" | "last_year" | "last_30" | "last_90" | "custom";

interface CustomerStatementsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
}

interface Statement {
  id: string;
  customer_id: string;
  statement_date: string;
  period_start: string | null;
  period_end: string | null;
  amount: number;
  description: string;
  source: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export function CustomerStatementsPanel({
  open, onOpenChange, customerId, customerName,
}: CustomerStatementsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("view");
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null);
  const [preset, setPreset] = useState<DatePreset>("all");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();

  // Form state
  const [description, setDescription] = useState("");
  const [statementDate, setStatementDate] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ["customer-statements", customerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("customer_statements")
        .select("*")
        .eq("customer_id", customerId)
        .order("statement_date", { ascending: false });
      if (error) throw error;
      return (data || []) as Statement[];
    },
    enabled: open && !!customerId,
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "current_year":
        return { start: startOfYear(now), end: now };
      case "last_year":
        return { start: startOfYear(new Date(now.getFullYear() - 1, 0, 1)), end: endOfYear(new Date(now.getFullYear() - 1, 0, 1)) };
      case "last_30":
        return { start: subDays(now, 30), end: now };
      case "last_90":
        return { start: subDays(now, 90), end: now };
      case "custom":
        return { start: customStart, end: customEnd };
      default:
        return { start: undefined, end: undefined };
    }
  }, [preset, customStart, customEnd]);

  const filteredStatements = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return statements;
    return statements.filter((s) => {
      const d = new Date(s.statement_date);
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
  }, [statements, dateRange]);

  const totalAmount = useMemo(
    () => filteredStatements.reduce((s, st) => s + Number(st.amount), 0),
    [filteredStatements]
  );

  const deleteMutation = useMutation({
    mutationFn: async (statement: Statement) => {
      if (statement.file_url) {
        await supabase.storage.from("customer-documents").remove([statement.file_url]);
      }
      const { error } = await (supabase as any)
        .from("customer_statements")
        .delete()
        .eq("id", statement.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Statement deleted" });
      setStatementToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["customer-statements", customerId] });
    },
    onError: (err: Error) => {
      toast({ title: "Error deleting statement", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setDescription(""); setStatementDate(""); setAmount("");
    setPeriodStart(""); setPeriodEnd(""); setNotes("");
  };

  const handleSave = async () => {
    if (!description.trim()) { toast({ title: "Description is required", variant: "destructive" }); return; }
    if (!statementDate) { toast({ title: "Statement date is required", variant: "destructive" }); return; }
    if (!amount || isNaN(Number(amount))) { toast({ title: "Valid amount is required", variant: "destructive" }); return; }

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("customer_statements")
        .insert({
          customer_id: customerId,
          statement_date: statementDate,
          period_start: periodStart || null,
          period_end: periodEnd || null,
          amount: Number(amount),
          description: description.trim(),
          source: "manual",
          notes: notes.trim() || null,
        });
      if (error) throw error;

      toast({ title: "Statement added successfully" });
      resetForm();
      setActiveTab("view");
      queryClient.invalidateQueries({ queryKey: ["customer-statements", customerId] });
    } catch (err: any) {
      toast({ title: "Error saving statement", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  const handleCsvExport = () => {
    const headers = ["Date", "Description", "Period Start", "Period End", "Amount", "Source", "Notes"];
    const rows = filteredStatements.map((s) => [
      s.statement_date,
      `"${(s.description || "").replace(/"/g, '""')}"`,
      s.period_start || "",
      s.period_end || "",
      Number(s.amount).toFixed(2),
      s.source || "",
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const safeName = customerName.replace(/\s+/g, "-");
    const rangeSuffix = preset === "all" ? "all-time" : preset.replace("_", "-");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statements-${safeName}-${rangeSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statements — {customerName}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Statements</TabsTrigger>
              <TabsTrigger value="add">Add Statement</TabsTrigger>
            </TabsList>

            {/* ── View Statements ── */}
            <TabsContent value="view" className="mt-4 space-y-4">
              {/* Filters row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="current_year">Current Year</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="last_30">Last 30 Days</SelectItem>
                      <SelectItem value="last_90">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {preset === "custom" && (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("w-36 justify-start text-left font-normal", !customStart && "text-muted-foreground")}>
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {customStart ? format(customStart, "MMM d, yyyy") : "Start"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={customStart} onSelect={setCustomStart} className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("w-36 justify-start text-left font-normal", !customEnd && "text-muted-foreground")}>
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {customEnd ? format(customEnd, "MMM d, yyyy") : "End"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={customEnd} onSelect={setCustomEnd} className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={handleCsvExport} disabled={filteredStatements.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Summary chips */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="font-medium text-foreground">{filteredStatements.length}</span> items
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredStatements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {statements.length === 0
                      ? "No statements on file for this customer."
                      : "No statements found for this date range."}
                  </p>
                  {statements.length === 0 && (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("add")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Statement
                    </Button>
                  )}
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStatements.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(s.statement_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{s.description}</div>
                          {s.notes && (
                            <div className="text-xs text-muted-foreground mt-0.5">{s.notes}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {s.period_start && s.period_end
                            ? `${format(new Date(s.period_start), "MMM d")} – ${format(new Date(s.period_end), "MMM d, yyyy")}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatCurrency(Number(s.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.source === "stripe" ? "default" : "secondary"} className="text-xs capitalize">
                            {s.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setStatementToDelete(s)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </TabsContent>

            {/* ── Add Statement ── */}
            <TabsContent value="add" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Input id="description" placeholder="e.g. Monthly lease — January 2025" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="statement-date">Statement Date <span className="text-destructive">*</span></Label>
                    <Input id="statement-date" type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
                    <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period-start">Period Start (optional)</Label>
                    <Input id="period-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period-end">Period End (optional)</Label>
                    <Input id="period-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any additional notes..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm} disabled={saving}>Reset</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" />Save Statement</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!statementToDelete} onOpenChange={(open) => !open && setStatementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{statementToDelete?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => statementToDelete && deleteMutation.mutate(statementToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
