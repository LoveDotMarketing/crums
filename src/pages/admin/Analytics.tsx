import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RedirectFormDialog } from "@/components/admin/RedirectFormDialog";
import { 
  AlertTriangle,
  Trash2,
  RefreshCw,
  ArrowRightLeft,
  Plus,
  ExternalLink,
  BarChart3
} from "lucide-react";
import { GA4_DASHBOARD_URL } from "@/lib/analytics";

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

export default function Analytics() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(true);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [selectedErrorUrl, setSelectedErrorUrl] = useState("");
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Site Management</h1>
                <p className="text-muted-foreground">404 errors and URL redirects</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* GA4 Analytics Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Real-Time Analytics</CardTitle>
                      <CardDescription>View live traffic, conversions, and user behavior in Google Analytics</CardDescription>
                    </div>
                  </div>
                  <Button asChild size="lg">
                    <a href={GA4_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open GA4 Dashboard
                    </a>
                  </Button>
                </div>
              </CardHeader>
            </Card>

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
