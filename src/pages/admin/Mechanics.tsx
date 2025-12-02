import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Wrench, 
  Plus, 
  Search, 
  Mail,
  Phone,
  Calendar,
  CheckCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Mechanics() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock mechanic data
  const mechanics = [
    {
      id: "1",
      name: "Mike Johnson",
      email: "mike.johnson@crumsleasing.com",
      phone: "(555) 111-2222",
      specialty: "Refrigeration",
      status: "active",
      active_jobs: 2,
      completed_jobs: 145,
      avg_rating: 4.8,
      joined: "2020-03-15"
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@crumsleasing.com",
      phone: "(555) 222-3333",
      specialty: "Hydraulics",
      status: "active",
      active_jobs: 1,
      completed_jobs: 98,
      avg_rating: 4.9,
      joined: "2021-06-20"
    },
    {
      id: "3",
      name: "David Martinez",
      email: "david.m@crumsleasing.com",
      phone: "(555) 333-4444",
      specialty: "General Maintenance",
      status: "active",
      active_jobs: 3,
      completed_jobs: 203,
      avg_rating: 4.7,
      joined: "2019-01-10"
    },
    {
      id: "4",
      name: "Lisa Chen",
      email: "lisa.chen@crumsleasing.com",
      phone: "(555) 444-5555",
      specialty: "Electrical Systems",
      status: "active",
      active_jobs: 0,
      completed_jobs: 76,
      avg_rating: 4.9,
      joined: "2022-09-01"
    },
    {
      id: "5",
      name: "Robert Taylor",
      email: "robert.t@crumsleasing.com",
      phone: "(555) 555-6666",
      specialty: "Brakes & Suspension",
      status: "on-leave",
      active_jobs: 0,
      completed_jobs: 167,
      avg_rating: 4.6,
      joined: "2020-11-15"
    }
  ];

  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.specialty.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <p className="text-xs text-green-600 mt-1">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Jobs</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Rating</TableHead>
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
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {mechanic.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{mechanic.specialty}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(mechanic.status)}</TableCell>
                        <TableCell>
                          <span className={mechanic.active_jobs > 0 ? "text-orange-600 font-medium" : ""}>
                            {mechanic.active_jobs}
                          </span>
                        </TableCell>
                        <TableCell className="text-green-600">{mechanic.completed_jobs}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{mechanic.avg_rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
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
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
