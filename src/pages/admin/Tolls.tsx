import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { TollFormDialog } from "@/components/admin/TollFormDialog";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
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

interface Toll {
  id: string;
  customer_id: string;
  trailer_id: string | null;
  toll_location: string | null;
  toll_authority: string | null;
  amount: number;
  toll_date: string;
  status: string;
  payment_date: string | null;
  profiles: { first_name: string | null; last_name: string | null; email: string } | null;
  trailers: { trailer_number: string } | null;
}

export default function Tolls() {
  const [searchParams] = useSearchParams();
  const customerIdFromUrl = searchParams.get("customer");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string | null>(customerIdFromUrl);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setCustomerFilter(customerIdFromUrl);
  }, [customerIdFromUrl]);

  useEffect(() => {
    fetchTolls();
  }, []);

  const fetchTolls = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tolls")
      .select(`
        id,
        customer_id,
        trailer_id,
        toll_location,
        toll_authority,
        amount,
        toll_date,
        status,
        payment_date,
        profiles:customer_id(first_name, last_name, email),
        trailers(trailer_number)
      `)
      .order("toll_date", { ascending: false });

    if (error) {
      toast.error("Failed to load tolls");
      console.error(error);
    } else {
      setTolls((data as unknown as Toll[]) || []);
    }
    setIsLoading(false);
  };

  const markAsPaid = async (tollId: string) => {
    const { error } = await supabase
      .from("tolls")
      .update({ status: "paid", payment_date: new Date().toISOString() })
      .eq("id", tollId);

    if (error) {
      toast.error("Failed to update toll");
    } else {
      toast.success("Toll marked as paid");
      fetchTolls();
    }
  };

  const getCustomerName = (toll: Toll) => {
    if (toll.profiles) {
      const { first_name, last_name, email } = toll.profiles;
      if (first_name || last_name) {
        return `${first_name || ''} ${last_name || ''}`.trim();
      }
      return email;
    }
    return "Unknown";
  };

  const filteredTolls = tolls.filter((toll) => {
    const customerName = getCustomerName(toll).toLowerCase();
    const trailerNum = toll.trailers?.trailer_number?.toLowerCase() || "";
    const location = toll.toll_location?.toLowerCase() || "";
    
    const matchesSearch = 
      customerName.includes(searchQuery.toLowerCase()) ||
      trailerNum.includes(searchQuery.toLowerCase()) ||
      location.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || toll.status === statusFilter;
    const matchesCustomer = !customerFilter || toll.customer_id === customerFilter;
    
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const getFilteredCustomerName = () => {
    if (!customerFilter) return null;
    const toll = tolls.find(t => t.customer_id === customerFilter);
    return toll ? getCustomerName(toll) : null;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      paid: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      overdue: { variant: "destructive", icon: AlertCircle }
    };
    
    const statusConfig = config[status] || config.pending;
    const { variant, icon: Icon } = statusConfig;
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const totalPending = tolls.filter(t => t.status === "pending").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOverdue = tolls.filter(t => t.status === "overdue").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPaid = tolls.filter(t => t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Toll Management</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Toll
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Toll Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Tolls
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tolls.filter(t => t.status === "pending").length} tolls
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setStatusFilter('overdue')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Tolls
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
                  <p className="text-xs text-red-600 mt-1">
                    {tolls.filter(t => t.status === "overdue").length} tolls overdue
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'paid' ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setStatusFilter('paid')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paid This Month
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {tolls.filter(t => t.status === "paid").length} tolls paid
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            {customerFilter && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm py-1">
                  Filtered by: {getFilteredCustomerName() || "Customer"}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCustomerFilter(null)}
                >
                  Clear filter
                </Button>
              </div>
            )}

            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tolls..."
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
                  variant={statusFilter === "pending" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
                <Button 
                  variant={statusFilter === "overdue" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("overdue")}
                >
                  Overdue
                </Button>
                <Button 
                  variant={statusFilter === "paid" ? "default" : "outline"} 
                  onClick={() => setStatusFilter("paid")}
                >
                  Paid
                </Button>
              </div>
            </div>

            {/* Tolls Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Tolls</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTolls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {tolls.length === 0 ? "No tolls found. Add your first toll above." : "No tolls match your search."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Trailer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Authority</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTolls.map((toll) => (
                        <TableRow key={toll.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {new Date(toll.toll_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getCustomerName(toll)}</TableCell>
                          <TableCell>
                            {toll.trailers?.trailer_number ? (
                              <Badge variant="outline">{toll.trailers.trailer_number}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{toll.toll_location || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {toll.toll_authority || "-"}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${Number(toll.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(toll.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {toll.payment_date 
                              ? new Date(toll.payment_date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {toll.status !== "paid" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsPaid(toll.id)}
                              >
                                Mark Paid
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
          </main>
        </div>
      </div>

      <TollFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchTolls}
      />
    </SidebarProvider>
  );
}
