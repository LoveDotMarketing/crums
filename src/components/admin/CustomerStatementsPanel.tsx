import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Download, Trash2, Loader2, FileText, Plus, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  open,
  onOpenChange,
  customerId,
  customerName,
}: CustomerStatementsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("view");
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [statementDate, setStatementDate] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async (statement: Statement) => {
      // Delete file from storage if it exists
      if (statement.file_url) {
        await supabase.storage
          .from("customer-documents")
          .remove([statement.file_url]);
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

  const handleDownload = async (statement: Statement) => {
    if (!statement.file_url) return;
    setDownloadingId(statement.id);
    try {
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(statement.file_url, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Error generating download link", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const resetForm = () => {
    setDescription("");
    setStatementDate("");
    setAmount("");
    setPeriodStart("");
    setPeriodEnd("");
    setNotes("");
    setPdfFile(null);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    if (!statementDate) {
      toast({ title: "Statement date is required", variant: "destructive" });
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      toast({ title: "Valid amount is required", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let fileUrl: string | null = null;

      // Upload PDF if provided
      if (pdfFile) {
        const timestamp = Date.now();
        const sanitized = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `statements/${customerId}/${timestamp}-${sanitized}`;
        const { error: uploadError } = await supabase.storage
          .from("customer-documents")
          .upload(storagePath, pdfFile, { upsert: false });
        if (uploadError) throw uploadError;
        fileUrl = storagePath;
      }

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
          file_url: fileUrl,
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
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

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
            <TabsContent value="view" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : statements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No statements on file for this customer.</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("add")}>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statements.map((s) => (
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
                          <div className="flex items-center justify-end gap-1">
                            {s.file_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownload(s)}
                                disabled={downloadingId === s.id}
                              >
                                {downloadingId === s.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            )}
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
                </Table>
              )}
            </TabsContent>

            {/* ── Add Statement ── */}
            <TabsContent value="add" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g. Monthly lease statement — January 2025"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="statement-date">
                      Statement Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="statement-date"
                      type="date"
                      value={statementDate}
                      onChange={(e) => setStatementDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period-start">Period Start (optional)</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period-end">Period End (optional)</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes for this statement..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-upload">PDF Statement (optional)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {pdfFile && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {pdfFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm} disabled={uploading}>
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Save Statement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!statementToDelete}
        onOpenChange={(open) => !open && setStatementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{statementToDelete?.description}"?{" "}
              {statementToDelete?.file_url && "The PDF file will also be removed. "}
              This action cannot be undone.
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
