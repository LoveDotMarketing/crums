import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertTriangle, CreditCard, FileCheck, ExternalLink, Send, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function NeedsAttentionCard() {
  const navigate = useNavigate();

  const { data: achPending, isLoading: achLoading } = useQuery({
    queryKey: ["needs-attention-ach"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id, user_id, phone_number, payment_setup_status, payment_setup_sent_at, stripe_customer_id, customer_id, profiles:user_id(first_name, last_name, email)")
        .eq("status", "approved")
        .neq("payment_setup_status", "completed");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: leasePending, isLoading: leaseLoading } = useQuery({
    queryKey: ["needs-attention-lease"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select("id, customer_id, status, created_at, customers:customer_id(full_name, email)")
        .in("status", ["active", "pending"])
        .is("lease_agreement_url", null)
        .is("docusign_completed_at", null);
      if (error) throw error;
      return data || [];
    },
  });

  const handleSendAchEmail = async (applicationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-ach-setup-email", {
        body: { applicationId },
      });
      if (error) throw error;
      toast({ title: "ACH setup email sent successfully" });
    } catch {
      toast({ title: "Failed to send email", variant: "destructive" });
    }
  };

  const isLoading = achLoading || leaseLoading;
  const hasAch = achPending && achPending.length > 0;
  const hasLease = leasePending && leasePending.length > 0;

  if (isLoading) return null;
  if (!hasAch && !hasLease) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <AlertTriangle className="h-5 w-5" />
          Needs Attention
          <Badge variant="outline" className="ml-2">
            {(achPending?.length || 0) + (leasePending?.length || 0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAch && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
              <CreditCard className="h-4 w-4" />
              ACH Not Completed ({achPending.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achPending.map((app: any) => {
                  const profile = app.profiles;
                  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "—";
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{profile?.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {app.payment_setup_status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {app.payment_setup_sent_at ? format(new Date(app.payment_setup_sent_at), "MMM d") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleSendAchEmail(app.id)}>
                          <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {hasLease && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
              <FileCheck className="h-4 w-4" />
              Lease Not Signed ({leasePending.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sub Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leasePending.map((sub: any) => {
                  const customer = sub.customers;
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{customer?.full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer?.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{sub.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(sub.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/admin/customers/${sub.customer_id}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
