import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Loader2, 
  FileText, 
  BookOpen, 
  Wrench,
  Database,
  Zap,
  Settings,
  TrendingUp,
  Layers,
  RefreshCw
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface ChangelogEntry {
  id: string;
  category: string;
  item_name: string;
  item_slug: string;
  item_url: string | null;
  action: string;
  date_recorded: string;
  month_year: string;
  notes: string | null;
  created_at: string;
}

interface ChartDataPoint {
  month: string;
  news: number;
  guide: number;
  tool: number;
  admin_feature: number;
  database_table: number;
  edge_function: number;
}

const categoryColors: Record<string, string> = {
  news: "hsl(var(--chart-1))",
  guide: "hsl(var(--chart-2))",
  tool: "hsl(var(--chart-3))",
  admin_feature: "hsl(var(--chart-4))",
  database_table: "hsl(var(--chart-5))",
  edge_function: "hsl(210, 70%, 50%)",
};

const categoryIcons: Record<string, typeof FileText> = {
  news: FileText,
  guide: BookOpen,
  tool: Wrench,
  admin_feature: Settings,
  database_table: Database,
  edge_function: Zap,
};

const categoryLabels: Record<string, string> = {
  news: "News",
  guide: "Guides",
  tool: "Tools",
  admin_feature: "Admin Features",
  database_table: "Database Tables",
  edge_function: "Edge Functions",
};

const actionColors: Record<string, string> = {
  added: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  removed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function DevelopmentTab() {
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: changelog = [], isLoading, refetch } = useQuery({
    queryKey: ["development-changelog", monthFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("development_changelog")
        .select("*")
        .order("date_recorded", { ascending: false });

      if (monthFilter !== "all") {
        query = query.eq("month_year", monthFilter);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ChangelogEntry[];
    },
  });

  // Get all entries for chart (unfiltered by month/category)
  const { data: allEntries = [] } = useQuery({
    queryKey: ["development-changelog-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("development_changelog")
        .select("*")
        .order("date_recorded", { ascending: false });

      if (error) throw error;
      return (data || []) as ChangelogEntry[];
    },
  });

  // Generate chart data grouped by month
  const chartData: ChartDataPoint[] = (() => {
    const monthMap = new Map<string, ChartDataPoint>();
    
    allEntries.forEach((entry) => {
      const month = entry.month_year;
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          month,
          news: 0,
          guide: 0,
          tool: 0,
          admin_feature: 0,
          database_table: 0,
          edge_function: 0,
        });
      }
      const data = monthMap.get(month)!;
      const category = entry.category as keyof Omit<ChartDataPoint, "month">;
      if (category in data) {
        data[category]++;
      }
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Get available months for filter
  const availableMonths = Array.from(new Set(allEntries.map(e => e.month_year))).sort().reverse();

  // Calculate summary stats
  const totalItems = allEntries.length;
  const contentCount = allEntries.filter(e => ["news", "guide", "tool"].includes(e.category)).length;
  const adminCount = allEntries.filter(e => ["admin_feature", "database_table", "edge_function"].includes(e.category)).length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await supabase.functions.invoke("sync-development-changelog");
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Synced ${response.data?.details?.newEntries || 0} new entries`);
      refetch();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync changelog");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Item", "Action", "URL", "Notes"];
    const rows = changelog.map(entry => [
      entry.date_recorded,
      categoryLabels[entry.category] || entry.category,
      entry.item_name,
      entry.action,
      entry.item_url || "",
      entry.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `development-changelog-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatMonthLabel = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), "MMM yyyy");
    } catch {
      return month;
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Overview Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Development Activity Overview
              </CardTitle>
              <CardDescription>
                Project development activity from November 2025 to present
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No activity data yet</p>
                <p className="text-sm">Click "Sync Now" to populate the changelog</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="newsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={categoryColors.news} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={categoryColors.news} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="guideGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={categoryColors.guide} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={categoryColors.guide} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="toolGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={categoryColors.tool} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={categoryColors.tool} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={categoryColors.admin_feature} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={categoryColors.admin_feature} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="dbGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={categoryColors.database_table} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={categoryColors.database_table} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonthLabel}
                  className="text-xs"
                />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{formatMonthLabel(label)}</p>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                              {categoryLabels[entry.dataKey as string] || entry.dataKey}:
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend 
                  formatter={(value) => categoryLabels[value] || value}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Area
                  type="monotone"
                  dataKey="news"
                  stackId="1"
                  stroke={categoryColors.news}
                  fill="url(#newsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="guide"
                  stackId="1"
                  stroke={categoryColors.guide}
                  fill="url(#guideGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="tool"
                  stackId="1"
                  stroke={categoryColors.tool}
                  fill="url(#toolGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="admin_feature"
                  stackId="1"
                  stroke={categoryColors.admin_feature}
                  fill="url(#adminGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="database_table"
                  stackId="1"
                  stroke={categoryColors.database_table}
                  fill="url(#dbGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{contentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              News, guides, tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Features Built
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Admin, DB, functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableMonths.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since Nov 2025
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Changelog Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Development Changelog</CardTitle>
            <CardDescription>
              Detailed log of all project changes
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="admin_feature">Admin Features</SelectItem>
                <SelectItem value="database_table">Database Tables</SelectItem>
                <SelectItem value="edge_function">Edge Functions</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : changelog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No changelog entries</p>
              <p className="text-sm">Click "Sync Now" to populate from content registries</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelog.map((entry) => {
                  const IconComponent = categoryIcons[entry.category] || FileText;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(entry.date_recorded), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1 w-fit"
                          style={{ 
                            borderColor: categoryColors[entry.category],
                            color: categoryColors[entry.category]
                          }}
                        >
                          <IconComponent className="h-3 w-3" />
                          {categoryLabels[entry.category] || entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.item_url ? (
                          <a 
                            href={entry.item_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {entry.item_name}
                          </a>
                        ) : (
                          <span>{entry.item_name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[entry.action] || ""}>
                          {entry.action}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
