import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfYear, endOfYear } from "date-fns";
import { FileText, Download, CalendarIcon, DollarSign, Hash, CalendarDays } from "lucide-react";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DatePreset = "all" | "current_year" | "last_year" | "last_30" | "last_90" | "custom";

const CustomerStatements = () => {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;
  const [preset, setPreset] = useState<DatePreset>("all");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();

  const { data: customerRecord } = useQuery({
    queryKey: ["customer-record-statements", currentEmail],
    queryFn: async () => {
      if (!currentEmail) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name")
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
    if (!dateRange.start && !dateRange.end) return customerStatements;
    return customerStatements.filter((s: any) => {
      const d = new Date(s.statement_date);
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
  }, [customerStatements, dateRange]);

  const totalAmount = useMemo(
    () => filteredStatements.reduce((sum: number, s: any) => sum + Number(s.amount), 0),
    [filteredStatements]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const dateRangeLabel = useMemo(() => {
    if (preset === "all") return "All Time";
    if (dateRange.start && dateRange.end)
      return `${format(dateRange.start, "MMM d, yyyy")} – ${format(dateRange.end, "MMM d, yyyy")}`;
    if (dateRange.start) return `From ${format(dateRange.start, "MMM d, yyyy")}`;
    if (dateRange.end) return `Through ${format(dateRange.end, "MMM d, yyyy")}`;
    return "All Time";
  }, [preset, dateRange]);

  const handleCsvExport = () => {
    const headers = ["Date", "Description", "Period Start", "Period End", "Amount", "Source", "Notes"];
    const rows = filteredStatements.map((s: any) => [
      s.statement_date,
      `"${(s.description || "").replace(/"/g, '""')}"`,
      s.period_start || "",
      s.period_end || "",
      Number(s.amount).toFixed(2),
      s.source || "",
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const name = customerRecord?.full_name?.replace(/\s+/g, "-") || "customer";
    const rangeSuffix = preset === "all" ? "all-time" : preset.replace("_", "-");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statements-${name}-${rangeSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isImpersonating && <Navigation />}
      <CustomerNav />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statements & Tax Records</h1>
            <p className="text-muted-foreground mt-1">Your billing history for tax and accounting purposes</p>
          </div>
          {filteredStatements.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleCsvExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Charges</p>
                <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Line Items</p>
                <p className="text-lg font-semibold">{filteredStatements.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date Range</p>
                <p className="text-sm font-medium">{dateRangeLabel}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Billing Ledger
                </CardTitle>
                <CardDescription>All billing line items, newest first</CardDescription>
              </div>
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
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading statements...</p>
            ) : filteredStatements.length > 0 ? (
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStatements.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(s.statement_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{s.description}</div>
                          {s.notes && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">Note</span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">{s.notes}</TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {s.period_start && s.period_end
                            ? `${format(new Date(s.period_start), "MMM d")} – ${format(new Date(s.period_end), "MMM d, yyyy")}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.source === "stripe" ? "default" : "secondary"} className="text-xs capitalize">
                            {s.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatCurrency(Number(s.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TooltipProvider>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No statements found for this period.{" "}
                  <span className="text-foreground">Contact us</span> if you need records for tax purposes.
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
