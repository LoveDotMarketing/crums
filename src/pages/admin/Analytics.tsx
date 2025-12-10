import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RedirectFormDialog } from "@/components/admin/RedirectFormDialog";
import { useAnalytics, DateRange } from "@/hooks/useAnalytics";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Users, 
  Eye, 
  MousePointerClick, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ArrowRightLeft,
  Plus,
  Calendar
} from "lucide-react";

interface ErrorLog {
  id: string;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Redirect {
  id: string;
  source_path: string;
  target_path: string;
  is_active: boolean;
  hit_count: number;
  created_at: string;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export default function Analytics() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(true);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [selectedErrorUrl, setSelectedErrorUrl] = useState("");
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const { toast } = useToast();
  
  const { data: analyticsData, loading: analyticsLoading, dateRange, changeDateRange, fetchAnalytics } = useAnalytics();

  const fetchErrorLogs = async () => {
    setErrorLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setErrorLogs(data || []);
    } catch (error) {
      console.error("Error fetching error logs:", error);
    } finally {
      setErrorLogsLoading(false);
    }
  };

  const fetchRedirects = async () => {
    setRedirectsLoading(true);
    try {
      const { data, error } = await supabase
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error("Error fetching redirects:", error);
    } finally {
      setRedirectsLoading(false);
    }
  };

  const deleteErrorLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from("error_logs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setErrorLogs(prev => prev.filter(log => log.id !== id));
      toast({ title: "Error log deleted" });
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const clearAllErrorLogs = async () => {
    try {
      const { error } = await supabase
        .from("error_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (error) throw error;
      
      setErrorLogs([]);
      toast({ title: "All error logs cleared" });
    } catch (error) {
      toast({ title: "Failed to clear logs", variant: "destructive" });
    }
  };

  const toggleRedirectActive = async (redirect: Redirect) => {
    try {
      const { error } = await supabase
        .from("redirects")
        .update({ is_active: !redirect.is_active })
        .eq("id", redirect.id);
      
      if (error) throw error;
      
      setRedirects(prev => prev.map(r => 
        r.id === redirect.id ? { ...r, is_active: !r.is_active } : r
      ));
      toast({ title: `Redirect ${!redirect.is_active ? "enabled" : "disabled"}` });
    } catch (error) {
      toast({ title: "Failed to update redirect", variant: "destructive" });
    }
  };

  const deleteRedirect = async (id: string) => {
    try {
      const { error } = await supabase
        .from("redirects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setRedirects(prev => prev.filter(r => r.id !== id));
      toast({ title: "Redirect deleted" });
    } catch (error) {
      toast({ title: "Failed to delete redirect", variant: "destructive" });
    }
  };

  const handleAddRedirect = (url: string) => {
    setSelectedErrorUrl(url);
    setEditingRedirect(null);
    setRedirectDialogOpen(true);
  };

  const handleEditRedirect = (redirect: Redirect) => {
    setSelectedErrorUrl("");
    setEditingRedirect(redirect);
    setRedirectDialogOpen(true);
  };

  useEffect(() => {
    fetchErrorLogs();
    fetchRedirects();
    fetchAnalytics(dateRange);
  }, []);

  // Group 404 errors by URL
  const groupedErrors = errorLogs.reduce((acc, log) => {
    const existing = acc.find(e => e.url === log.url);
    if (existing) {
      existing.count++;
      if (new Date(log.created_at) > new Date(existing.lastOccurrence)) {
        existing.lastOccurrence = log.created_at;
      }
    } else {
      acc.push({
        url: log.url,
        count: 1,
        lastOccurrence: log.created_at,
        referrer: log.referrer,
      });
    }
    return acc;
  }, [] as { url: string; count: number; lastOccurrence: string; referrer: string | null }[])
    .sort((a, b) => b.count - a.count);

  // Check if a URL already has a redirect
  const hasRedirect = (url: string) => redirects.some(r => r.source_path === url);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const handleRefresh = () => {
    fetchAnalytics(dateRange);
    toast({ title: "Analytics refreshed" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Website Analytics</h1>
                <p className="text-muted-foreground">Traffic insights and 404 error tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={dateRange === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => changeDateRange(option.value)}
                    className="h-8"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={analyticsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{analyticsData?.visitors.toLocaleString() || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Pageviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{analyticsData?.pageviews.toLocaleString() || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Pages/Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{analyticsData?.pagesPerVisit.toFixed(2) || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Bounce Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{analyticsData?.bounceRate || 0}%</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{formatDuration(analyticsData?.avgSessionDuration || 0)}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Traffic Trend Chart */}
            {analyticsData?.dailyData && analyticsData.dailyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Traffic Trend
                  </CardTitle>
                  <CardDescription>Daily visitors and pageviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analyticsData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="visitors" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                          name="Visitors"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pageviews" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          dot={false}
                          name="Pageviews"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Pages */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead className="text-right">Visitors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.topPages.slice(0, 10).map((page) => (
                          <TableRow key={page.path}>
                            <TableCell className="font-mono text-sm">{page.path}</TableCell>
                            <TableCell className="text-right">{page.visitors.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Sources & Devices */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analyticsData?.trafficSources.map((source) => (
                          <div key={source.source} className="flex items-center justify-between">
                            <span className="text-sm">{source.source}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${source.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-10 text-right">{source.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Devices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analyticsData?.devices.map((device) => (
                          <div key={device.device} className="flex items-center justify-between">
                            <span className="text-sm">{device.device}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${device.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-10 text-right">{device.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {analyticsData?.countries.slice(0, 5).map((country) => (
                          <div key={country.country} className="flex items-center justify-between">
                            <span className="text-sm">{country.country}</span>
                            <Badge variant="secondary">{country.percentage}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Active Redirects Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                      Active Redirects
                    </CardTitle>
                    <CardDescription>URL redirects to fix broken links</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => handleAddRedirect("")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Redirect
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {redirectsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : redirects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No redirects configured</p>
                    <p className="text-sm">Add redirects from the 404 errors below</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead className="text-center">Hits</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redirects.map((redirect) => (
                        <TableRow key={redirect.id}>
                          <TableCell className="font-mono text-sm">{redirect.source_path}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{redirect.target_path}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{redirect.hit_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={redirect.is_active}
                              onCheckedChange={() => toggleRedirectActive(redirect)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRedirect(redirect)}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteRedirect(redirect.id)}
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
              </CardContent>
            </Card>

            {/* 404 Errors Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      404 Errors
                    </CardTitle>
                    <CardDescription>Broken links and missing pages</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchErrorLogs}
                      disabled={errorLogsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${errorLogsLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    {errorLogs.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllErrorLogs}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {errorLogsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : groupedErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No 404 errors recorded</p>
                    <p className="text-sm">Errors will appear here when users hit missing pages</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                        <TableHead>Last Occurrence</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedErrors.map((error) => (
                        <TableRow key={error.url}>
                          <TableCell className="font-mono text-sm">{error.url}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={error.count > 5 ? "destructive" : "secondary"}>
                              {error.count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(error.lastOccurrence).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {error.referrer || "-"}
                          </TableCell>
                          <TableCell>
                            {!hasRedirect(error.url) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddRedirect(error.url)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Redirect
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <RedirectFormDialog
            open={redirectDialogOpen}
            onOpenChange={setRedirectDialogOpen}
            sourceUrl={selectedErrorUrl}
            redirect={editingRedirect}
            onSuccess={() => {
              fetchRedirects();
              setRedirectDialogOpen(false);
            }}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
