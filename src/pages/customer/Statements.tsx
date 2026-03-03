import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { FileText, Download, Loader2 } from "lucide-react";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CustomerStatements = () => {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const { toast } = useToast();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: customerRecord } = useQuery({
    queryKey: ["customer-record-statements", currentEmail],
    queryFn: async () => {
      if (!currentEmail) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentEmail,
  });

  const { data: customerStatements = [], isLoading } = useQuery({
    queryKey: ["customer-statements", customerRecord?.id],
    queryFn: async () => {
      if (!customerRecord?.id) return [];
      const { data, error } = await (supabase as any)
        .from("customer_statements")
        .select("*")
        .eq("customer_id", customerRecord.id)
        .order("statement_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerRecord?.id,
  });

  const filteredStatements = yearFilter === "all"
    ? customerStatements
    : customerStatements.filter((s: any) => new Date(s.statement_date).getFullYear().toString() === yearFilter);

  const handleStatementDownload = async (statement: any) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isImpersonating && <Navigation />}
      <CustomerNav />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Statements & Tax Records</h1>
          <p className="text-muted-foreground mt-1">
            Your billing statements for tax and accounting purposes
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Statements
                </CardTitle>
                <CardDescription>
                  Download past billing statements as PDF
                </CardDescription>
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading statements...</p>
            ) : filteredStatements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(s.statement_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">{s.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {s.period_start && s.period_end
                          ? `${format(new Date(s.period_start), "MMM d")} – ${format(new Date(s.period_end), "MMM d, yyyy")}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        {formatCurrency(Number(s.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.file_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatementDownload(s)}
                            disabled={downloadingId === s.id}
                          >
                            {downloadingId === s.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            PDF
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No statements on file yet.{" "}
                  <span className="text-foreground">Contact us</span> if you need past records for tax purposes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerStatements;
