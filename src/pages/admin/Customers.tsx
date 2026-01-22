import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CustomerFormDialog } from "@/components/admin/CustomerFormDialog";
import { 
  Users, 
  Plus, 
  Search, 
  Mail,
  Building2,
  DollarSign,
  Loader2,
  Pencil,
  Gift,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TrailerInfo {
  vin: string;
  trailer_number: string | null;
}

interface Customer {
  id: string;
  account_number: string;
  full_name: string;
  company_name: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  archived_at: string | null;
  archived_by: string | null;
  notes: string | null;
  payment_type: string | null;
  created_at: string;
  birthday?: string | null;
  trailers_count?: number;
  trailers?: TrailerInfo[];
  outstanding_tolls?: number;
  // Referral data
  referral_code?: string;
  referral_code_id?: string;
  referral_code_active?: boolean;
  referrals_sent?: number;
  referrals_pending?: number;
  referrals_approved?: number;
  referrals_credited?: number;
  credits_earned?: number;
  was_referred?: boolean;
  referred_by_name?: string;
  profile_completion?: number;
  application_completion?: number;
  has_application?: boolean;
}

export default function Customers() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("full_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Fetch customers from database (excluding admins and mechanics)
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // First, get emails of admins and mechanics to exclude
      const { data: adminMechanicProfiles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'mechanic']);
      
      let excludeEmails: string[] = [];
      if (adminMechanicProfiles && adminMechanicProfiles.length > 0) {
        const userIds = adminMechanicProfiles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .in('id', userIds);
        excludeEmails = (profiles || []).map(p => p.email).filter(Boolean) as string[];
      }

      // Fetch customers, excluding admin/mechanic emails
      let query = supabase
        .from('customers')
        .select('*')
        .order('full_name');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter out admin/mechanic customers by email
      const filteredData = (data || []).filter(
        (c: Customer) => !c.email || !excludeEmails.includes(c.email)
      );
      
      // Fetch trailers with VINs for each customer
      const { data: trailers } = await supabase
        .from('trailers')
        .select('customer_id, vin, trailer_number')
        .not('customer_id', 'is', null);
      
      // Fetch pending tolls
      const { data: tolls } = await supabase
        .from('tolls')
        .select('customer_id, amount')
        .eq('status', 'pending');

      // Fetch referral codes for all customers
      const { data: referralCodes } = await supabase
        .from('referral_codes')
        .select('id, customer_id, code, is_active');

      // Fetch all referrals
      const { data: referrals } = await supabase
        .from('referrals')
        .select('id, referrer_code_id, referred_customer_id, status, credit_amount');

      // Fetch profiles for profile completion calculation
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, home_address');

      // Fetch applications for profile completion calculation
      const { data: applications } = await supabase
        .from('customer_applications')
        .select('user_id, trailer_type, drivers_license_url, drivers_license_back_url, insurance_docs_url, dot_number_url');
      
      // Map data to customers
      return filteredData.map((customer: Customer) => {
        const customerTrailers = trailers?.filter(t => t.customer_id === customer.id) || [];
        const trailerCount = customerTrailers.length;
        const customerTolls = tolls?.filter(t => t.customer_id === customer.id) || [];
        const totalOutstanding = customerTolls.reduce((sum, t) => sum + Number(t.amount), 0);
        
        // Find this customer's referral code
        const customerReferralCode = referralCodes?.find(rc => rc.customer_id === customer.id);
        
        // Count referrals this customer has sent (via their code)
        const sentReferrals = customerReferralCode 
          ? referrals?.filter(r => r.referrer_code_id === customerReferralCode.id) || []
          : [];
        
        const referralsPending = sentReferrals.filter(r => r.status === 'pending').length;
        const referralsApproved = sentReferrals.filter(r => r.status === 'approved').length;
        const referralsCredited = sentReferrals.filter(r => r.status === 'credited').length;
        const creditsEarned = sentReferrals
          .filter(r => r.status === 'credited')
          .reduce((sum, r) => sum + Number(r.credit_amount || 0), 0);

        // Check if this customer was referred by someone
        const wasReferred = referrals?.some(r => r.referred_customer_id === customer.id);
        
        // Find who referred this customer
        let referredByName: string | undefined;
        if (wasReferred) {
          const referral = referrals?.find(r => r.referred_customer_id === customer.id);
          if (referral) {
            const referrerCode = referralCodes?.find(rc => rc.id === referral.referrer_code_id);
            if (referrerCode) {
              const referrer = filteredData?.find((c: Customer) => c.id === referrerCode.customer_id);
              referredByName = referrer?.full_name;
            }
          }
        }

        // Calculate profile completion (only profile fields, not application)
        const customerProfile = profiles?.find(p => p.email === customer.email);
        const customerApplication = customerProfile 
          ? applications?.find(a => a.user_id === customerProfile.id)
          : null;
        
        // Profile completion is based on profile fields only
        const profileFields = [
          customerProfile?.first_name,
          customerProfile?.last_name,
          customerProfile?.phone,
        ];
        
        const completedProfileFields = profileFields.filter(field => field && field.toString().length > 0).length;
        const profileCompletion = Math.round((completedProfileFields / profileFields.length) * 100);

        // Application completion is based on application document fields
        const applicationFields = [
          customerApplication?.drivers_license_url,
          customerApplication?.drivers_license_back_url,
          customerApplication?.insurance_docs_url,
          customerApplication?.dot_number_url,
        ];
        
        const completedApplicationFields = applicationFields.filter(field => field && field.toString().length > 0).length;
        const applicationCompletion = customerApplication 
          ? Math.round((completedApplicationFields / applicationFields.length) * 100)
          : 0;
        
        return {
          ...customer,
          trailers_count: trailerCount,
          trailers: customerTrailers.map(t => ({ vin: t.vin, trailer_number: t.trailer_number })),
          outstanding_tolls: totalOutstanding,
          referral_code: customerReferralCode?.code,
          referral_code_id: customerReferralCode?.id,
          referral_code_active: customerReferralCode?.is_active,
          referrals_sent: sentReferrals.length,
          referrals_pending: referralsPending,
          referrals_approved: referralsApproved,
          referrals_credited: referralsCredited,
          credits_earned: creditsEarned,
          was_referred: wasReferred,
          referred_by_name: referredByName,
          profile_completion: profileCompletion,
          application_completion: applicationCompletion,
          has_application: !!customerApplication,
        };
      });
    }
  });

  // Delete customer mutation with cascading cleanup
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      // 1. Delete outreach logs first (references customer_id)
      await supabase.from('outreach_logs').delete().eq('customer_id', customerId);
      
      // 2. Delete customer outreach status
      await supabase.from('customer_outreach_status').delete().eq('customer_id', customerId);
      
      // 3. Get referral code for this customer first
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      // 4. Delete referrals that use this customer's referral code
      if (referralCode) {
        await supabase.from('referrals').delete().eq('referrer_code_id', referralCode.id);
      }
      
      // 5. Delete referrals where this customer was referred
      await supabase.from('referrals').delete().eq('referred_customer_id', customerId);
      
      // 6. Delete referral codes
      await supabase.from('referral_codes').delete().eq('customer_id', customerId);
      
      // 7. Delete tolls for this customer
      await supabase.from('tolls').delete().eq('customer_id', customerId);
      
      // 8. Unassign trailers (set customer_id to null, don't delete trailers)
      await supabase.from('trailers').update({ customer_id: null }).eq('customer_id', customerId);
      
      // 9. Finally, delete the customer
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Customer Deleted",
        description: "The customer has been permanently deleted.",
      });
      setCustomerToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCustomer = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  const handleViewAsCustomer = async (customer: Customer) => {
    if (!customer.email) {
      toast({
        title: "Cannot View As Customer",
        description: "This customer doesn't have an email address on file.",
        variant: "destructive",
      });
      return;
    }

    // Look up the user profile by email to get their auth user ID
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("email", customer.email)
      .maybeSingle();

    if (error || !profile) {
      toast({
        title: "Cannot View As Customer",
        description: "This customer hasn't set up their account yet.",
        variant: "destructive",
      });
      return;
    }

    const displayName = profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : customer.full_name;

    startImpersonation({
      id: profile.id,
      email: customer.email,
      role: "customer",
      displayName,
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      customer.account_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: string | number | null = null;
    let bValue: string | number | null = null;

    switch (sortColumn) {
      case "full_name":
        aValue = a.full_name.toLowerCase();
        bValue = b.full_name.toLowerCase();
        break;
      case "profile":
        aValue = a.profile_completion || 0;
        bValue = b.profile_completion || 0;
        break;
      case "application":
        aValue = a.application_completion || 0;
        bValue = b.application_completion || 0;
        break;
      case "trailers":
        aValue = a.trailers_count || 0;
        bValue = b.trailers_count || 0;
        break;
      case "contact":
        aValue = a.email?.toLowerCase() || "";
        bValue = b.email?.toLowerCase() || "";
        break;
      case "tolls":
        aValue = a.outstanding_tolls || 0;
        bValue = b.outstanding_tolls || 0;
        break;
      case "created":
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
        break;
      case "referrals":
        aValue = a.referrals_sent || 0;
        bValue = b.referrals_sent || 0;
        break;
      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortDirection === "asc" ? 1 : -1;
    if (bValue === null) return sortDirection === "asc" ? -1 : 1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      archived: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getReferralBadge = (customer: Customer) => {
    const totalSent = customer.referrals_sent || 0;
    const credited = customer.referrals_credited || 0;
    const pending = customer.referrals_pending || 0;
    
    if (totalSent === 0 && !customer.was_referred) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        {totalSent > 0 && (
          <Badge 
            variant={credited > 0 ? "default" : pending > 0 ? "secondary" : "outline"}
            className="text-xs"
          >
            {totalSent} sent {credited > 0 && `(${credited} credited)`}
          </Badge>
        )}
        {customer.was_referred && (
          <Badge variant="outline" className="text-xs bg-secondary/20">
            Referred
          </Badge>
        )}
      </div>
    );
  };

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const archivedCustomers = customers.filter(c => c.status === "archived").length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_tolls || 0), 0);
  const customersWithReferrals = customers.filter(c => (c.referrals_sent || 0) > 0).length;
  const totalCreditsEarned = customers.reduce((sum, c) => sum + (c.credits_earned || 0), 0);

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
              <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
              <Button onClick={() => { setSelectedCustomer(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Customer Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'active' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {customers.length} total ({archivedCustomers} archived)
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Outstanding Tolls
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
                  <p className="text-xs text-red-600 mt-1">
                    Pending payment
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'archived' ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setStatusFilter('archived')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Referral Activity
                  </CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customersWithReferrals}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${totalCreditsEarned.toLocaleString()} in credits earned
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company, or account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Customers ({sortedCustomers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("full_name")}
                      >
                        <div className="flex items-center">
                          Name
                          {getSortIcon("full_name")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("profile")}
                      >
                        <div className="flex items-center">
                          Profile %
                          {getSortIcon("profile")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("application")}
                      >
                        <div className="flex items-center">
                          App %
                          {getSortIcon("application")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("trailers")}
                      >
                        <div className="flex items-center">
                          Trailers
                          {getSortIcon("trailers")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("contact")}
                      >
                        <div className="flex items-center">
                          Contact
                          {getSortIcon("contact")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("tolls")}
                      >
                        <div className="flex items-center">
                          Tolls
                          {getSortIcon("tolls")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("created")}
                      >
                        <div className="flex items-center">
                          Created
                          {getSortIcon("created")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("referrals")}
                      >
                        <div className="flex items-center">
                          Referrals
                          {getSortIcon("referrals")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedCustomers.map((customer) => (
                        <TableRow 
                          key={customer.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => { setSelectedCustomer(customer); setDialogOpen(true); }}
                        >
                          <TableCell className="font-medium">{customer.full_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={customer.profile_completion || 0} 
                                className="w-16 h-2" 
                              />
                              <span className="text-xs text-muted-foreground w-8">
                                {customer.profile_completion || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.has_application ? (
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={customer.application_completion || 0} 
                                  className="w-16 h-2" 
                                />
                                <span className="text-xs text-muted-foreground w-8">
                                  {customer.application_completion || 0}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px]">
                            {customer.trailers && customer.trailers.length > 0 ? (
                              <div className="space-y-1">
                                {customer.trailers.map((trailer, idx) => (
                                  <div key={idx} className="font-mono text-xs text-muted-foreground">
                                    {trailer.vin}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <a href={`mailto:${customer.email}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {customer.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`px-2 py-1 h-auto ${(customer.outstanding_tolls || 0) > 0 ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-muted-foreground hover:text-foreground'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/admin/tolls?customer=${customer.id}`);
                              }}
                            >
                              ${(customer.outstanding_tolls || 0).toLocaleString()}
                            </Button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {customer.created_at
                              ? new Date(customer.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>{getReferralBadge(customer)}</TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(customer);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Customer
                                </DropdownMenuItem>
                                {customer.email && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewAsCustomer(customer);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View As Customer
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCustomerToDelete(customer);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{customerToDelete?.full_name}</strong> ({customerToDelete?.account_number})?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
