import { useQuery } from "@tanstack/react-query";
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
import { AlertTriangle, FileSignature, CreditCard, Send, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NeedsAttentionItem {
  type: "ach_pending" | "lease_unsigned";
  applicationId?: string;
  subscriptionId?: string;
  customerId?: string;
  customerName: string;
  email: string;
  companyName?: string;
  paymentSetupStatus?: string | null;
  stripeCustomerId?: string | null;
  updatedAt: string;
}

export function NeedsAttentionCard() {
  const [sendingACH, setSendingACH] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["needs-attention"],
    queryFn: async () => {
      const results: NeedsAttentionItem[] = [];

      // 1. ACH/Payment not completed - approved applications without completed payment
      const { data: achPending, error: achError } = await supabase
        .from("customer_applications")
        .select(`
          id,
          payment_setup_status,
          stripe_customer_id,
          updated_at,
          profiles!customer_applications_user_id_fkey (
            email,
            first_name,
            last_name,
            company_name
          )
        `)
        .eq("status", "approved")
        .neq("payment_setup_status", "completed");

      if (!achError && achPending) {
        for (const app of achPending) {
          const profile = app.profiles as any;
          if (!profile) continue;
          results.push({
            type: "ach_pending",
            applicationId: app.id,
            customerName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown",
            email: profile.email,
            companyName: profile.company_name || undefined,
            paymentSetupStatus: app.payment_setup_status,
            stripeCustomerId: app.stripe_customer_id,
            updatedAt: app.updated_at,
          });
        }
      }

      // 2. Lease not signed - active/pending subscriptions without lease
      const { data: leasePending, error: leaseError } = await supabase
        .from("customer_subscriptions")
        .select(`
          id,
          customer_id,
          status,
          updated_at,
          lease_agreement_url,
          docusign_completed_at,
          customers (
            full_name,
            email,
            company_name
          )
        `)
        .in("status", ["active", "pending"])
        .is("docusign_completed_at", null)
        .is("lease_agreement_url", null);

      if (!leaseError && leasePending) {
        for (const sub of leasePending) {
          const customer = sub.customers as any;
          if (!customer) continue;
          results.push({
            type: "lease_unsigned",
            subscriptionId: sub.id,
            customerId: sub.customer_id,
            customerName: customer.full_name || "Unknown",
            email: customer.email || "",
            companyName: customer.company_name || undefined,
            updatedAt: sub.updated_at,
          });
        }
      }

      return results;
    },
  });

  const handleSendACHSetup = async (item: NeedsAttentionItem) => {
    if (!item.applicationId) return;
    setSendingACH(item.applicationId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke("send-ach-setup-email", {
        body: {
          applicationId: item.applicationId,
          customerEmail: item.email,
          customerName: item.customerName,
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (error) throw error;
      toast({ title: "Email Sent", description: `Payment setup email sent to ${item.email}` });
    } catch (err) {
      console.error("Send ACH setup error:", err);
      toast({ title: "Error", description: "Failed to send setup email.", variant: "destructive" });
    } finally {
      setSendingACH(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  const achItems = items.filter((i) => i.type === "ach_pending");
  const leaseItems = items.filter((i) => i.type === "lease_unsigned");

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-700 dark:text-amber-300">Needs Attention</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700"
          >
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription>
          Active customers missing payment setup or signed lease agreements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ACH / Payment Not Completed */}
        {achItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">Payment Not Completed ({achItems.length})</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achItems.map((item) => (
                  <TableRow key={`ach-${item.applicationId}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-sm text-muted-foreground">{item.companyName || item.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.paymentSetupStatus || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={sendingACH === item.applicationId}
                        onClick={() => handleSendACHSetup(item)}
                      >
                        {sendingACH === item.applicationId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Send Setup
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Lease Not Signed */}
        {leaseItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileSignature className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">Lease Not Signed ({leaseItems.length})</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaseItems.map((item) => (
                  <TableRow key={`lease-${item.subscriptionId}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        {item.companyName && (
                          <p className="text-sm text-muted-foreground">{item.companyName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/admin/customers/${item.customerId}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
