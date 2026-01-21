import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Loader2, 
  LogIn, 
  LogOut,
  Clock,
  Users,
  Shield,
  Wrench,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  session_duration_seconds: number | null;
  created_at: string;
}

interface ImpersonationLog {
  id: string;
  admin_id: string;
  admin_email: string;
  target_id: string;
  target_email: string;
  target_role: string;
  event_type: 'impersonation_start' | 'impersonation_end';
  created_at: string;
}

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [impersonationSearch, setImpersonationSearch] = useState("");

  const { data: logs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data as ActivityLog[];
    }
  });

  // Filter impersonation logs from activity logs
  const impersonationLogs: ImpersonationLog[] = logs
    .filter(log => log.event_type === 'impersonation_start' || log.event_type === 'impersonation_end')
    .map(log => {
      // Parse the user_agent field which contains our metadata as JSON
      let targetInfo = { id: '', email: '', role: '' };
      try {
        if (log.user_agent) {
          const parsed = JSON.parse(log.user_agent);
          targetInfo = {
            id: parsed.target_user_id || '',
            email: parsed.target_email || '',
            role: parsed.target_role || ''
          };
        }
      } catch {
        // If parsing fails, leave as empty
      }
      
      return {
        id: log.id,
        admin_id: log.user_id,
        admin_email: log.email,
        target_id: targetInfo.id,
        target_email: targetInfo.email,
        target_role: targetInfo.role,
        event_type: log.event_type as 'impersonation_start' | 'impersonation_end',
        created_at: log.created_at
      };
    });

  // Filter out impersonation events from regular logs
  const regularLogs = logs.filter(
    log => log.event_type !== 'impersonation_start' && log.event_type !== 'impersonation_end'
  );

  const filteredLogs = regularLogs.filter((log) => {
    const matchesSearch = 
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesEvent = eventFilter === "all" || log.event_type === eventFilter;
    const matchesRole = roleFilter === "all" || log.role === roleFilter;
    
    return matchesSearch && matchesEvent && matchesRole;
  });

  const filteredImpersonationLogs = impersonationLogs.filter((log) => {
    const search = impersonationSearch.toLowerCase();
    return (
      log.admin_email.toLowerCase().includes(search) ||
      log.target_email.toLowerCase().includes(search) ||
      log.target_role.toLowerCase().includes(search)
    );
  });

  const getEventBadge = (eventType: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      login: { variant: "default", icon: <LogIn className="h-3 w-3 mr-1" /> },
      logout: { variant: "secondary", icon: <LogOut className="h-3 w-3 mr-1" /> },
      session_start: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      session_end: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = config[eventType] || { variant: "outline" as const, icon: null };
    return (
      <Badge variant={variant} className="flex items-center w-fit">
        {icon}
        {eventType}
      </Badge>
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <span className="text-muted-foreground">—</span>;
    
    const config: Record<string, { variant: "default" | "secondary" | "outline"; icon: React.ReactNode }> = {
      admin: { variant: "default", icon: <Shield className="h-3 w-3 mr-1" /> },
      customer: { variant: "secondary", icon: <Users className="h-3 w-3 mr-1" /> },
      mechanic: { variant: "outline", icon: <Wrench className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = config[role] || { variant: "outline" as const, icon: null };
    return (
      <Badge variant={variant} className="flex items-center w-fit">
        {icon}
        {role}
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Stats
  const todayLogins = regularLogs.filter(l => {
    const today = new Date();
    const logDate = new Date(l.created_at);
    return l.event_type === 'login' && 
      logDate.toDateString() === today.toDateString();
  }).length;

  const uniqueUsers = new Set(regularLogs.map(l => l.user_id)).size;
  const adminLogins = regularLogs.filter(l => l.role === 'admin' && l.event_type === 'login').length;
  const customerLogins = regularLogs.filter(l => l.role === 'customer' && l.event_type === 'login').length;

  // Impersonation stats
  const totalImpersonations = impersonationLogs.filter(l => l.event_type === 'impersonation_start').length;
  const todayImpersonations = impersonationLogs.filter(l => {
    const today = new Date();
    const logDate = new Date(l.created_at);
    return l.event_type === 'impersonation_start' && 
      logDate.toDateString() === today.toDateString();
  }).length;
  const uniqueAdminsImpersonating = new Set(
    impersonationLogs.filter(l => l.event_type === 'impersonation_start').map(l => l.admin_id)
  ).size;

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Activity Logs
                </TabsTrigger>
                <TabsTrigger value="impersonation" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Impersonation Audit
                  {totalImpersonations > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {totalImpersonations}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Activity Logs Tab */}
              <TabsContent value="activity" className="space-y-6">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${eventFilter === 'login' && roleFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => { setEventFilter('login'); setRoleFilter('all'); }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Today's Logins
                      </CardTitle>
                      <LogIn className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{todayLogins}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Login events today
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${eventFilter === 'all' && roleFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => { setEventFilter('all'); setRoleFilter('all'); }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Unique Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{uniqueUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Users with activity
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'admin' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => { setEventFilter('login'); setRoleFilter('admin'); }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Admin Logins
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adminLogins}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total admin logins
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'customer' ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => { setEventFilter('login'); setRoleFilter('customer'); }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Customer Logins
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerLogins}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total customer logins
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or IP address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Logs Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity History ({filteredLogs.length})</CardTitle>
                    <CardDescription>Login and logout history for all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {format(new Date(log.created_at), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(log.created_at), "h:mm:ss a")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{log.email}</TableCell>
                              <TableCell>{getRoleBadge(log.role)}</TableCell>
                              <TableCell>{getEventBadge(log.event_type)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDuration(log.session_duration_seconds)}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {log.ip_address || "—"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Impersonation Audit Tab */}
              <TabsContent value="impersonation" className="space-y-6">
                {/* Impersonation Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Today's Impersonations
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{todayImpersonations}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        "View As" sessions today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Impersonations
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalImpersonations}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All time "View As" sessions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Admins Using Feature
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{uniqueAdminsImpersonating}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unique admins impersonating
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by admin or target email..."
                    value={impersonationSearch}
                    onChange={(e) => setImpersonationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Impersonation Logs Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Impersonation Audit Log ({filteredImpersonationLogs.length})
                    </CardTitle>
                    <CardDescription>
                      Track when admins use the "View As" feature to impersonate other users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target User</TableHead>
                          <TableHead>Target Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredImpersonationLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No impersonation logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredImpersonationLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {format(new Date(log.created_at), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(log.created_at), "h:mm:ss a")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{log.admin_email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {log.event_type === 'impersonation_start' ? (
                                  <Badge variant="default" className="flex items-center w-fit bg-warning text-warning-foreground hover:bg-warning/90">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Started Viewing
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="flex items-center w-fit">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Stopped Viewing
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {log.target_email || "—"}
                              </TableCell>
                              <TableCell>
                                {getRoleBadge(log.target_role)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}