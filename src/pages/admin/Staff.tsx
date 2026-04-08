import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Shield, Wrench, Mail, Loader2, Users, MoreHorizontal, Trash2, RefreshCw, Eye, BadgeDollarSign } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "admin" | "mechanic" | "sales";
  created_at: string;
  staffProfileId?: string;
}

export default function Staff() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, startImpersonation } = useAuth();
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "mechanic" | "sales">("admin");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<StaffMember | null>(null);

  // Fetch staff members (admins and mechanics)
  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      // Get all user roles for admin and mechanic
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "mechanic", "sales"]);

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) return [];

      // Get profile info for these users
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, created_at")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Get staff profiles for these users
      const { data: staffProfiles } = await supabase
        .from("staff_profiles")
        .select("id, user_id")
        .in("user_id", userIds);

      // Combine data
      const staff: StaffMember[] = roles.map(r => {
        const profile = profiles?.find(p => p.id === r.user_id);
        const sp = staffProfiles?.find(s => s.user_id === r.user_id);
        return {
          id: r.user_id,
          email: profile?.email || "Unknown",
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          role: r.role as "admin" | "mechanic" | "sales",
          created_at: profile?.created_at || "",
          staffProfileId: sp?.id,
        };
      });

      return staff;
    },
  });

  // Invite staff mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: "admin" | "mechanic" | "sales"; firstName?: string; lastName?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("invite-staff", {
        body: data,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Staff Invited",
        description: data.message,
      });
      setIsInviteOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Invite Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove staff mutation
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("remove-staff", {
        body: { userId },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Staff Removed",
        description: "The staff member has been removed from the system.",
      });
      setMemberToRemove(null);
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Remove Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "mechanic" | "sales" }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("update-staff-role", {
        body: { userId, role },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Role Updated",
        description: data.message || "Staff member role has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resend password reset mutation
  const resendResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://crumsleasing.com/reset-password',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Sent",
        description: "A password reset email has been sent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setInviteEmail("");
    setInviteRole("admin");
    setInviteFirstName("");
    setInviteLastName("");
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    inviteMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      firstName: inviteFirstName || undefined,
      lastName: inviteLastName || undefined,
    });
  };

  const handleRemoveStaff = () => {
    if (memberToRemove) {
      removeMutation.mutate(memberToRemove.id);
    }
  };

  const handleChangeRole = (member: StaffMember, newRole: "admin" | "mechanic" | "sales") => {
    if (member.role === newRole) return;
    changeRoleMutation.mutate({ userId: member.id, role: newRole });
  };

  const handleViewAs = (member: StaffMember) => {
    const displayName = member.first_name || member.last_name
      ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
      : undefined;
    
    startImpersonation({
      id: member.id,
      email: member.email,
      role: member.role,
      displayName,
    });
  };

  const adminCount = staffMembers?.filter(s => s.role === "admin").length || 0;
  const mechanicCount = staffMembers?.filter(s => s.role === "mechanic").length || 0;
  const salesCount = staffMembers?.filter(s => s.role === "sales").length || 0;

  const isCurrentUser = (memberId: string) => user?.id === memberId;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <p className="text-muted-foreground">Manage administrators and mechanics</p>
              </div>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Staff Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a new administrator or mechanic. They'll receive a password reset email to set up their account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@crumstrailers.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "mechanic" | "sales")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrator
                          </div>
                        </SelectItem>
                        <SelectItem value="mechanic">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Mechanic
                          </div>
                         </SelectItem>
                         <SelectItem value="sales">
                           <div className="flex items-center gap-2">
                             <BadgeDollarSign className="h-4 w-4" />
                             Sales
                           </div>
                         </SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{staffMembers?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{adminCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BadgeDollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{salesCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mechanics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{mechanicCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All administrators and mechanics with system access</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !staffMembers || staffMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No staff members found. Invite your first staff member above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        className={member.staffProfileId ? "cursor-pointer hover:bg-muted/50" : ""} 
                        onClick={() => member.staffProfileId && navigate(`/dashboard/admin/staff/${member.staffProfileId}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {member.first_name || member.last_name
                              ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
                              : "—"}
                            {isCurrentUser(member.id) && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "admin" ? "default" : member.role === "sales" ? "outline" : "secondary"}>
                            {member.role === "admin" ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : member.role === "sales" ? (
                              <BadgeDollarSign className="h-3 w-3 mr-1" />
                            ) : (
                              <Wrench className="h-3 w-3 mr-1" />
                            )}
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.created_at
                            ? new Date(member.created_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => resendResetMutation.mutate(member.email)}
                                disabled={resendResetMutation.isPending}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              {!isCurrentUser(member.id) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleViewAs(member)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View As {member.role === "admin" ? "Admin" : "Mechanic"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                   <DropdownMenuItem
                                     onClick={() => handleChangeRole(member, member.role === "admin" ? "mechanic" : "admin")}
                                     disabled={changeRoleMutation.isPending}
                                   >
                                     <RefreshCw className="h-4 w-4 mr-2" />
                                     Change to {member.role === "admin" ? "Mechanic" : "Admin"}
                                   </DropdownMenuItem>
                                   {member.role !== "sales" && (
                                     <DropdownMenuItem
                                       onClick={() => handleChangeRole(member, "sales")}
                                       disabled={changeRoleMutation.isPending}
                                     >
                                       <BadgeDollarSign className="h-4 w-4 mr-2" />
                                       Change to Sales
                                     </DropdownMenuItem>
                                   )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setMemberToRemove(member)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Staff
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Remove Confirmation Dialog */}
          <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove{" "}
                  <strong>
                    {memberToRemove?.first_name || memberToRemove?.last_name
                      ? `${memberToRemove.first_name || ""} ${memberToRemove.last_name || ""}`.trim()
                      : memberToRemove?.email}
                  </strong>
                  ? This will revoke their access to the admin portal and delete their account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveStaff}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={removeMutation.isPending}
                >
                  {removeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </SidebarProvider>
  );
}
