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
  Phone,
  Building2,
  ExternalLink
} from "lucide-react";
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
import { format, subDays } from "date-fns";
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
  Legend,
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

export default function LeadSources() {
  const [dateRange, setDateRange] = useState("30");

  const startDate = subDays(new Date(), parseInt(dateRange));

  // Fetch contact submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["lead-sources", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .eq("is_spam", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ContactSubmission[];
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Lead Sources</h1>
              <div className="flex gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
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
                        Last {dateRange} days
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

            {/* Leads List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact Form Submissions</CardTitle>
                  <CardDescription>
                    All leads from the last {dateRange} days with source data
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
    </SidebarProvider>
  );
}

// Helper function to extract source from referrer URL
function getSourceFromReferrer(referrer: string | null): string | null {
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
function getMediumFromReferrer(referrer: string | null): string | null {
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
