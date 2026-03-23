import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  Users,
  CreditCard,
  Percent,
  Tag,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Receipt,
  Pause,
  Play,
  XCircle,
  MoreHorizontal,
  AlertTriangle,
  Mail,
  Ban,
  Timer,
  Activity,
  FileCheck,
  Phone,
  Search,
  ArrowUpDown,
  Bell,
  Zap,
  Pencil,
  Webhook,
  KeyRound,
  Warehouse,
  Handshake,
  Trash2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateSubscriptionDialog } from "@/components/admin/CreateSubscriptionDialog";
import { ManageTrailersDialog } from "@/components/admin/ManageTrailersDialog";
import { EditSubscriptionDatesDialog } from "@/components/admin/EditSubscriptionDatesDialog";
import { ReadyToActivateCard } from "@/components/admin/ReadyToActivateCard";
import { ChargeCustomerDialog } from "@/components/admin/ChargeCustomerDialog";
import { EditSubscriptionPanel } from "@/components/admin/EditSubscriptionPanel";

type BillingCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";
type SubscriptionType = "standard_lease" | "6_month_lease" | "24_month_lease" | "rent_for_storage" | "lease_to_own" | "repayment_plan" | "month_to_month";
type DiscountType = "percentage" | "fixed" | "multi_trailer" | "promo_code";
type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded";

interface CustomerSubscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  status: string;
  created_at: string;
  end_date: string | null;
  subscription_type: SubscriptionType | null;
  customers?: {
    full_name: string;
    email: string;
    company_name: string | null;
  };
}

interface SubscriptionItem {
  id: string;
  subscription_id: string;
  trailer_id: string;
  monthly_rate: number;
  start_date: string;
  end_date: string | null;
  status: string;
  trailers?: {
    trailer_number: string;
    type: string;
    year: number;
  };
}

interface Discount {
  id: string;
  name: string;
  code: string | null;
  type: DiscountType;
  value: number;
  min_trailers: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

interface BillingHistoryItem {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  discount_amount: number;
  net_amount: number;
  status: PaymentStatus;
  billing_period_start: string | null;
  billing_period_end: string | null;
  paid_at: string | null;
  created_at: string;
  customer_subscriptions?: {
    customers?: {
      full_name: string;
      company_name: string | null;
    };
  };
}

interface PaymentFailure {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string;
  stripe_invoice_id: string | null;
  amount: number;
  failure_code: string | null;
  failure_message: string | null;
  failed_at: string;
  retry_count: number;
  last_retry_at: string | null;
  resolved_at: string | null;
  resolution_type: string | null;
  notification_sent_day_0: boolean;
  notification_sent_day_3: boolean;
  notification_sent_day_5: boolean;
  created_at: string;
  customer_subscriptions?: {
    grace_period_start: string | null;
    grace_period_end: string | null;
    customers?: {
      full_name: string;
      email: string;
      company_name: string | null;
    };
  };
}

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
}

interface CronRun {
  runid: number;
  jobid: number;
  jobname: string;
  status: string;
  start_time: string;
  end_time: string;
  return_message: string;
}

