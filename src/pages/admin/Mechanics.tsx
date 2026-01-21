import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wrench, 
  Plus, 
  Search, 
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  active_jobs: number;
  completed_jobs: number;
  joined: string;
}

export default function Mechanics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    try {
      // Fetch all users with mechanic role
      const { data: mechanicRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mechanic');

      if (rolesError) throw rolesError;

      if (!mechanicRoles || mechanicRoles.length === 0) {
        setMechanics([]);
        setLoading(false);
        return;
      }

      const mechanicIds = mechanicRoles.map(r => r.user_id);

      // Fetch profiles for these mechanics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, created_at')
        .in('id', mechanicIds);

      if (profilesError) throw profilesError;

      // Fetch maintenance records counts for each mechanic
      const { data: maintenanceRecords, error: maintenanceError } = await supabase
        .from('maintenance_records')
        .select('mechanic_id, completed')
        .in('mechanic_id', mechanicIds);

      if (maintenanceError) throw maintenanceError;

      // Calculate job counts per mechanic
      const jobCounts = mechanicIds.reduce((acc, id) => {
        const records = maintenanceRecords?.filter(r => r.mechanic_id === id) || [];
        acc[id] = {
          active: records.filter(r => !r.completed).length,
          completed: records.filter(r => r.completed).length
        };
        return acc;
      }, {} as Record<string, { active: number; completed: number }>);

      const mechanicsList: Mechanic[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email,
        email: profile.email,
        phone: profile.phone,
        status: 'active',
        active_jobs: jobCounts[profile.id]?.active || 0,
        completed_jobs: jobCounts[profile.id]?.completed || 0,
        joined: profile.created_at
      }));

      setMechanics(mechanicsList);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      toast.error('Failed to load mechanics');
    } finally {
      setLoading(false);
    }
  };

  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      "on-leave": "secondary",
      inactive: "destructive"
    };
    return <Badge variant={variants[status]}>{status.replace("-", " ")}</Badge>;
  };

  const activeMechanics = mechanics.filter(m => m.status === "active").length;
  const totalJobs = mechanics.reduce((sum, m) => sum + m.active_jobs, 0);
  const totalCompleted = mechanics.reduce((sum, m) => sum + m.completed_jobs, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Mechanic Management</h1>
              <Button onClick={() => toast.info("Mechanic accounts are created through the Staff registration flow. Contact admin to set up a new mechanic account.")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mechanic
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Mechanic Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Mechanics
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeMechanics}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {mechanics.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Jobs
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalJobs}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In progress now
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Jobs
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCompleted}</div>
                  <p className="text-xs text-emerald-600 mt-1">
                    All-time total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mechanics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mechanics Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Mechanics</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMechanics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No mechanics match your search" : "No mechanics found"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMechanics.map((mechanic) => (
                        <TableRow key={mechanic.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{mechanic.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {mechanic.email}
                              </div>
                              {mechanic.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {mechanic.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(mechanic.status)}</TableCell>
                          <TableCell>
                            <span className={mechanic.active_jobs > 0 ? "text-amber-600 font-medium" : ""}>
                              {mechanic.active_jobs}
                            </span>
                          </TableCell>
                          <TableCell className="text-emerald-600">{mechanic.completed_jobs}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(mechanic.joined).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
