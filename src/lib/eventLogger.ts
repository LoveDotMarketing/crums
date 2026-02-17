import { supabase } from "@/integrations/supabase/client";

type EventCategory = "customer_flow" | "admin_action" | "error" | "system";

interface LogEventParams {
  category: EventCategory;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
}

/**
 * Log an event to app_event_logs table.
 * Fire-and-forget — never blocks the UI or throws.
 */
export async function logEvent({
  category,
  type,
  description,
  metadata = {},
  userId,
  userEmail,
}: LogEventParams): Promise<void> {
  try {
    // Try to get current user if not provided
    if (!userId || !userEmail) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = userId || user.id;
        userEmail = userEmail || user.email || undefined;
      }
    }

    await supabase.from("app_event_logs").insert([{
      user_id: userId || null,
      user_email: userEmail || null,
      event_category: category,
      event_type: type,
      description: description || null,
      metadata: metadata as any,
      page_url: window.location.pathname,
    }]);
  } catch (err) {
    // Silent fail — logging should never break the app
    console.error("[EventLogger] Failed to log event:", err);
  }
}

// ─── Customer Flow Helpers ───

export const logCustomerEvent = (
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) => logEvent({ category: "customer_flow", type, description, metadata });

export const logSignupStarted = (email: string) =>
  logEvent({
    category: "customer_flow",
    type: "signup_started",
    description: `Customer started signup: ${email}`,
    userEmail: email,
  });

export const logSignupCompleted = (email: string) =>
  logEvent({
    category: "customer_flow",
    type: "signup_completed",
    description: `Customer completed signup: ${email}`,
    userEmail: email,
  });

export const logSignupFailed = (email: string, error: string) =>
  logEvent({
    category: "customer_flow",
    type: "signup_failed",
    description: `Signup failed for ${email}: ${error}`,
    userEmail: email,
    metadata: { error },
  });

export const logProfileSaved = (fields?: string[]) =>
  logEvent({
    category: "customer_flow",
    type: "profile_saved",
    description: "Customer saved profile",
    metadata: { fields_updated: fields },
  });

export const logProfileSaveFailed = (error: string) =>
  logEvent({
    category: "customer_flow",
    type: "profile_save_failed",
    description: `Profile save failed: ${error}`,
    metadata: { error },
  });

export const logApplicationSubmitted = () =>
  logEvent({
    category: "customer_flow",
    type: "application_submitted",
    description: "Customer submitted application",
  });

export const logApplicationSaveFailed = (error: string) =>
  logEvent({
    category: "customer_flow",
    type: "application_save_failed",
    description: `Application save failed: ${error}`,
    metadata: { error },
  });

export const logDocumentUploadFailed = (docType: string, error: string) =>
  logEvent({
    category: "customer_flow",
    type: "document_upload_failed",
    description: `Document upload failed: ${docType}`,
    metadata: { document_type: docType, error },
  });

export const logSessionError = (context: string, error: string) =>
  logEvent({
    category: "customer_flow",
    type: "session_error",
    description: `Session error during ${context}`,
    metadata: { context, error },
  });

export const logPaymentSetupStarted = () =>
  logEvent({
    category: "customer_flow",
    type: "payment_setup_started",
    description: "Customer started ACH payment setup",
  });

export const logPaymentSetupFailed = (error: string) =>
  logEvent({
    category: "customer_flow",
    type: "payment_setup_failed",
    description: `Payment setup failed: ${error}`,
    metadata: { error },
  });

// ─── Admin Action Helpers ───

export const logAdminAction = (
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) => logEvent({ category: "admin_action", type, description, metadata });

export const logTollAssigned = (
  customerName: string,
  amount: number,
  tollAuthority?: string
) =>
  logEvent({
    category: "admin_action",
    type: "toll_assigned",
    description: `Assigned toll to ${customerName}: $${amount}`,
    metadata: { customer_name: customerName, amount, toll_authority: tollAuthority },
  });

export const logTollCharged = (customerName: string, amount: number) =>
  logEvent({
    category: "admin_action",
    type: "toll_charged",
    description: `Charged toll to ${customerName}: $${amount}`,
    metadata: { customer_name: customerName, amount },
  });

export const logCustomerCreated = (customerName: string, email?: string) =>
  logEvent({
    category: "admin_action",
    type: "customer_created",
    description: `Created customer: ${customerName}`,
    metadata: { customer_name: customerName, customer_email: email },
  });

export const logSubscriptionCreated = (
  customerName: string,
  trailerCount: number,
  subscriptionType: string
) =>
  logEvent({
    category: "admin_action",
    type: "subscription_created",
    description: `Created ${subscriptionType} subscription for ${customerName} (${trailerCount} trailer${trailerCount !== 1 ? "s" : ""})`,
    metadata: { customer_name: customerName, trailer_count: trailerCount, subscription_type: subscriptionType },
  });

export const logTrailerAssigned = (trailerNumber: string, customerName: string) =>
  logEvent({
    category: "admin_action",
    type: "trailer_assigned",
    description: `Assigned trailer #${trailerNumber} to ${customerName}`,
    metadata: { trailer_number: trailerNumber, customer_name: customerName },
  });

export const logApplicationReviewed = (
  customerEmail: string,
  status: string,
  notes?: string
) =>
  logEvent({
    category: "admin_action",
    type: "application_reviewed",
    description: `Reviewed application for ${customerEmail}: ${status}`,
    metadata: { customer_email: customerEmail, status, notes },
  });

export const logStaffInvited = (email: string, role: string) =>
  logEvent({
    category: "admin_action",
    type: "staff_invited",
    description: `Invited ${email} as ${role}`,
    metadata: { invited_email: email, role },
  });

export const logBillingRetried = (customerName: string, amount: number) =>
  logEvent({
    category: "admin_action",
    type: "billing_retried",
    description: `Retried payment for ${customerName}: $${amount}`,
    metadata: { customer_name: customerName, amount },
  });
