import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  User,
  Loader2,
  Inbox
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  user_id: string;
  assigned_to: string | null;
  company_id: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  assigned_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface TicketMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  
  // New ticket form state
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch company ID
  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      // First get tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (ticketsError) throw ticketsError;
      
      // Then get profiles for user_ids and assigned_to
      const userIds = [...new Set([
        ...ticketsData.map(t => t.user_id),
        ...ticketsData.map(t => t.assigned_to).filter(Boolean)
      ])];
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      return ticketsData.map(ticket => ({
        ...ticket,
        user_profile: profilesMap.get(ticket.user_id) || null,
        assigned_profile: ticket.assigned_to ? profilesMap.get(ticket.assigned_to) || null : null,
      })) as Ticket[];
    },
  });

  // Fetch ticket messages when a ticket is selected
  const { data: ticketMessages = [] } = useQuery({
    queryKey: ["ticket-messages", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      
      const { data: messagesData, error: messagesError } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // Get profiles for message authors
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      return messagesData.map(msg => ({
        ...msg,
        user_profile: profilesMap.get(msg.user_id) || null,
      })) as TicketMessage[];
    },
    enabled: !!selectedTicket?.id,
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, company_name, email")
        .eq("status", "active")
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch staff for assignment dropdown
  const { data: staff = [] } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.company_id || !user?.id) throw new Error("Missing company or user");
      
      // Find customer profile by email to get user_id
      const customer = customers.find(c => c.id === newCustomerId);
      if (!customer?.email) throw new Error("Customer email not found");
      
      const { data: customerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .single();
      
      const userId = customerProfile?.id || user.id;
      
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          subject: newSubject,
          description: newDescription,
          priority: newPriority || "medium",
          status: "open",
          user_id: userId,
          assigned_to: newAssignedTo || null,
          company_id: profile.company_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket created successfully");
      setNewTicketOpen(false);
      resetNewTicketForm();
    },
    onError: (error) => {
      toast.error("Failed to create ticket: " + error.message);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicket?.id || !user?.id || !newMessage.trim()) return;
      
      const { error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: newMessage.trim(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", selectedTicket?.id] });
      setNewMessage("");
      toast.success("Message sent");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const updateData: { status: string; resolved_at?: string | null } = { status };
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }
      
      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const resetNewTicketForm = () => {
    setNewSubject("");
    setNewDescription("");
    setNewPriority("");
    setNewCustomerId("");
    setNewAssignedTo("");
  };

  const filteredTickets = tickets.filter((ticket) => {
    const customerName = ticket.user_profile 
      ? `${ticket.user_profile.first_name || ""} ${ticket.user_profile.last_name || ""}`.trim() || ticket.user_profile.email
      : "";
    
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    
    const statusConfig = config[status] || config.open;
    const { variant, icon: Icon } = statusConfig;
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      low: "bg-primary/10 text-primary border-primary/20"
    };
    
    return (
      <Badge variant="outline" className={colors[priority] || colors.medium}>
        {priority}
      </Badge>
    );
  };

  const getDisplayName = (profile: { first_name: string | null; last_name: string | null; email?: string } | null | undefined) => {
    if (!profile) return "Unassigned";
    const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    return name || profile.email || "Unknown";
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
              <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
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
                      <Select value={newCustomerId} onValueChange={setNewCustomerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.full_name} {customer.company_name ? `(${customer.company_name})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input 
                        placeholder="Brief description of the issue" 
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        placeholder="Detailed description of the support request"
                        rows={4}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={newPriority} onValueChange={setNewPriority}>
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
                        <Select value={newAssignedTo} onValueChange={setNewAssignedTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => createTicketMutation.mutate()}
                      disabled={!newSubject || !newDescription || createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Ticket
                    </Button>
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
                  <div className="text-2xl font-bold text-destructive">{openTickets}</div>
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
                  <div className="text-2xl font-bold text-primary">{resolvedTickets}</div>
                  <p className="text-xs text-primary mt-1">
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
                  <div className="text-2xl font-bold text-destructive">{highPriorityTickets}</div>
                  <p className="text-xs text-destructive mt-1">
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
                {ticketsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No tickets found</h3>
                    <p className="text-muted-foreground mt-1">
                      {tickets.length === 0 
                        ? "Create your first support ticket to get started"
                        : "No tickets match your search criteria"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {getDisplayName(ticket.user_profile)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getDisplayName(ticket.assigned_profile)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setViewDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* View Ticket Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="max-w-3xl">
                {selectedTicket && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{selectedTicket.subject}</DialogTitle>
                      <DialogDescription>
                        Customer: {getDisplayName(selectedTicket.user_profile)} | Priority: {selectedTicket.priority}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">{selectedTicket.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Status:</span>
                        <Select 
                          value={selectedTicket.status}
                          onValueChange={(status) => {
                            updateStatusMutation.mutate({ ticketId: selectedTicket.id, status });
                            setSelectedTicket({ ...selectedTicket, status });
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Conversation</h4>
                        {ticketMessages.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No messages yet</p>
                        ) : (
                          ticketMessages.map((msg) => (
                            <div key={msg.id} className="border-l-2 border-primary pl-4 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{getDisplayName(msg.user_profile)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{msg.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <label className="text-sm font-medium">Add Response</label>
                        <Textarea 
                          placeholder="Type your response here..."
                          className="mt-2"
                          rows={3}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button 
                          className="mt-2" 
                          onClick={() => sendMessageMutation.mutate()}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Send Response
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
