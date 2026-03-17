import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CheckCircle2, Calendar, Pencil, RefreshCw, CreditCard, Building2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { EditBillingDateDialog } from "./EditBillingDateDialog";

interface ReadyToActivateCustomer {
  id: string;
  user_id: string;
  billing_anchor_day: number | null;
  preferred_billing_cycle: string | null;
  payment_setup_status: string | null;
  updated_at: string;
  profiles: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
  } | null;
}

export function ReadyToActivateCard() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ReadyToActivateCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ReadyToActivateCustomer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: readyCustomers, isLoading } = useQuery({
    queryKey: ["ready-to-activate"],
    queryFn: async () => {
      // Get customers who completed ACH but don't have active subscriptions
      const { data: applications, error: appError } = await supabase
        .from("customer_applications")
        .select(`
          id,
          user_id,
          billing_anchor_day,
          preferred_billing_cycle,
          payment_setup_status,
          updated_at,
          profiles!customer_applications_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            company_name
          )
        `)
        .eq("payment_setup_status", "completed")
        .eq("status", "approved");

      if (appError) throw appError;
      if (!applications || applications.length === 0) return [];

      // Get customers with active subscriptions to filter them out
      const { data: activeSubscriptions, error: subError } = await supabase
        .from("customer_subscriptions")
        .select("customer_id")
        .in("status", ["active", "pending"]);

      if (subError) throw subError;

      // Get customer IDs from profiles emails
      const emails = applications
        .map(app => app.profiles?.email)
        .filter((email): email is string => !!email);

      if (emails.length === 0) return [];

      const { data: customers, error: custError } = await supabase
        .from("customers")
        .select("id, email")
        .in("email", emails);

      if (custError) throw custError;

      const customersWithSubscriptions = new Set(
        activeSubscriptions?.map(s => s.customer_id) || []
      );

      // Create email to customer ID map
      const emailToCustomerId = new Map(
        customers?.map(c => [c.email, c.id]) || []
      );

      // Filter out customers who already have subscriptions
      return applications.filter(app => {
        const customerId = emailToCustomerId.get(app.profiles?.email || "");
        return customerId ? !customersWithSubscriptions.has(customerId) : true;
      }) as ReadyToActivateCustomer[];
    },
  });

  if (isLoading) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!readyCustomers || readyCustomers.length === 0) {
    return null;
  }

  const handleEditDate = (customer: ReadyToActivateCustomer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleRemoveFromQueue = async () => {
    if (!customerToDelete) return;
    const { error } = await supabase
      .from("customer_applications")
      .update({
        status: "rejected",
        admin_notes: "Removed from activation queue by admin",
      })
      .eq("id", customerToDelete.id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to remove customer from queue.", variant: "destructive" });
    } else {
      toast({ title: "Removed", description: `${customerToDelete.profiles?.first_name || "Customer"} removed from activation queue.` });
      queryClient.invalidateQueries({ queryKey: ["ready-to-activate"] });
    }
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  return (
    <>
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-700 dark:text-green-300">
                Ready to Activate
              </CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
            >
              {readyCustomers.length} customer{readyCustomers.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <CardDescription>
            Customers who have completed ACH setup and are ready for subscription creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>ACH Completed</TableHead>
                <TableHead>Preferred Billing Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer.profiles?.first_name} {customer.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.profiles?.company_name || customer.profiles?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm">
                        {format(new Date(customer.updated_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.preferred_billing_cycle === "weekly" || customer.billing_anchor_day === 5 ? (
                      <Badge variant="outline" className="font-normal">
                        <Calendar className="h-3 w-3 mr-1" />
                        Every Friday (Weekly)
                      </Badge>
                    ) : customer.billing_anchor_day ? (
                      <Badge variant="outline" className="font-normal">
                        <Calendar className="h-3 w-3 mr-1" />
                        {customer.billing_anchor_day === 1 ? "1st" : "15th"} of the month
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDate(customer)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCustomerToDelete(customer);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <EditBillingDateDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          customerId={selectedCustomer.user_id}
          customerName={`${selectedCustomer.profiles?.first_name || ""} ${selectedCustomer.profiles?.last_name || ""}`.trim() || "Customer"}
          currentAnchorDay={selectedCustomer.billing_anchor_day}
          currentPreferredCycle={selectedCustomer.preferred_billing_cycle}
          applicationId={selectedCustomer.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Queue?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {customerToDelete?.profiles?.first_name || "this customer"}'s application as rejected. They will no longer appear in the Ready to Activate list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromQueue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
