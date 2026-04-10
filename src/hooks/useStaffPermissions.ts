import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const ALL_SECTION_KEYS = [
  "dashboard",
  "applications",
  "fleet",
  "archived_trailers",
  "dot_inspections",
  "work_orders",
  "tolls",
  "customers",
  "staff",
  "employee",
  "mechanics",
  "referrals",
  "billing",
  "payments",
  "support",
  "outreach",
  "call_logs",
  "lead_sources",
  "phone_leads",
  "analytics",
  "logs",
  "content_schedule",
  "sitemap",
  "indexnow",
  "reports",
  "view_dashboard_revenue",
  "view_payment_amounts",
] as const;

export type SectionKey = typeof ALL_SECTION_KEYS[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  dashboard: "Dashboard",
  applications: "Applications",
  fleet: "Fleet",
  archived_trailers: "Archived Trailers",
  dot_inspections: "DOT Inspections",
  work_orders: "Work Orders",
  tolls: "Tolls",
  customers: "Customers",
  staff: "Staff",
  employee: "Employee Dashboard",
  mechanics: "Mechanics",
  referrals: "Referrals",
  billing: "Billing",
  payments: "Payments",
  support: "Support",
  outreach: "Outreach",
  call_logs: "Call Logs",
  lead_sources: "Lead Sources",
  phone_leads: "Phone Leads",
  analytics: "Analytics",
  logs: "Logs",
  content_schedule: "Content Schedule",
  sitemap: "Sitemap",
  indexnow: "IndexNow",
  reports: "Reports",
  view_dashboard_revenue: "View Dashboard Revenue",
  view_payment_amounts: "View Payment Amounts",
};

export function useStaffPermissions() {
  const { user, userRole, isImpersonating, impersonatedUser, effectiveRole } = useAuth();
  
  // When impersonating a sales user, use their permissions; otherwise use actual role
  const targetUserId = isImpersonating && impersonatedUser?.role === "sales" ? impersonatedUser.id : user?.id;
  const isFullAdmin = isImpersonating 
    ? effectiveRole === "admin" 
    : userRole === "admin";

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["staff-permissions", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_permissions")
        .select("section_key")
        .eq("user_id", targetUserId!);
      if (error) throw error;
      return (data || []).map((r) => r.section_key as SectionKey);
    },
    enabled: !!targetUserId && !isFullAdmin,
  });

  const hasAccess = (sectionKey: SectionKey): boolean => {
    if (isFullAdmin) return true;
    if (!permissions) return false;
    return permissions.includes(sectionKey);
  };

  return { permissions: isFullAdmin ? [...ALL_SECTION_KEYS] : (permissions || []), hasAccess, isLoading, isFullAdmin };
}