interface PaymentRetryLog {
  id: string;
  payment_failure_id: string;
  admin_id: string;
  stripe_invoice_id: string | null;
  amount: number;
  outcome: "success" | "failed" | "already_paid" | "not_retryable";
  error_message: string | null;
  customer_notified: boolean;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface StripeWebhookLog {
  id: string;
  event_id: string;
  event_type: string;
  status: string;
  customer_email: string | null;
  customer_id: string | null;
  subscription_id: string | null;
  stripe_subscription_id: string | null;
  amount: number | null;
  error_message: string | null;
  created_at: string;
}

export default function Billing() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRunningDunning, setIsRunningDunning] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    name: "",
    code: "",
    type: "percentage" as DiscountType,
    value: 0,
    min_trailers: 1,
    max_uses: null as number | null,
    valid_until: ""
  });

  const [confirmAction, setConfirmAction] = useState<{
    subscriptionId: string;
    action: "pause" | "resume" | "cancel";
    customerName: string;
  } | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    subscriptionId: string;
    customerName: string;
    stripeSubscriptionId?: string | null;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual resolution state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState<PaymentFailure | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionType, setResolutionType] = useState<"manual_payment" | "waived" | "other">("manual_payment");
  
  // Retry payment state
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  
  // Activate subscription state
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());
  
  
  // Payment failures filter/sort state
  const [failuresSearch, setFailuresSearch] = useState("");
  const [failuresStatusFilter, setFailuresStatusFilter] = useState<"all" | "unresolved" | "resolved">("all");
  const [failuresSortBy, setFailuresSortBy] = useState<"failed_at" | "amount" | "customer">("failed_at");
  
  // Bulk selection state
  const [selectedFailureIds, setSelectedFailureIds] = useState<Set<string>>(new Set());
  const [isBulkResolveDialogOpen, setIsBulkResolveDialogOpen] = useState(false);
  const [bulkResolutionType, setBulkResolutionType] = useState<"manual_payment" | "waived" | "other">("manual_payment");
  const [bulkResolutionNotes, setBulkResolutionNotes] = useState("");
  
  // Retry history dialog state
  const [retryHistoryDialogOpen, setRetryHistoryDialogOpen] = useState(false);
  const [selectedFailureForHistory, setSelectedFailureForHistory] = useState<PaymentFailure | null>(null);
  const [failuresSortOrder, setFailuresSortOrder] = useState<"asc" | "desc">("desc");

  // Manage trailers dialog state
  const [manageTrailersDialogOpen, setManageTrailersDialogOpen] = useState(false);
  const [selectedSubscriptionForTrailers, setSelectedSubscriptionForTrailers] = useState<{
    subscriptionId: string;
    customerId: string;
    customerName: string;
    items: SubscriptionItem[];
  } | null>(null);

  // Assign partner dialog state
  const [assignPartnerDialogOpen, setAssignPartnerDialogOpen] = useState(false);
  const [selectedSubscriptionForPartner, setSelectedSubscriptionForPartner] = useState<{
    id: string;
    customerName: string;
    currentPartnerId: string | null;
  } | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [isAssigningPartner, setIsAssigningPartner] = useState(false);

  // Edit dates dialog state
  const [editDatesDialogOpen, setEditDatesDialogOpen] = useState(false);
  const [selectedSubscriptionForDates, setSelectedSubscriptionForDates] = useState<{
    id: string;
    customerName: string;
    startDate: string;
    endDate: string | null;
  } | null>(null);

  // Upload lease agreement dialog state
  const [uploadAgreementDialogOpen, setUploadAgreementDialogOpen] = useState(false);
  const [selectedSubscriptionForUpload, setSelectedSubscriptionForUpload] = useState<{
    id: string;
    customerName: string;
    contractStartDate: string | null;
  } | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [agreementContractDate, setAgreementContractDate] = useState("");
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);

  // Upload lease agreement handler
  const handleUploadAgreement = async () => {
    if (!selectedSubscriptionForUpload || !agreementFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploadingAgreement(true);
    try {
      const filePath = `lease-agreements/${selectedSubscriptionForUpload.id}/lease-agreement.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("customer-documents")
        .upload(filePath, agreementFile, { upsert: true, contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const updateData: Record<string, string> = { lease_agreement_url: filePath };
      if (agreementContractDate) updateData.contract_start_date = agreementContractDate;

      const { error: updateError } = await supabase
        .from("customer_subscriptions")
        .update(updateData)
        .eq("id", selectedSubscriptionForUpload.id);

      if (updateError) throw updateError;

      toast.success("Lease agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      setUploadAgreementDialogOpen(false);
      setAgreementFile(null);
      setAgreementContractDate("");
      setSelectedSubscriptionForUpload(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload agreement: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsUploadingAgreement(false);
    }
  };

  // Manage subscription (pause/resume/cancel)
  const handleManageSubscription = async (subscriptionId: string, action: "pause" | "resume" | "cancel") => {
    setIsManaging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { subscriptionId, action, releaseTrailers: true }
      });

      if (error) throw new Error(error.message);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-items"] })
      ]);

      const actionLabels = { pause: "paused", resume: "resumed", cancel: "cancelled" };
      toast.success(`Subscription ${actionLabels[action]} successfully${data.trailersReleased ? " - trailers released to inventory" : ""}`);
    } catch (error) {
      console.error("Manage subscription error:", error);
      toast.error("Failed to update subscription: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsManaging(false);
      setConfirmAction(null);
    }
  };

  // Delete subscription handler
  const handleDeleteSubscription = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const { subscriptionId, stripeSubscriptionId } = deleteConfirm;

      // 1. Cancel Stripe subscription if exists
      if (stripeSubscriptionId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.functions.invoke("manage-subscription", {
              body: { subscriptionId, action: "cancel", releaseTrailers: true },
            });
          }
        } catch (e) {
          console.warn("Stripe cancel during delete failed, continuing:", e);
        }
      }

      // 2. Get trailer IDs from subscription items before deleting
      const { data: items } = await supabase
        .from("subscription_items")
        .select("trailer_id")
        .eq("subscription_id", subscriptionId);

      const trailerIds = items?.map(i => i.trailer_id).filter(Boolean) || [];

      // 3. Delete subscription items
      await supabase
        .from("subscription_items")
        .delete()
        .eq("subscription_id", subscriptionId);

      // 4. Release trailers
      if (trailerIds.length > 0) {
        await supabase
          .from("trailers")
          .update({ is_rented: false, customer_id: null, status: "available" })
          .in("id", trailerIds);
      }

      // 5. Delete billing history for this subscription
      await supabase
        .from("billing_history")
        .delete()
        .eq("subscription_id", subscriptionId);

      // 6. Delete applied discounts
      await supabase
        .from("applied_discounts")
        .delete()
        .eq("subscription_id", subscriptionId);

      // 7. Delete the subscription record
      const { error } = await supabase
        .from("customer_subscriptions")
        .delete()
        .eq("id", subscriptionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      queryClient.invalidateQueries({ queryKey: ["billing-history"] });
      queryClient.invalidateQueries({ queryKey: ["trailers"] });
      toast.success(`Subscription deleted successfully${trailerIds.length > 0 ? ` — ${trailerIds.length} trailer(s) released` : ""}`);
    } catch (error) {
      console.error("Delete subscription error:", error);
      toast.error("Failed to delete subscription: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Sync payments from Stripe
  const handleSyncPayments = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to sync payments");
        return;
      }

      // First sync subscription statuses
      const { error: billingError } = await supabase.functions.invoke("process-billing", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (billingError) {
        console.error("Process billing error:", billingError);
      }

      // Then sync payment intents
      const { error: syncError } = await supabase.functions.invoke("sync-payments", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (syncError) {
        throw new Error(syncError.message);
      }

      // Refresh all billing data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-items"] }),
        queryClient.invalidateQueries({ queryKey: ["billing-history"] })
      ]);

      toast.success("Payment data synced from Stripe");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync payments: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  // Run dunning process manually
  const handleRunDunning = async () => {
    setIsRunningDunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to run dunning");
        return;
      }

      const { data, error } = await supabase.functions.invoke("process-payment-failures", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh payment failures data
      await queryClient.invalidateQueries({ queryKey: ["payment-failures"] });

      const { notificationsSent = 0, subscriptionsSuspended = 0 } = data || {};
      
      if (notificationsSent > 0 || subscriptionsSuspended > 0) {
        toast.success(`Dunning complete: ${notificationsSent} notifications sent, ${subscriptionsSuspended} subscriptions suspended`);
      } else {
        toast.success("Dunning process complete - no actions needed");
      }
    } catch (error) {
      console.error("Dunning error:", error);
      toast.error("Failed to run dunning: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsRunningDunning(false);
    }
  };

  // Retry a failed payment via Stripe
  const handleRetryPayment = async (failure: PaymentFailure) => {
    if (!failure.stripe_invoice_id) {
      toast.error("No invoice ID available for retry");
      return;
    }

    // Check cooldown on client side too
    const cooldownInfo = getRetryCooldownInfo(failure);
    if (cooldownInfo.onCooldown) {
      toast.error(`Please wait ${cooldownInfo.remainingMinutes} minute${cooldownInfo.remainingMinutes !== 1 ? 's' : ''} before retrying again.`);
      return;
    }

    setIsRetrying(failure.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to retry payments");
        return;
      }

      const { data, error } = await supabase.functions.invoke("retry-payment", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { failureId: failure.id }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || "Payment retry successful!");
        await queryClient.invalidateQueries({ queryKey: ["payment-failures"] });
        await queryClient.invalidateQueries({ queryKey: ["billing-history"] });
      } else if (data.cooldown) {
        toast.error(data.message);
      } else {
        toast.error(data.message || "Payment retry failed");
      }
    } catch (error) {
      console.error("Retry payment error:", error);
      toast.error("Failed to retry payment: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsRetrying(null);
    }
  };

  // Check if retry is on cooldown (1 hour between retries)
  const getRetryCooldownInfo = (failure: PaymentFailure) => {
    if (!failure.last_retry_at) {
      return { onCooldown: false, remainingMinutes: 0 };
    }
    
    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    const lastRetry = new Date(failure.last_retry_at).getTime();
    const now = Date.now();
    const timeSinceRetry = now - lastRetry;
    
    if (timeSinceRetry < COOLDOWN_MS) {
      const remainingMinutes = Math.ceil((COOLDOWN_MS - timeSinceRetry) / (60 * 1000));
      return { onCooldown: true, remainingMinutes };
    }
    
    return { onCooldown: false, remainingMinutes: 0 };
  };

  // Activate an incomplete subscription by paying its open invoice
  const handleActivateSubscription = async (subscriptionId: string, customerName: string) => {
    setIsActivating(subscriptionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to activate subscriptions");
        return;
      }

      const { data, error } = await supabase.functions.invoke("activate-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { subscriptionId }
      });

      if (error) throw error;

      if (data.success) {
        if (data.alreadyActive) {
          toast.info("Subscription is already active — no additional charges were created.");
        } else {
          toast.success(data.message || `Subscription activated for ${customerName}`);
          setActivatedIds(prev => new Set(prev).add(subscriptionId));
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] }),
          queryClient.invalidateQueries({ queryKey: ["subscription-items"] }),
          queryClient.invalidateQueries({ queryKey: ["billing-history"] })
        ]);
      } else {
        toast.error(data.error || "Failed to activate subscription");
      }
    } catch (error) {
      console.error("Activate subscription error:", error);
      toast.error("Failed to activate: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsActivating(null);
    }
  };



  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ["customer-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          *,
          customers (
            full_name,
            email,
            company_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      // Type assertion to handle the subscription_type field
      return (data || []).map(sub => ({
        ...sub,
        subscription_type: sub.subscription_type as SubscriptionType | null
      })) as (CustomerSubscription & { partner_id: string | null })[];
    }
  });

  // Fetch partners for the assign partner dialog
  const { data: partners } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, company_name, referral_code, commission_rate, is_active")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string; company_name: string | null; referral_code: string; commission_rate: number; is_active: boolean }[];
    }
  });

  // Assign partner to subscription
  const handleAssignPartner = async () => {
    if (!selectedSubscriptionForPartner) return;
    setIsAssigningPartner(true);
    try {
      const { error } = await supabase
        .from("customer_subscriptions")
        .update({ partner_id: selectedPartnerId || null })
        .eq("id", selectedSubscriptionForPartner.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      toast.success(selectedPartnerId ? "Partner assigned successfully" : "Partner removed from subscription");
      setAssignPartnerDialogOpen(false);
      setSelectedSubscriptionForPartner(null);
      setSelectedPartnerId("");
    } catch (error) {
      toast.error("Failed to assign partner: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAssigningPartner(false);
    }
  };

  // Fetch subscription items
  const { data: subscriptionItems } = useQuery({
    queryKey: ["subscription-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_items")
        .select(`
          *,
          trailers (
            trailer_number,
            type,
            year
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SubscriptionItem[];
    }
  });

  // Fetch discounts
  const { data: discounts, isLoading: loadingDiscounts } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    }
  });

  // Fetch billing history
  const { data: billingHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["billing-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_history")
        .select(`
          *,
          customer_subscriptions (
            customers (
              full_name,
              company_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as BillingHistoryItem[];
    }
  });

  // Fetch payment failures
  const { data: paymentFailures, isLoading: loadingFailures } = useQuery({
    queryKey: ["payment-failures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_failures")
        .select(`
          *,
          customer_subscriptions (
            grace_period_start,
            grace_period_end,
            customers (
              full_name,
              email,
              company_name
            )
          )
        `)
        .order("failed_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as PaymentFailure[];
    }
  });

  // Filter and sort payment failures
  const filteredPaymentFailures = paymentFailures
    ?.filter((failure) => {
      // Status filter
      if (failuresStatusFilter === "resolved" && !failure.resolved_at) return false;
      if (failuresStatusFilter === "unresolved" && failure.resolved_at) return false;
      
      // Search filter
      if (failuresSearch) {
        const search = failuresSearch.toLowerCase();
        const customerName = failure.customer_subscriptions?.customers?.full_name?.toLowerCase() || "";
        const customerEmail = failure.customer_subscriptions?.customers?.email?.toLowerCase() || "";
        const companyName = failure.customer_subscriptions?.customers?.company_name?.toLowerCase() || "";
        const failureCode = failure.failure_code?.toLowerCase() || "";
        
        return customerName.includes(search) || 
               customerEmail.includes(search) || 
               companyName.includes(search) ||
               failureCode.includes(search);
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (failuresSortBy) {
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "customer":
          const nameA = a.customer_subscriptions?.customers?.full_name || "";
          const nameB = b.customer_subscriptions?.customers?.full_name || "";
          comparison = nameA.localeCompare(nameB);
          break;
        case "failed_at":
        default:
          comparison = new Date(a.failed_at).getTime() - new Date(b.failed_at).getTime();
          break;
      }
      
      return failuresSortOrder === "asc" ? comparison : -comparison;
    });

  // Fetch cron job history
  const { data: cronData, isLoading: loadingCron } = useQuery({
    queryKey: ["cron-history"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("get-cron-history", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (error) throw error;
      return data as { jobs: CronJob[]; history: CronRun[] };
    }
  });

  // Fetch retry notification setting
  const { data: retryNotificationSetting } = useQuery({
    queryKey: ["retry-notification-setting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_settings")
        .select("setting_value")
        .eq("setting_key", "payment_retry_notification_enabled")
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value !== "false";
    }
  });

  // Fetch Stripe webhook logs
  const { data: webhookLogs, isLoading: loadingWebhookLogs } = useQuery({
    queryKey: ["stripe-webhook-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stripe_webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as StripeWebhookLog[];
    }
  });

  const webhookErrorCount = webhookLogs?.filter(log => log.status === "error").length || 0;

  // Toggle retry notification setting
  const toggleRetryNotificationMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("outreach_settings")
        .upsert({
          setting_key: "payment_retry_notification_enabled",
          setting_value: enabled ? "true" : "false",
          description: "Send email notifications to customers when an admin retries their failed payment",
          updated_at: new Date().toISOString()
        }, { onConflict: "setting_key" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retry-notification-setting"] });
      toast.success("Notification setting updated");
    },
    onError: (error) => {
      toast.error("Failed to update setting: " + error.message);
    }
  });

  // Fetch retry logs for a specific failure
  const { data: retryLogs, isLoading: loadingRetryLogs } = useQuery({
    queryKey: ["payment-retry-logs", selectedFailureForHistory?.id],
    queryFn: async () => {
      if (!selectedFailureForHistory?.id) return [];
      
      const { data, error } = await supabase
        .from("payment_retry_logs")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq("payment_failure_id", selectedFailureForHistory.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PaymentRetryLog[];
    },
    enabled: !!selectedFailureForHistory?.id
  });

  // Create discount mutation
  const createDiscountMutation = useMutation({
    mutationFn: async (discount: typeof newDiscount) => {
      const { error } = await supabase
        .from("discounts")
        .insert({
          name: discount.name,
          code: discount.code || null,
          type: discount.type,
          value: discount.value,
          min_trailers: discount.min_trailers,
          max_uses: discount.max_uses,
          valid_until: discount.valid_until || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setIsDiscountDialogOpen(false);
      setNewDiscount({
        name: "",
        code: "",
        type: "percentage",
        value: 0,
        min_trailers: 1,
        max_uses: null,
        valid_until: ""
      });
      toast.success("Discount created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create discount: " + error.message);
    }
  });

  // Toggle discount active status
  const toggleDiscountMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("discounts")
        .update({ is_active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount updated");
    }
  });

  // Manually resolve payment failure
  const resolveFailureMutation = useMutation({
    mutationFn: async ({ 
      failureId, 
      resolutionType, 
      notes 
    }: { 
      failureId: string; 
      resolutionType: string; 
      notes: string;
    }) => {
      const { error } = await supabase
        .from("payment_failures")
        .update({
          resolved_at: new Date().toISOString(),
          resolution_type: resolutionType,
          failure_message: notes ? `[Manual Resolution] ${notes}` : "[Manual Resolution]"
        })
        .eq("id", failureId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-failures"] });
      setResolveDialogOpen(false);
      setSelectedFailure(null);
      setResolutionNotes("");
      setResolutionType("manual_payment");
      toast.success("Payment failure resolved successfully");
    },
    onError: (error) => {
      toast.error("Failed to resolve: " + error.message);
    }
  });

  // Bulk resolve payment failures
  const bulkResolveFailuresMutation = useMutation({
    mutationFn: async ({ 
      failureIds, 
      resolutionType, 
      notes 
    }: { 
      failureIds: string[]; 
      resolutionType: string; 
      notes: string;
    }) => {
      const { error } = await supabase
        .from("payment_failures")
        .update({
          resolved_at: new Date().toISOString(),
          resolution_type: resolutionType,
          failure_message: notes ? `[Bulk Resolution] ${notes}` : "[Bulk Resolution]"
        })
        .in("id", failureIds);
      
      if (error) throw error;
    },
    onSuccess: (_, { failureIds }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-failures"] });
      setIsBulkResolveDialogOpen(false);
      setSelectedFailureIds(new Set());
      setBulkResolutionNotes("");
      setBulkResolutionType("manual_payment");
      toast.success(`${failureIds.length} payment failure${failureIds.length !== 1 ? 's' : ''} resolved successfully`);
    },
    onError: (error) => {
      toast.error("Failed to bulk resolve: " + error.message);
    }
  });

  // Bulk selection helpers
  const unresolvedFilteredFailures = filteredPaymentFailures?.filter(f => !f.resolved_at) || [];
  const allUnresolvedSelected = unresolvedFilteredFailures.length > 0 && 
    unresolvedFilteredFailures.every(f => selectedFailureIds.has(f.id));
  const someUnresolvedSelected = unresolvedFilteredFailures.some(f => selectedFailureIds.has(f.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedFailureIds);
      unresolvedFilteredFailures.forEach(f => newSelected.add(f.id));
      setSelectedFailureIds(newSelected);
    } else {
      const newSelected = new Set(selectedFailureIds);
      unresolvedFilteredFailures.forEach(f => newSelected.delete(f.id));
      setSelectedFailureIds(newSelected);
    }
  };

  const handleSelectOne = (failureId: string, checked: boolean) => {
    const newSelected = new Set(selectedFailureIds);
    if (checked) {
      newSelected.add(failureId);
    } else {
      newSelected.delete(failureId);
    }
    setSelectedFailureIds(newSelected);
  };

  // Calculate stats
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const totalMonthlyRevenue = subscriptionItems?.filter(i => i.status === "active")
    .reduce((sum, item) => sum + Number(item.monthly_rate), 0) || 0;
  const pendingDeposits = subscriptions?.filter(s => !s.deposit_paid && s.deposit_amount > 0).length || 0;
  const unresolvedFailures = paymentFailures?.filter(f => !f.resolved_at).length || 0;
  const recentPayments = billingHistory?.filter(h => h.status === "succeeded").slice(0, 5) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      paused: "outline",
      suspended: "destructive",
      canceled: "destructive",
      cancelled: "destructive",
      succeeded: "default",
      failed: "destructive",
      processing: "secondary",
      refunded: "outline"
    };
    
    const labels: Record<string, string> = {
      active: "Active",
      pending: "Pending",
      paused: "Paused",
      suspended: "Suspended",
      canceled: "Canceled",
      cancelled: "Cancelled",
      succeeded: "Succeeded",
      failed: "Failed",
      processing: "Processing",
      refunded: "Refunded"
    };
    
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getBillingCycleLabel = (cycle: BillingCycle) => {
    const labels: Record<BillingCycle, string> = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      semimonthly: "Twice Monthly",
      monthly: "Monthly"
    };
    return labels[cycle];
  };

  const getSubscriptionTypeLabel = (type: SubscriptionType | null) => {
    if (!type) return { label: "Standard Lease", icon: null, variant: "outline" as const };
    const config: Record<SubscriptionType, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      standard_lease: { label: "Standard Lease", icon: null, variant: "outline" },
      "6_month_lease": { label: "6 Mo Lease", icon: <Calendar className="h-3 w-3 mr-1" />, variant: "secondary" },
      "24_month_lease": { label: "24 Mo Lease", icon: <Calendar className="h-3 w-3 mr-1" />, variant: "secondary" },
      rent_for_storage: { label: "Storage", icon: <Warehouse className="h-3 w-3 mr-1" />, variant: "secondary" },
      lease_to_own: { label: "Lease to Own", icon: <KeyRound className="h-3 w-3 mr-1" />, variant: "default" },
      repayment_plan: { label: "Repayment", icon: <CreditCard className="h-3 w-3 mr-1" />, variant: "destructive" },
    };
    return config[type];
  };

  const getDiscountTypeIcon = (type: DiscountType) => {
    switch (type) {
      case "percentage": return <Percent className="h-4 w-4" />;
      case "fixed": return <DollarSign className="h-4 w-4" />;
      case "multi_trailer": return <Truck className="h-4 w-4" />;
      case "promo_code": return <Tag className="h-4 w-4" />;
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}% off`;
    }
    return `$${discount.value} off`;
  };

  const getGracePeriodStatus = (failure: PaymentFailure) => {
    if (failure.resolved_at) {
      const resolutionLabels: Record<string, string> = {
        paid: "Paid",
        canceled: "Canceled",
        manual_payment: "Manual Payment",
        waived: "Waived",
        other: "Resolved"
      };
      return { 
        label: resolutionLabels[failure.resolution_type || ""] || "Resolved", 
        variant: "outline" as const 
      };
    }
    
    const now = new Date();
    const failedAt = new Date(failure.failed_at);
    const daysSinceFailed = Math.floor((now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceFailed >= 7) {
      return { label: "Grace Expired", variant: "destructive" as const };
    } else if (daysSinceFailed >= 5) {
      return { label: `Day ${daysSinceFailed} - Final Warning`, variant: "destructive" as const };
    } else if (daysSinceFailed >= 3) {
      return { label: `Day ${daysSinceFailed} - At Risk`, variant: "secondary" as const };
    }
    return { label: `Day ${daysSinceFailed}`, variant: "outline" as const };
  };

  const getNotificationStatus = (failure: PaymentFailure) => {
    const notifications = [];
    if (failure.notification_sent_day_0) notifications.push("Day 0");
    if (failure.notification_sent_day_3) notifications.push("Day 3");
    if (failure.notification_sent_day_5) notifications.push("Day 5");
    return notifications;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Billing & Payments</h1>
              <Button 
                variant="outline" 
                onClick={handleSyncPayments}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Payments"}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers with active billing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalMonthlyRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From active leases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Deposits
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingDeposits}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting payment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Payment Failures
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${unresolvedFailures > 0 ? "text-destructive" : ""}`}>
                    {unresolvedFailures}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unresolved failures
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ready to Activate Section */}
            <div className="mb-8">
              <ReadyToActivateCard />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="create-subscription">
                  <Plus className="h-4 w-4 mr-1" />
                  New Subscription
                </TabsTrigger>
                {selectedSubscriptionId && (
                  <TabsTrigger value="edit-subscription">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit Subscription
                  </TabsTrigger>
                )}
                <TabsTrigger value="failures" className="relative">
                  Payment Failures
                  {unresolvedFailures > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                      {unresolvedFailures}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
                <TabsTrigger value="cron">
                  <Timer className="h-4 w-4 mr-1" />
                  Scheduled Jobs
                </TabsTrigger>
                <TabsTrigger value="stripe-events" className="relative">
                  <Webhook className="h-4 w-4 mr-1" />
                  Stripe Events
                  {webhookErrorCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                      {webhookErrorCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Create Subscription Tab (inline full-page form) */}
              <TabsContent value="create-subscription">
                <Card>
                  <CardContent className="pt-6">
                    <CreateSubscriptionDialog
                      mode="inline"
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
                        queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
                        toast.success("Subscription created successfully");
                        setActiveTab("subscriptions");
                      }}
                      onCancel={() => setActiveTab("subscriptions")}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Subscription Tab (inline panel) */}
              <TabsContent value="edit-subscription">
                {selectedSubscriptionId && (
                  <Card>
                    <CardContent className="pt-6">
                      <EditSubscriptionPanel
                        subscriptionId={selectedSubscriptionId}
                        onSave={() => {
                          queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
                          queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
                          setSelectedSubscriptionId(null);
                          setActiveTab("subscriptions");
                        }}
                        onCancel={() => {
                          setSelectedSubscriptionId(null);
                          setActiveTab("subscriptions");
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Customer Subscriptions</CardTitle>
                      <CardDescription>
                        Manage billing cycles, deposits, and trailer assignments
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isSyncing}
                        onClick={handleSyncPayments}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync Payments"}
                      </Button>
                      <Button onClick={() => setActiveTab("create-subscription")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Subscription
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSubscriptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : subscriptions && subscriptions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Contract Period</TableHead>
                            <TableHead>Billing Cycle</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead>Deposit</TableHead>
                            <TableHead>Trailers</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((sub) => {
                            const trailerCount = subscriptionItems?.filter(
                              i => i.subscription_id === sub.id && i.status === "active"
                            ).length || 0;
                            
                            // Check if subscription has any successful billing history
                            const hasSuccessfulPayment = billingHistory?.some(
                              bh => bh.subscription_id === sub.id && bh.status === "succeeded"
                            );
                            
                            // Get the most recent billing_history entry for this subscription
                            const latestPaymentRecord = billingHistory
                              ?.filter(bh => bh.subscription_id === sub.id)
                              ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())?.[0];

                            const hasProcessingPayment = latestPaymentRecord && 
                              (latestPaymentRecord.status === "processing" || latestPaymentRecord.status === "pending");
                            
                            // Determine if this subscription is in processing state
                            // Only show processing for active subs with pending/processing payments
                            const isProcessing = activatedIds.has(sub.id) || 
                              (hasProcessingPayment && !hasSuccessfulPayment);

                            // Determine the Stripe-aligned label
                            const processingLabel = latestPaymentRecord?.status === "pending" ? "Pending"
                              : latestPaymentRecord?.status === "processing" ? "Processing"
                              : activatedIds.has(sub.id) ? "Processing"
                              : "Processing";
                            
                            // Check if subscription is ready to activate
                            // Pending subs with Stripe IDs are ready (even if previously attempted)
                            // Active subs with no successful payment also qualify ONLY if they're genuinely pending
                            // (not just missing billing_history due to sync lag)
                            const hasBillingHistoryRecords = billingHistory?.some(
                              bh => bh.subscription_id === sub.id
                            );
                            const isReadyToActivate = !isProcessing && sub.stripe_subscription_id && 
                              sub.stripe_customer_id && !hasProcessingPayment && 
                              !(sub.status === "active" && sub.deposit_paid) && (
                                sub.status === "pending" || 
                                // Only show Activate for active subs if they have billing_history but none succeeded
                                // If they have NO billing_history at all, it's likely a sync gap — don't show Activate
                                (sub.status === "active" && !hasSuccessfulPayment && hasBillingHistoryRecords)
                              );
                            
                            // Show warning badge for active subs with no successful payments AND no billing history
                            // (indicates sync hasn't run yet)
                            const needsSync = sub.status === "active" && 
                              sub.stripe_subscription_id && !hasBillingHistoryRecords;
                            
                            // Show warning badge for active subs with billing history but no successful payments
                            const hasPaymentWarning = sub.status === "active" && 
                              sub.stripe_subscription_id && !hasSuccessfulPayment && !needsSync;
                            
                            return (
                              <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedSubscriptionId(sub.id); setActiveTab("edit-subscription"); }}>
                              <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {sub.customers?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {sub.customers?.company_name || sub.customers?.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const typeConfig = getSubscriptionTypeLabel(sub.subscription_type);
                                    return (
                                      <Badge variant={typeConfig.variant} className="whitespace-nowrap">
                                        {typeConfig.icon}
                                        {typeConfig.label}
                                      </Badge>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p>{format(new Date(sub.created_at), "MMM d, yyyy")}</p>
                                    <p className="text-muted-foreground">
                                      {sub.end_date 
                                        ? `to ${format(new Date(sub.end_date), "MMM d, yyyy")}`
                                        : "Ongoing"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {getBillingCycleLabel(sub.billing_cycle)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {sub.next_billing_date 
                                    ? format(new Date(sub.next_billing_date), "MMM d, yyyy")
                                    : "—"
                                  }
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>${sub.deposit_amount}</span>
                                    {sub.deposit_paid ? (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : sub.deposit_amount > 0 ? (
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                    ) : null}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    <Truck className="h-3 w-3 mr-1" />
                                    {trailerCount}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(sub.status)}
                                    {isReadyToActivate && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                                              <Zap className="h-3 w-3 mr-1" />
                                              Ready
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Customer has completed payment setup.</p>
                                            <p className="text-muted-foreground">Click Activate to charge the initial invoice.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {needsSync && !isReadyToActivate && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge variant="outline" className="text-muted-foreground border-muted">
                                              <RefreshCw className="h-3 w-3 mr-1" />
                                              Sync
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Billing data not yet synced from Stripe.</p>
                                            <p className="text-muted-foreground">Click "Sync Payments" to update.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {hasPaymentWarning && !isReadyToActivate && !needsSync && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                                              <AlertTriangle className="h-3 w-3 mr-1" />
                                              No Payment
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>This subscription is active but has no successful payments.</p>
                                            <p className="text-muted-foreground">Stripe may not have a payment method on file.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-1">
                                    {isProcessing ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                        className="h-8 cursor-not-allowed"
                                      >
                                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                        {processingLabel}
                                      </Button>
                                    ) : isReadyToActivate ? (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        disabled={isActivating === sub.id}
                                        onClick={() => handleActivateSubscription(sub.id, sub.customers?.full_name || "Unknown")}
                                        className="h-8"
                                      >
                                        {isActivating === sub.id ? (
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Zap className="h-3 w-3 mr-1" />
                                            Activate
                                          </>
                                        )}
                                      </Button>
                                    ) : null}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={isManaging || isActivating === sub.id}>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {/* Edit Contract Dates - always available */}
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedSubscriptionForDates({
                                              id: sub.id,
                                              customerName: sub.customers?.full_name || "Unknown",
                                              startDate: sub.created_at,
                                              endDate: sub.end_date,
                                            });
                                            setEditDatesDialogOpen(true);
                                          }}
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit Contract Dates
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedSubscriptionForPartner({
                                              id: sub.id,
                                              customerName: sub.customers?.full_name || "Unknown",
                                              currentPartnerId: (sub as any).partner_id || null,
                                            });
                                            setSelectedPartnerId((sub as any).partner_id || "");
                                            setAssignPartnerDialogOpen(true);
                                          }}
                                        >
                                          <Handshake className="h-4 w-4 mr-2" />
                                          Assign Partner
                                          {(sub as any).partner_id && (
                                            <Badge variant="secondary" className="ml-auto text-xs">Assigned</Badge>
                                          )}
                                        </DropdownMenuItem>
                                        {sub.subscription_type === "lease_to_own" && (
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setSelectedSubscriptionForUpload({
                                                id: sub.id,
                                                customerName: sub.customers?.full_name || "Unknown",
                                                contractStartDate: null,
                                              });
                                              setAgreementContractDate("");
                                              setAgreementFile(null);
                                              setUploadAgreementDialogOpen(true);
                                            }}
                                          >
                                            <FileCheck className="h-4 w-4 mr-2" />
                                            Upload Agreement
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        {isReadyToActivate && (
                                          <>
                                            <DropdownMenuItem
                                              onClick={() => handleActivateSubscription(sub.id, sub.customers?.full_name || "Unknown")}
                                              disabled={isActivating === sub.id}
                                            >
                                              <Zap className="h-4 w-4 mr-2" />
                                              Activate Subscription
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                          </>
                                        )}
                                        {(sub.status === "active" || sub.status === "pending") && (
                                          <DropdownMenuItem
                                            onClick={() => {
                                              const items = subscriptionItems?.filter(
                                                i => i.subscription_id === sub.id
                                              ) || [];
                                              setSelectedSubscriptionForTrailers({
                                                subscriptionId: sub.id,
                                                customerId: sub.customer_id,
                                                customerName: sub.customers?.full_name || "Unknown",
                                                items: items,
                                              });
                                              setManageTrailersDialogOpen(true);
                                            }}
                                          >
                                            <Truck className="h-4 w-4 mr-2" />
                                            Manage Trailers
                                          </DropdownMenuItem>
                                        )}
                                        {sub.status === "active" && (
                                          <>
                                            <ChargeCustomerDialog
                                              customerId={sub.customer_id}
                                              customerName={sub.customers?.full_name || "Unknown"}
                                              onSuccess={() => queryClient.invalidateQueries({ queryKey: ["billing-history"] })}
                                              trigger={
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                  <DollarSign className="h-4 w-4 mr-2" />
                                                  One-Time Charge
                                                </DropdownMenuItem>
                                              }
                                            />
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={() => setConfirmAction({
                                                subscriptionId: sub.id,
                                                action: "pause",
                                                customerName: sub.customers?.full_name || "Unknown"
                                              })}
                                            >
                                              <Pause className="h-4 w-4 mr-2" />
                                              Pause Subscription
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        {sub.status === "paused" && (
                                          <DropdownMenuItem
                                            onClick={() => setConfirmAction({
                                              subscriptionId: sub.id,
                                              action: "resume",
                                              customerName: sub.customers?.full_name || "Unknown"
                                            })}
                                          >
                                            <Play className="h-4 w-4 mr-2" />
                                            Resume Subscription
                                          </DropdownMenuItem>
                                        )}
                                        {sub.status === "suspended" && (
                                          <DropdownMenuItem
                                            onClick={() => setConfirmAction({
                                              subscriptionId: sub.id,
                                              action: "resume",
                                              customerName: sub.customers?.full_name || "Unknown"
                                            })}
                                          >
                                            <Play className="h-4 w-4 mr-2" />
                                            Reinstate Account
                                          </DropdownMenuItem>
                                        )}
                                        {(sub.status === "active" || sub.status === "paused" || sub.status === "pending" || sub.status === "suspended") && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-destructive focus:text-destructive"
                                              onClick={() => setConfirmAction({
                                                subscriptionId: sub.id,
                                                action: "cancel",
                                                customerName: sub.customers?.full_name || "Unknown"
                                              })}
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Cancel Subscription
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => setDeleteConfirm({
                                            subscriptionId: sub.id,
                                            customerName: sub.customers?.full_name || "Unknown",
                                            stripeSubscriptionId: sub.stripe_subscription_id
                                          })}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Subscription
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No subscriptions yet</p>
                        <p className="text-sm">Subscriptions are created when customers complete ACH setup</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Failures Tab */}
              <TabsContent value="failures">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Payment Failures & Dunning
                      </CardTitle>
                      <CardDescription>
                        Track failed payments, grace periods, and automated notification status
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <Switch
                                checked={retryNotificationSetting ?? true}
                                onCheckedChange={(checked) => toggleRetryNotificationMutation.mutate(checked)}
                                disabled={toggleRetryNotificationMutation.isPending}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Email customers when retrying payments</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="outline"
                        onClick={handleRunDunning}
                        disabled={isRunningDunning || unresolvedFailures === 0}
                      >
                        <Mail className={`h-4 w-4 mr-2 ${isRunningDunning ? "animate-pulse" : ""}`} />
                        {isRunningDunning ? "Processing..." : "Run Dunning"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by customer, email, or failure code..."
                          value={failuresSearch}
                          onChange={(e) => setFailuresSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select
                        value={failuresStatusFilter}
                        onValueChange={(value: "all" | "unresolved" | "resolved") => setFailuresStatusFilter(value)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="unresolved">Unresolved</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={`${failuresSortBy}-${failuresSortOrder}`}
                        onValueChange={(value) => {
                          const [sortBy, sortOrder] = value.split("-") as [typeof failuresSortBy, typeof failuresSortOrder];
                          setFailuresSortBy(sortBy);
                          setFailuresSortOrder(sortOrder);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="failed_at-desc">Newest First</SelectItem>
                          <SelectItem value="failed_at-asc">Oldest First</SelectItem>
                          <SelectItem value="amount-desc">Highest Amount</SelectItem>
                          <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                          <SelectItem value="customer-asc">Customer A-Z</SelectItem>
                          <SelectItem value="customer-desc">Customer Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {loadingFailures ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredPaymentFailures && filteredPaymentFailures.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          {paymentFailures && paymentFailures.length !== filteredPaymentFailures.length && (
                            <p className="text-sm text-muted-foreground">
                              Showing {filteredPaymentFailures.length} of {paymentFailures.length} records
                            </p>
                          )}
                          {selectedFailureIds.size > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-sm text-muted-foreground">
                                {selectedFailureIds.size} selected
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFailureIds(new Set())}
                              >
                                Clear
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setIsBulkResolveDialogOpen(true)}
                              >
                                <FileCheck className="h-4 w-4 mr-1" />
                                Bulk Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]">
                                <Checkbox
                                  checked={allUnresolvedSelected}
                                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                  aria-label="Select all unresolved"
                                  className={someUnresolvedSelected && !allUnresolvedSelected ? "data-[state=checked]:bg-muted" : ""}
                                />
                              </TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Failed At</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Grace Period</TableHead>
                              <TableHead>Notifications</TableHead>
                              <TableHead>Retries</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPaymentFailures.map((failure) => {
                              const gracePeriodStatus = getGracePeriodStatus(failure);
                              const notifications = getNotificationStatus(failure);
                              const isSelected = selectedFailureIds.has(failure.id);
                            
                            return (
                              <TableRow key={failure.id} className={`${!failure.resolved_at ? "bg-destructive/5" : ""} ${isSelected ? "bg-primary/10" : ""}`}>
                                <TableCell>
                                  {!failure.resolved_at ? (
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => handleSelectOne(failure.id, !!checked)}
                                      aria-label={`Select ${failure.customer_subscriptions?.customers?.full_name || "failure"}`}
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {failure.customer_subscriptions?.customers?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {failure.customer_subscriptions?.customers?.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-destructive">
                                  ${Number(failure.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(failure.failed_at), "MMM d, yyyy h:mm a")}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[200px]">
                                    <p className="text-sm font-medium">{failure.failure_code || "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground truncate" title={failure.failure_message || ""}>
                                      {failure.failure_message || "No details available"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {failure.customer_subscriptions?.grace_period_end && !failure.resolved_at ? (
                                    <div className="text-sm">
                                      <p className="font-medium">
                                        Ends {format(new Date(failure.customer_subscriptions.grace_period_end), "MMM d")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.max(0, Math.ceil((new Date(failure.customer_subscriptions.grace_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {notifications.length > 0 ? (
                                      notifications.map((n) => (
                                        <Badge key={n} variant="outline" className="text-xs">
                                          <Mail className="h-3 w-3 mr-1" />
                                          {n}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-muted-foreground text-sm">None sent</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {failure.retry_count > 0 ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0"
                                      onClick={() => {
                                        setSelectedFailureForHistory(failure);
                                        setRetryHistoryDialogOpen(true);
                                      }}
                                    >
                                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        {failure.retry_count} attempt{failure.retry_count !== 1 ? 's' : ''}
                                      </Badge>
                                    </Button>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={gracePeriodStatus.variant}>
                                    {failure.resolved_at && failure.resolution_type === "paid" && (
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                    )}
                                    {failure.resolved_at && failure.resolution_type === "canceled" && (
                                      <Ban className="h-3 w-3 mr-1" />
                                    )}
                                    {failure.resolved_at && (failure.resolution_type === "manual_payment" || failure.resolution_type === "waived" || failure.resolution_type === "other") && (
                                      <FileCheck className="h-3 w-3 mr-1" />
                                    )}
                                    {gracePeriodStatus.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {!failure.resolved_at && (() => {
                                    const cooldownInfo = getRetryCooldownInfo(failure);
                                    return (
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRetryPayment(failure)}
                                          disabled={!failure.stripe_invoice_id || isRetrying === failure.id || cooldownInfo.onCooldown}
                                          title={cooldownInfo.onCooldown 
                                            ? `Retry available in ${cooldownInfo.remainingMinutes} min` 
                                            : "Retry payment with customer's current payment method"}
                                        >
                                          <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying === failure.id ? "animate-spin" : ""}`} />
                                          {cooldownInfo.onCooldown 
                                            ? `${cooldownInfo.remainingMinutes}m` 
                                            : "Retry"}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedFailure(failure);
                                            setResolveDialogOpen(true);
                                          }}
                                        >
                                          <Phone className="h-3 w-3 mr-1" />
                                          Resolve
                                        </Button>
                                      </div>
                                    );
                                  })()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                        </Table>
                      </>
                    ) : paymentFailures && paymentFailures.length > 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No matching payment failures</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                        <p>No payment failures</p>
                        <p className="text-sm">All payments are processing normally</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discounts Tab */}
              <TabsContent value="discounts">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Discounts & Promo Codes</CardTitle>
                      <CardDescription>
                        Create and manage discount rules
                      </CardDescription>
                    </div>
                    <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Discount
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Discount</DialogTitle>
                          <DialogDescription>
                            Set up a new discount or promo code
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Discount Name</Label>
                            <Input
                              id="name"
                              value={newDiscount.name}
                              onChange={(e) => setNewDiscount(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Summer Special"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="type">Discount Type</Label>
                            <Select
                              value={newDiscount.type}
                              onValueChange={(value: DiscountType) => 
                                setNewDiscount(prev => ({ ...prev, type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage Off</SelectItem>
                                <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
                                <SelectItem value="multi_trailer">Multi-Trailer Discount</SelectItem>
                                <SelectItem value="promo_code">Promo Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(newDiscount.type === "promo_code" || newDiscount.type === "multi_trailer") && (
                            <div className="grid gap-2">
                              <Label htmlFor="code">Promo Code</Label>
                              <Input
                                id="code"
                                value={newDiscount.code}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  code: e.target.value.toUpperCase() 
                                }))}
                                placeholder="e.g., SUMMER25"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="value">
                                {newDiscount.type === "percentage" ? "Percentage" : "Amount ($)"}
                              </Label>
                              <Input
                                id="value"
                                type="number"
                                value={newDiscount.value}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  value: Number(e.target.value) 
                                }))}
                              />
                            </div>
                            {newDiscount.type === "multi_trailer" && (
                              <div className="grid gap-2">
                                <Label htmlFor="min_trailers">Min. Trailers</Label>
                                <Input
                                  id="min_trailers"
                                  type="number"
                                  value={newDiscount.min_trailers}
                                  onChange={(e) => setNewDiscount(prev => ({ 
                                    ...prev, 
                                    min_trailers: Number(e.target.value) 
                                  }))}
                                />
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="max_uses">Max Uses (optional)</Label>
                              <Input
                                id="max_uses"
                                type="number"
                                value={newDiscount.max_uses || ""}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  max_uses: e.target.value ? Number(e.target.value) : null 
                                }))}
                                placeholder="Unlimited"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="valid_until">Expires (optional)</Label>
                              <Input
                                id="valid_until"
                                type="date"
                                value={newDiscount.valid_until}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  valid_until: e.target.value 
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDiscountDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createDiscountMutation.mutate(newDiscount)}
                            disabled={!newDiscount.name || newDiscount.value <= 0}
                          >
                            Create Discount
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {loadingDiscounts ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : discounts && discounts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {discounts.map((discount) => (
                            <TableRow key={discount.id}>
                              <TableCell className="font-medium">{discount.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getDiscountTypeIcon(discount.type)}
                                  <span className="capitalize">
                                    {discount.type.replace("_", " ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDiscountValue(discount)}</TableCell>
                              <TableCell>
                                {discount.code ? (
                                  <code className="bg-muted px-2 py-1 rounded text-sm">
                                    {discount.code}
                                  </code>
                                ) : "—"}
                              </TableCell>
                              <TableCell>
                                {discount.current_uses}
                                {discount.max_uses ? ` / ${discount.max_uses}` : ""}
                              </TableCell>
                              <TableCell>
                                {discount.valid_until 
                                  ? format(new Date(discount.valid_until), "MMM d, yyyy")
                                  : "No expiry"
                                }
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={discount.is_active ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleDiscountMutation.mutate({
                                    id: discount.id,
                                    is_active: !discount.is_active
                                  })}
                                >
                                  {discount.is_active ? "Active" : "Inactive"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No discounts created</p>
                        <p className="text-sm">Create your first discount to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      View all processed and pending payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : billingHistory && billingHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Net</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingHistory.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {format(new Date(payment.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                {payment.customer_subscriptions?.customers?.full_name || "—"}
                              </TableCell>
                              <TableCell>
                                {payment.billing_period_start && payment.billing_period_end ? (
                                  <span className="text-sm">
                                    {format(new Date(payment.billing_period_start), "MMM d")} - 
                                    {format(new Date(payment.billing_period_end), "MMM d")}
                                  </span>
                                ) : "—"}
                              </TableCell>
                              <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                              <TableCell>
                                {Number(payment.discount_amount) > 0 
                                  ? `-$${Number(payment.discount_amount).toFixed(2)}`
                                  : "—"
                                }
                              </TableCell>
                              <TableCell className="font-medium">
                                ${Number(payment.net_amount).toFixed(2)}
                              </TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment history</p>
                        <p className="text-sm">Payments will appear here once customers are billed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scheduled Jobs Tab */}
              <TabsContent value="cron">
                <div className="grid gap-6">
                  {/* Active Jobs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        Scheduled Jobs
                      </CardTitle>
                      <CardDescription>
                        Active cron jobs running on a schedule
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingCron ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : cronData?.jobs && cronData.jobs.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Name</TableHead>
                              <TableHead>Schedule (Cron)</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cronData.jobs.map((job) => (
                              <TableRow key={job.jobid}>
                                <TableCell className="font-medium">{job.jobname}</TableCell>
                                <TableCell>
                                  <code className="bg-muted px-2 py-1 rounded text-sm">
                                    {job.schedule}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={job.active ? "default" : "secondary"}>
                                    {job.active ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No scheduled jobs</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Job Run History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Execution History
                      </CardTitle>
                      <CardDescription>
                        Recent cron job executions and their results
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingCron ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : cronData?.history && cronData.history.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Name</TableHead>
                              <TableHead>Start Time</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cronData.history.map((run) => {
                              const startTime = new Date(run.start_time);
                              const endTime = new Date(run.end_time);
                              const durationMs = endTime.getTime() - startTime.getTime();
                              
                              return (
                                <TableRow key={run.runid}>
                                  <TableCell className="font-medium">{run.jobname}</TableCell>
                                  <TableCell>
                                    {format(startTime, "MMM d, yyyy h:mm:ss a")}
                                  </TableCell>
                                  <TableCell>
                                    {durationMs < 1000 
                                      ? `${durationMs}ms` 
                                      : `${(durationMs / 1000).toFixed(2)}s`
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={run.return_message}>
                                      {run.return_message || "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={run.status === "succeeded" ? "default" : "destructive"}
                                    >
                                      {run.status === "succeeded" && (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                      )}
                                      {run.status === "failed" && (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      {run.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No execution history yet</p>
                          <p className="text-sm">History will appear after jobs run</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Stripe Events Tab */}
              <TabsContent value="stripe-events">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Stripe Webhook Events
                        </CardTitle>
                        <CardDescription>
                          Real-time log of Stripe webhook events received by the system
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["stripe-webhook-logs"] })}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingWebhookLogs ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : webhookLogs && webhookLogs.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhookLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{format(new Date(log.created_at), "MMM d, yyyy")}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {format(new Date(log.created_at), "h:mm:ss a")}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {log.event_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={log.status === "success" ? "default" : "destructive"}>
                                  {log.status === "success" ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {log.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {log.customer_email ? (
                                  <span className="text-sm">{log.customer_email}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {log.amount !== null ? (
                                  <span className="font-medium">${log.amount.toFixed(2)}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {log.error_message ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-destructive text-sm cursor-help truncate max-w-[200px] block">
                                          {log.error_message}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[400px]">
                                        <p className="text-sm">{log.error_message}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {log.stripe_subscription_id ? `Sub: ${log.stripe_subscription_id.slice(0, 12)}...` : "—"}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No webhook events logged yet</p>
                        <p className="text-sm">Events will appear here as Stripe sends webhooks</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Confirmation Dialog for Subscription Actions */}
            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {confirmAction?.action === "cancel" && "Cancel Subscription"}
                    {confirmAction?.action === "pause" && "Pause Subscription"}
                    {confirmAction?.action === "resume" && "Resume Subscription"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {confirmAction?.action === "cancel" && (
                      <>
                        Are you sure you want to cancel the subscription for <strong>{confirmAction.customerName}</strong>? 
                        This will stop all billing and release assigned trailers back to inventory. This action cannot be undone.
                      </>
                    )}
                    {confirmAction?.action === "pause" && (
                      <>
                        Are you sure you want to pause the subscription for <strong>{confirmAction.customerName}</strong>? 
                        Billing will be suspended and trailers will be released back to inventory.
                      </>
                    )}
                    {confirmAction?.action === "resume" && (
                      <>
                        Are you sure you want to resume the subscription for <strong>{confirmAction.customerName}</strong>? 
                        Billing will resume on the next cycle. Note: You may need to reassign trailers if they were released.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isManaging}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => confirmAction && handleManageSubscription(confirmAction.subscriptionId, confirmAction.action)}
                    disabled={isManaging}
                    className={confirmAction?.action === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                  >
                    {isManaging ? "Processing..." : (
                      confirmAction?.action === "cancel" ? "Cancel Subscription" :
                      confirmAction?.action === "pause" ? "Pause Subscription" :
                      "Resume Subscription"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Subscription Confirmation */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will <strong>permanently delete</strong> the subscription for <strong>{deleteConfirm?.customerName}</strong>, 
                    release all assigned trailers back to inventory, and remove all associated billing records. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSubscription}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete Subscription"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Manual Resolution Dialog */}
            <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manually Resolve Payment Failure</DialogTitle>
                  <DialogDescription>
                    Mark this payment failure as resolved. Use this when payment was collected offline, via phone, or waived.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedFailure?.customer_subscriptions?.customers?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Amount: ${selectedFailure?.amount?.toFixed(2)} • Failed: {selectedFailure?.failed_at ? format(new Date(selectedFailure.failed_at), "MMM d, yyyy") : ""}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resolution_type">Resolution Type</Label>
                    <Select
                      value={resolutionType}
                      onValueChange={(value: "manual_payment" | "waived" | "other") => setResolutionType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual_payment">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Collected (Offline/Phone)
                          </div>
                        </SelectItem>
                        <SelectItem value="waived">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Payment Waived
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Other Resolution
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="e.g., Payment received via check #1234, Customer called to resolve on 1/22..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResolveDialogOpen(false);
                      setSelectedFailure(null);
                      setResolutionNotes("");
                      setResolutionType("manual_payment");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedFailure) {
                        resolveFailureMutation.mutate({
                          failureId: selectedFailure.id,
                          resolutionType: resolutionType,
                          notes: resolutionNotes
                        });
                      }
                    }}
                    disabled={resolveFailureMutation.isPending}
                  >
                    {resolveFailureMutation.isPending ? "Resolving..." : "Mark as Resolved"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bulk Resolution Dialog */}
            <Dialog open={isBulkResolveDialogOpen} onOpenChange={setIsBulkResolveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Resolve Payment Failures</DialogTitle>
                  <DialogDescription>
                    Mark {selectedFailureIds.size} payment failure{selectedFailureIds.size !== 1 ? 's' : ''} as resolved.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedFailureIds.size} failure{selectedFailureIds.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total amount: ${
                        filteredPaymentFailures
                          ?.filter(f => selectedFailureIds.has(f.id))
                          .reduce((sum, f) => sum + Number(f.amount), 0)
                          .toFixed(2) || '0.00'
                      }
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bulk_resolution_type">Resolution Type</Label>
                    <Select
                      value={bulkResolutionType}
                      onValueChange={(value: "manual_payment" | "waived" | "other") => setBulkResolutionType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual_payment">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Collected (Offline/Phone)
                          </div>
                        </SelectItem>
                        <SelectItem value="waived">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Payment Waived
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Other Resolution
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bulk_notes">Notes (applies to all)</Label>
                    <Textarea
                      id="bulk_notes"
                      value={bulkResolutionNotes}
                      onChange={(e) => setBulkResolutionNotes(e.target.value)}
                      placeholder="e.g., Batch resolution for account reconciliation..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsBulkResolveDialogOpen(false);
                      setBulkResolutionNotes("");
                      setBulkResolutionType("manual_payment");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      bulkResolveFailuresMutation.mutate({
                        failureIds: Array.from(selectedFailureIds),
                        resolutionType: bulkResolutionType,
                        notes: bulkResolutionNotes
                      });
                    }}
                    disabled={bulkResolveFailuresMutation.isPending}
                  >
                    {bulkResolveFailuresMutation.isPending ? "Resolving..." : `Resolve ${selectedFailureIds.size} Failure${selectedFailureIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Retry History Dialog */}
            <Dialog open={retryHistoryDialogOpen} onOpenChange={setRetryHistoryDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Payment Retry History
                  </DialogTitle>
                  <DialogDescription>
                    Audit log of all retry attempts for this payment failure
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {selectedFailureForHistory && (
                    <div className="p-3 bg-muted rounded-lg mb-4">
                      <p className="text-sm font-medium">
                        {selectedFailureForHistory.customer_subscriptions?.customers?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Amount: ${Number(selectedFailureForHistory.amount).toFixed(2)} • Failed: {format(new Date(selectedFailureForHistory.failed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  
                  {loadingRetryLogs ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : retryLogs && retryLogs.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {retryLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className={`p-3 rounded-lg border ${
                            log.outcome === "success" ? "border-primary/30 bg-primary/5" :
                            log.outcome === "already_paid" ? "border-primary/30 bg-primary/5" :
                            "border-destructive/30 bg-destructive/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={log.outcome === "success" || log.outcome === "already_paid" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {log.outcome === "success" && "Success"}
                                  {log.outcome === "already_paid" && "Already Paid"}
                                  {log.outcome === "failed" && "Failed"}
                                  {log.outcome === "not_retryable" && "Not Retryable"}
                                </Badge>
                                {log.customer_notified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Notified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Retried by {log.profiles?.first_name || log.profiles?.email?.split("@")[0] || "Admin"}
                                {log.profiles?.last_name ? ` ${log.profiles.last_name}` : ""}
                              </p>
                              {log.error_message && (
                                <p className="text-xs text-destructive mt-1">
                                  {log.error_message}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                              <p>{format(new Date(log.created_at), "MMM d, yyyy")}</p>
                              <p>{format(new Date(log.created_at), "h:mm a")}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No retry attempts logged</p>
                      <p className="text-sm">Retry history will appear here after retry attempts</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRetryHistoryDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Manage Trailers Dialog */}
            {selectedSubscriptionForTrailers && (
              <ManageTrailersDialog
                open={manageTrailersDialogOpen}
                onOpenChange={setManageTrailersDialogOpen}
                subscriptionId={selectedSubscriptionForTrailers.subscriptionId}
                customerId={selectedSubscriptionForTrailers.customerId}
                customerName={selectedSubscriptionForTrailers.customerName}
                currentItems={selectedSubscriptionForTrailers.items}
              />
            )}

            {/* Edit Contract Dates Dialog */}
            <EditSubscriptionDatesDialog
              open={editDatesDialogOpen}
              onOpenChange={setEditDatesDialogOpen}
              subscription={selectedSubscriptionForDates}
            />

            {/* Upload Lease Agreement Dialog */}
            <Dialog open={uploadAgreementDialogOpen} onOpenChange={setUploadAgreementDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Upload Lease Agreement
                  </DialogTitle>
                  <DialogDescription>
                    Upload a signed lease-to-own agreement PDF for{" "}
                    <strong>{selectedSubscriptionForUpload?.customerName}</strong>. 
                    Optionally set the backdated contract start date.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="agreement-file">Agreement PDF <span className="text-destructive">*</span></Label>
                    <Input
                      id="agreement-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setAgreementFile(e.target.files?.[0] || null)}
                    />
                    {agreementFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {agreementFile.name} ({(agreementFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract-start-date">Contract Start Date (backdated)</Label>
                    <Input
                      id="contract-start-date"
                      type="date"
                      value={agreementContractDate}
                      onChange={(e) => setAgreementContractDate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set this to the original contract date if backdating. Leave blank to keep the current date.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadAgreementDialogOpen(false)} disabled={isUploadingAgreement}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadAgreement} disabled={isUploadingAgreement || !agreementFile}>
                    {isUploadingAgreement ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Upload Agreement
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Partner Dialog */}
            <Dialog open={assignPartnerDialogOpen} onOpenChange={setAssignPartnerDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Assign Partner
                  </DialogTitle>
                  <DialogDescription>
                    Link {selectedSubscriptionForPartner?.customerName}'s subscription to a business partner for commission tracking.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {partners && partners.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Select Partner</Label>
                      <button
                        className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${!selectedPartnerId ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                        onClick={() => setSelectedPartnerId("")}
                      >
                        <span className="text-muted-foreground">— No partner (remove assignment)</span>
                      </button>
                      {partners.map((partner) => (
                        <button
                          key={partner.id}
                          className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${selectedPartnerId === partner.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                          onClick={() => setSelectedPartnerId(partner.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{partner.name}</p>
                              {partner.company_name && <p className="text-muted-foreground text-xs">{partner.company_name}</p>}
                            </div>
                            <div className="text-right">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{partner.referral_code}</code>
                              <p className="text-xs text-muted-foreground mt-0.5">{(partner.commission_rate * 100).toFixed(0)}% commission</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No active partners. Add partners in Referrals → Partners tab.</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignPartnerDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAssignPartner} disabled={isAssigningPartner}>
                    {isAssigningPartner ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {selectedPartnerId ? "Assign Partner" : "Remove Partner"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

