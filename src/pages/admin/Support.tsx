import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Mock support ticket data
  const tickets = [
    {
      id: "TICK-001",
      customer: "ABC Transport",
      subject: "Trailer maintenance issue",
      description: "Trailer TRL-001 has a brake problem that needs immediate attention.",
      priority: "high",
      status: "open",
      created_at: "2024-01-15T10:30:00",
      assigned_to: "Mike Johnson",
      messages: [
        { user: "ABC Transport", message: "Trailer brake light is not working", time: "2024-01-15T10:30:00" },
        { user: "Admin", message: "We'll send a mechanic right away", time: "2024-01-15T10:45:00" }
      ]
    },
    {
      id: "TICK-002",
      customer: "XYZ Logistics",
      subject: "Invoice discrepancy",
      description: "The invoice amount doesn't match our rental agreement.",
      priority: "medium",
      status: "in-progress",
      created_at: "2024-01-14T14:20:00",
      assigned_to: "Sarah Williams",
      messages: [
        { user: "XYZ Logistics", message: "Invoice #INV-002 shows $3500 but agreement is $3200", time: "2024-01-14T14:20:00" },
        { user: "Admin", message: "Looking into this now", time: "2024-01-14T15:00:00" }
      ]
    },
    {
      id: "TICK-003",
      customer: "FastTrack Inc",
      subject: "Need additional trailer",
      description: "Requesting to rent one more trailer for urgent delivery.",
      priority: "low",
      status: "resolved",
      created_at: "2024-01-13T09:15:00",
      assigned_to: "David Martinez",
      messages: [
        { user: "FastTrack Inc", message: "Need trailer ASAP", time: "2024-01-13T09:15:00" },
        { user: "Admin", message: "TRL-006 is available and assigned", time: "2024-01-13T09:30:00" },
        { user: "FastTrack Inc", message: "Perfect, thanks!", time: "2024-01-13T09:35:00" }
      ]
    },
    {
      id: "TICK-004",
      customer: "Heavy Haul Co",
      subject: "GPS tracking not working",
      description: "Cannot see GPS location for trailers TRL-005 and TRL-007.",
      priority: "high",
      status: "open",
      created_at: "2024-01-12T16:45:00",
      assigned_to: "Lisa Chen",
      messages: [
        { user: "Heavy Haul Co", message: "GPS shows offline for both trailers", time: "2024-01-12T16:45:00" }
      ]
    },
    {
      id: "TICK-005",
      customer: "Cold Chain LLC",
      subject: "Refrigeration unit malfunction",
      description: "The refrigeration unit on TRL-009 is not cooling properly.",
      priority: "high",
      status: "in-progress",
      created_at: "2024-01-11T11:20:00",
      assigned_to: "Mike Johnson",
      messages: [
        { user: "Cold Chain LLC", message: "Temperature is at 45°F, should be 32°F", time: "2024-01-11T11:20:00" },
        { user: "Admin", message: "Mechanic dispatched", time: "2024-01-11T11:30:00" }
      ]
    }
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      resolved: { variant: "default", icon: CheckCircle },
      "in-progress": { variant: "secondary", icon: Clock },
      open: { variant: "destructive", icon: AlertCircle }
    };
    
    const { variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500/10 text-red-500 border-red-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };
    
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  const openTickets = tickets.filter(t => t.status === "open").length;
  const inProgressTickets = tickets.filter(t => t.status === "in-progress").length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const highPriorityTickets = tickets.filter(t => t.priority === "high" && t.status !== "resolved").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>
                      Create a new support ticket for a customer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Customer</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abc">ABC Transport</SelectItem>
                          <SelectItem value="xyz">XYZ Logistics</SelectItem>
                          <SelectItem value="fast">FastTrack Inc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="Brief description of the issue" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        placeholder="Detailed description of the support request"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assign To</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mike">Mike Johnson</SelectItem>
                            <SelectItem value="sarah">Sarah Williams</SelectItem>
                            <SelectItem value="david">David Martinez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full">Create Ticket</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Support Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Tickets
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{openTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Being handled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Resolved
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{resolvedTickets}</div>
                  <p className="text-xs text-green-600 mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    High Priority
                  </CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{highPriorityTickets}</div>
                  <p className="text-xs text-red-600 mt-1">
                    Needs attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={statusFilter === "all" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === "open" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("open")}
                >
                  Open
                </Button>
                <Button 
                  variant={statusFilter === "in-progress" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("in-progress")}
                >
                  In Progress
                </Button>
                <Button 
                  variant={statusFilter === "resolved" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("resolved")}
                >
                  Resolved
                </Button>
              </div>
            </div>

            {/* Tickets Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {ticket.customer}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.assigned_to}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{ticket.id} - {ticket.subject}</DialogTitle>
                                <DialogDescription>
                                  Customer: {ticket.customer} | Priority: {ticket.priority}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                  <p className="text-sm">{ticket.description}</p>
                                </div>
                                
                                <div className="space-y-3">
                                  <h4 className="font-semibold">Conversation</h4>
                                  {ticket.messages.map((msg, idx) => (
                                    <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{msg.user}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(msg.time).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{msg.message}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-2">
                                  <Textarea placeholder="Type your response..." rows={3} />
                                  <div className="flex gap-2">
                                    <Button className="flex-1">Send Reply</Button>
                                    {ticket.status !== "resolved" && (
                                      <Button variant="outline">Mark as Resolved</Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
