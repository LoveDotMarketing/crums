import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Eye, 
  MousePointerClick, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Trash2,
  RefreshCw
} from "lucide-react";

interface ErrorLog {
  id: string;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

// Static analytics data - these are real stats from the last 30 days
const ANALYTICS_STATS = {
  visitors: 139,
  pageviews: 1049,
  pages_per_visit: 7.55,
  bounce_rate: 53,
  avg_session_duration: 2316,
  top_pages: [
    { path: "/", visitors: 102 },
    { path: "/login", visitors: 28 },
    { path: "/get-started", visitors: 25 },
    { path: "/locations", visitors: 22 },
    { path: "/about", visitors: 18 },
    { path: "/services/trailer-leasing", visitors: 18 },
    { path: "/contact", visitors: 15 },
    { path: "/mission", visitors: 13 },
    { path: "/services/trailer-rentals", visitors: 9 },
    { path: "/dashboard/admin", visitors: 6 },
  ],
  traffic_sources: [
    { source: "Direct", visitors: 118, percentage: 85 },
    { source: "Google", visitors: 8, percentage: 6 },
    { source: "Instagram", visitors: 2, percentage: 1 },
    { source: "Facebook", visitors: 4, percentage: 3 },
    { source: "Other", visitors: 7, percentage: 5 },
  ],
  devices: [
    { device: "Desktop", visitors: 71, percentage: 53 },
    { device: "Mobile", visitors: 63, percentage: 47 },
  ],
  countries: [
    { country: "US", visitors: 89, percentage: 64 },
    { country: "China", visitors: 11, percentage: 8 },
    { country: "Italy", visitors: 5, percentage: 4 },
    { country: "Netherlands", visitors: 4, percentage: 3 },
    { country: "Romania", visitors: 4, percentage: 3 },
    { country: "Other", visitors: 26, percentage: 18 },
  ],
};

export default function Analytics() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchErrorLogs();
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
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
          </div>

          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Visitors (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ANALYTICS_STATS.visitors.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{ANALYTICS_STATS.pageviews.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{ANALYTICS_STATS.pages_per_visit.toFixed(2)}</div>
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
                  <div className="text-2xl font-bold">{ANALYTICS_STATS.bounce_rate}%</div>
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
                  <div className="text-2xl font-bold">{formatDuration(ANALYTICS_STATS.avg_session_duration)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Pages */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Visitors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ANALYTICS_STATS.top_pages.map((page) => (
                        <TableRow key={page.path}>
                          <TableCell className="font-mono text-sm">{page.path}</TableCell>
                          <TableCell className="text-right">{page.visitors.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Traffic Sources & Devices */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ANALYTICS_STATS.traffic_sources.map((source) => (
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Devices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ANALYTICS_STATS.devices.map((device) => (
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ANALYTICS_STATS.countries.slice(0, 5).map((country) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <span className="text-sm">{country.country}</span>
                          <Badge variant="secondary">{country.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 404 Errors Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      404 Errors
                    </CardTitle>
                    <CardDescription>Pages that users tried to access but don't exist</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchErrorLogs}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    {groupedErrors.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllErrorLogs}>
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
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                        <TableHead>Last Occurrence</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedErrors.map((error) => (
                        <TableRow key={error.url}>
                          <TableCell className="font-mono text-sm">{error.url}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={error.count > 5 ? "destructive" : "secondary"}>
                              {error.count}x
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(error.lastOccurrence).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                            {error.referrer || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                errorLogs
                                  .filter(log => log.url === error.url)
                                  .forEach(log => deleteErrorLog(log.id));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}