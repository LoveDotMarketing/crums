import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Globe,
  TrendingUp,
  Users,
  Loader2,
  Mail,
  ExternalLink,
  CalendarIcon,
  Eye,
  UserPlus
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface ContactSubmission {
  id: string;
  email: string | null;
  created_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  current_page: string | null;
  is_spam: boolean | null;
}

interface SourceCount {
  source: string;
  count: number;
}

interface MediumCount {
  medium: string;
  count: number;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
];

type DateRangePreset = "7" | "30" | "90" | "365" | "custom";
type TrendGranularity = "daily" | "weekly";

export default function LeadSources() {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("daily");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  // Calculate effective date range
  const getDateRange = () => {
    if (dateRangePreset === "custom") {
      return {
        start: customStartDate ? startOfDay(customStartDate) : subDays(new Date(), 30),
        end: customEndDate ? endOfDay(customEndDate) : new Date(),
      };
    }
    return {
      start: subDays(new Date(), parseInt(dateRangePreset)),
      end: new Date(),
    };
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Fetch contact submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["lead-sources", dateRangePreset, customStartDate?.toISOString(), customEndDate?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("is_spam", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ContactSubmission[];
    },
  });

  // Fetch registration sources from customer_applications
  const { data: registrations = [] } = useQuery({
    queryKey: ["registration-sources", dateRangePreset, customStartDate?.toISOString(), customEndDate?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id, created_at, utm_source, utm_medium, utm_campaign, referrer, landing_page, profiles!customer_applications_user_id_fkey(email, first_name, last_name)")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate source counts
  const sourceCounts: SourceCount[] = submissions.reduce((acc: SourceCount[], sub) => {
    const source = sub.utm_source || getSourceFromReferrer(sub.referrer) || "Direct";
    const existing = acc.find(s => s.source === source);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ source, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Calculate medium counts
  const mediumCounts: MediumCount[] = submissions.reduce((acc: MediumCount[], sub) => {
    const medium = sub.utm_medium || getMediumFromReferrer(sub.referrer) || "direct";
    const existing = acc.find(m => m.medium === medium);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ medium, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Calculate campaign counts
  const campaignCounts = submissions.reduce((acc: { campaign: string; count: number }[], sub) => {
    if (!sub.utm_campaign) return acc;
    const existing = acc.find(c => c.campaign === sub.utm_campaign);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ campaign: sub.utm_campaign, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const totalLeads = submissions.length;
  const paidLeads = submissions.filter(s => s.utm_medium === "cpc" || s.utm_medium === "ppc" || s.utm_medium === "paid").length;
  const organicLeads = submissions.filter(s => s.utm_medium === "organic" || (!s.utm_medium && s.referrer?.includes("google"))).length;

  // Registration source stats
  const totalRegistrations = registrations.length;
  const regSourceCounts = registrations.reduce((acc: { source: string; count: number }[], reg: any) => {
    let source = "Direct";
    if (reg.utm_source) {
      const isPaid = reg.utm_medium === "cpc" || reg.utm_medium === "ppc" || reg.utm_medium === "paid";
      source = `${reg.utm_source}${isPaid ? " (paid)" : reg.utm_medium === "organic" ? " (organic)" : ""}`;
    } else if (reg.referrer) {
      try {
        const hostname = new URL(reg.referrer).hostname.replace("www.", "");
        if (hostname.includes("google")) source = "Google (organic)";
        else if (hostname.includes("facebook")) source = "Facebook";
        else if (hostname.includes("linkedin")) source = "LinkedIn";
        else source = hostname;
      } catch { source = "Referral"; }
    }
    const existing = acc.find(s => s.source === source);
    if (existing) existing.count++;
    else acc.push({ source, count: 1 });
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Calculate trend data based on granularity
  const trendData = (() => {
    if (submissions.length === 0) return [];
    
    if (trendGranularity === "daily") {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const count = submissions.filter(s => {
          if (!s.created_at) return false;
          const createdAt = new Date(s.created_at);
          return isWithinInterval(createdAt, { start: dayStart, end: dayEnd });
        }).length;
        return {
          date: format(day, "MMM d"),
          fullDate: format(day, "MMM d, yyyy"),
          leads: count,
        };
      });
    } else {
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });
      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        const count = submissions.filter(s => {
          if (!s.created_at) return false;
          const createdAt = new Date(s.created_at);
          return isWithinInterval(createdAt, { start: weekStart, end: weekEnd > endDate ? endDate : weekEnd });
        }).length;
        return {
          date: format(weekStart, "MMM d"),
          fullDate: `${format(weekStart, "MMM d")} - ${format(weekEnd > endDate ? endDate : weekEnd, "MMM d, yyyy")}`,
          leads: count,
        };
      });
    }
  })();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Lead Sources</h1>
              <div className="flex gap-3 flex-wrap items-center">
                <Select 
                  value={dateRangePreset} 
                  onValueChange={(value: DateRangePreset) => setDateRangePreset(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>

                {dateRangePreset === "custom" && (
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !customStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          disabled={(date) => date > new Date() || (customEndDate ? date > customEndDate : false)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-muted-foreground">to</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !customEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          disabled={(date) => date > new Date() || (customStartDate ? date < customStartDate : false)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Summary Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Leads
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{totalLeads}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dateRangePreset === "custom" 
                          ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
                          : `Last ${dateRangePreset} days`
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paid Traffic
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-primary">{paidLeads}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalLeads > 0 ? ((paidLeads / totalLeads) * 100).toFixed(1) : 0}% of leads
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Organic Traffic
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">{organicLeads}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalLeads > 0 ? ((organicLeads / totalLeads) * 100).toFixed(1) : 0}% of leads
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sources
                  </CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{sourceCounts.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unique traffic sources
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Trend</CardTitle>
                  <CardDescription>Leads over time</CardDescription>
                </div>
                <Select 
                  value={trendGranularity} 
                  onValueChange={(value: TrendGranularity) => setTrendGranularity(value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No trend data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
                                <p className="text-sm text-primary font-bold">{payload[0].value} leads</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#leadGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Source Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Distribution by traffic source</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : sourceCounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No lead data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sourceCounts}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="source"
                        >
                          {sourceCounts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Medium Distribution Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Medium</CardTitle>
                  <CardDescription>Leads by acquisition channel</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : mediumCounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No lead data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mediumCounts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="medium" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Campaigns Table */}
            {campaignCounts.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Leads by UTM campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignCounts.map((campaign) => (
                        <TableRow key={campaign.campaign}>
                          <TableCell className="font-medium">{campaign.campaign}</TableCell>
                          <TableCell className="text-right">{campaign.count}</TableCell>
                          <TableCell className="text-right">
                            {((campaign.count / totalLeads) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Registration Sources */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Registration Sources
                </CardTitle>
                <CardDescription>
                  Where signups on /get-started came from ({totalRegistrations} registrations)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalRegistrations === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No registrations with source data yet</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Source breakdown */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">By Source</h4>
                      <div className="space-y-2">
                        {regSourceCounts.map((s) => (
                          <div key={s.source} className="flex items-center justify-between">
                            <Badge variant={s.source.includes("paid") ? "default" : s.source === "Direct" ? "outline" : "secondary"} className="text-xs capitalize">
                              {s.source}
                            </Badge>
                            <span className="text-sm font-medium">{s.count} ({((s.count / totalRegistrations) * 100).toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent registrations */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Recent Registrations</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {registrations.slice(0, 10).map((reg: any) => {
                          let source = "Direct";
                          if (reg.utm_source) {
                            const isPaid = reg.utm_medium === "cpc" || reg.utm_medium === "ppc" || reg.utm_medium === "paid";
                            source = `${reg.utm_source}${isPaid ? " (paid)" : ""}`;
                          } else if (reg.referrer) {
                            try { source = new URL(reg.referrer).hostname.replace("www.", ""); } catch {}
                          }
                          return (
                            <div key={reg.id} className="flex items-center justify-between text-sm border-b border-border pb-1">
                              <div className="truncate max-w-[180px]">
                                <span className="font-medium">{reg.profiles?.first_name || reg.profiles?.email || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">{source}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {reg.created_at ? format(new Date(reg.created_at), "MMM d") : ""}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leads List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact Form Submissions</CardTitle>
                  <CardDescription>
                    {dateRangePreset === "custom" 
                      ? `All leads from ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}`
                      : `All leads from the last ${dateRangePreset} days with source data`
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No leads yet</p>
                    <p className="text-sm">Contact form submissions will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Medium</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Landing Page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => {
                        const source = submission.utm_source || getSourceFromReferrer(submission.referrer) || "Direct";
                        const medium = submission.utm_medium || getMediumFromReferrer(submission.referrer) || "direct";
                        
                        return (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedSubmission(submission)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {submission.created_at 
                                ? format(new Date(submission.created_at), "MMM d, yyyy h:mm a")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {submission.email || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={source === "Direct" ? "secondary" : "default"}>
                                {source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  medium === "cpc" || medium === "ppc" || medium === "paid" 
                                    ? "default" 
                                    : medium === "organic" 
                                      ? "secondary" 
                                      : "outline"
                                }
                              >
                                {medium}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {submission.utm_campaign || "—"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                              {submission.landing_page || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Contact Detail Sheet */}
      <Sheet open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Contact Details</SheetTitle>
            <SheetDescription>
              Full information for this lead submission
            </SheetDescription>
          </SheetHeader>
          
          {selectedSubmission && (
            <div className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedSubmission.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">
                      {selectedSubmission.created_at 
                        ? format(new Date(selectedSubmission.created_at), "MMM d, yyyy 'at' h:mm a")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* UTM Parameters */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Attribution (UTM)</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant={selectedSubmission.utm_source ? "default" : "secondary"}>
                      {selectedSubmission.utm_source || getSourceFromReferrer(selectedSubmission.referrer) || "Direct"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Medium</span>
                    <Badge variant="outline">
                      {selectedSubmission.utm_medium || getMediumFromReferrer(selectedSubmission.referrer) || "direct"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Campaign</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {selectedSubmission.utm_campaign || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {selectedSubmission.utm_term || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Content</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {selectedSubmission.utm_content || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Page Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Journey</h3>
                <div className="grid gap-2">
                  <div className="py-2 border-b border-border">
                    <span className="text-muted-foreground block mb-1">Referrer</span>
                    <span className="font-medium text-sm break-all">
                      {selectedSubmission.referrer || "Direct visit"}
                    </span>
                  </div>
                  <div className="py-2 border-b border-border">
                    <span className="text-muted-foreground block mb-1">Landing Page</span>
                    <span className="font-medium text-sm break-all">
                      {selectedSubmission.landing_page || "—"}
                    </span>
                  </div>
                  <div className="py-2 border-b border-border">
                    <span className="text-muted-foreground block mb-1">Conversion Page</span>
                    <span className="font-medium text-sm break-all">
                      {selectedSubmission.current_page || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                {selectedSubmission.email && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = `mailto:${selectedSubmission.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email {selectedSubmission.email}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}

// Helper function to extract source from referrer URL
function getSourceFromReferrer(referrer: string | null, landingPage?: string | null): string | null {
  // /lp/ pages or syndicatedsearch = google
  if (landingPage?.startsWith('/lp/')) return "google";
  if (referrer?.toLowerCase().includes('syndicatedsearch')) return "google";

  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes("google")) return "google";
    if (hostname.includes("bing")) return "bing";
    if (hostname.includes("yahoo")) return "yahoo";
    if (hostname.includes("facebook") || hostname.includes("fb.")) return "facebook";
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("youtube")) return "youtube";
    if (hostname.includes("tiktok")) return "tiktok";
    
    return hostname.replace("www.", "");
  } catch {
    return null;
  }
}

// Helper function to infer medium from referrer URL
function getMediumFromReferrer(referrer: string | null, landingPage?: string | null): string | null {
  // /lp/ pages or syndicatedsearch = cpc (paid)
  if (landingPage?.startsWith('/lp/')) return "cpc";
  if (referrer?.toLowerCase().includes('syndicatedsearch')) return "cpc";

  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes("google") || hostname.includes("bing") || hostname.includes("yahoo")) {
      return "organic";
    }
    if (hostname.includes("facebook") || hostname.includes("linkedin") || 
        hostname.includes("twitter") || hostname.includes("instagram") || 
        hostname.includes("tiktok")) {
      return "social";
    }
    
    return "referral";
  } catch {
    return null;
  }
}
