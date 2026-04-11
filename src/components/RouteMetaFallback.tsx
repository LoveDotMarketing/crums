import { matchPath, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";

interface RouteMetaEntry {
  pattern: string;
  title: string;
  description: string;
  noindex?: boolean;
}

const routeMetaEntries: RouteMetaEntry[] = [
  {
    pattern: "/dashboard/admin/applications",
    title: "Admin Applications | CRUMS Leasing",
    description:
      "Review new leasing applications, uploaded documents, payment setup progress, and approval actions inside the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/fleet",
    title: "Admin Fleet | CRUMS Leasing",
    description:
      "Manage trailer inventory, availability, assignments, and service readiness inside the CRUMS Leasing fleet operations dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/fleet/:trailerId",
    title: "Admin Trailer Detail | CRUMS Leasing",
    description:
      "Review trailer status, maintenance history, customer assignment, and release activity inside the CRUMS Leasing internal fleet dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/archived-trailers",
    title: "Archived Trailers | CRUMS Leasing",
    description:
      "Review archived fleet units, historical records, and trailer disposition details inside the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/customers",
    title: "Admin Customers | CRUMS Leasing",
    description:
      "Search customer accounts, review lease relationships, and manage account status from the CRUMS Leasing customer administration dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/customers/:customerId",
    title: "Admin Customer Detail | CRUMS Leasing",
    description:
      "Review customer accounts, billing history, statements, applications, and support notes inside the CRUMS Leasing internal admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/mechanics",
    title: "Admin Mechanics | CRUMS Leasing",
    description:
      "Manage mechanic activity, inspection workflows, and service coordination across the CRUMS Leasing maintenance dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/tolls",
    title: "Admin Tolls | CRUMS Leasing",
    description:
      "Track toll notices, payment status, reminders, and customer balances inside the CRUMS Leasing toll management dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/billing",
    title: "Admin Billing | CRUMS Leasing",
    description:
      "Monitor subscriptions, billing cycles, ACH setup, and payment collection activity inside the CRUMS Leasing billing dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/payments",
    title: "Admin Payments | CRUMS Leasing",
    description:
      "Review customer payments, transaction history, retries, and payment issues from the CRUMS Leasing payment operations dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/support",
    title: "Admin Support | CRUMS Leasing",
    description:
      "Manage customer support conversations, follow-up needs, and service issues inside the CRUMS Leasing internal support dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/reports",
    title: "Admin Reports | CRUMS Leasing",
    description:
      "Access operational reports, business summaries, and internal performance snapshots from the CRUMS Leasing reporting dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/analytics",
    title: "Admin Analytics | CRUMS Leasing",
    description:
      "Review traffic trends, conversion data, and marketing performance metrics inside the CRUMS Leasing analytics dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/outreach",
    title: "Admin Outreach | CRUMS Leasing",
    description:
      "Manage outbound campaigns, email performance, and customer outreach workflows from the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/staff",
    title: "Admin Staff | CRUMS Leasing",
    description:
      "Manage staff access, permissions, and team records inside the CRUMS Leasing internal staff administration dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/staff/:id",
    title: "Admin Staff Detail | CRUMS Leasing",
    description:
      "Review staff performance, permissions, and account details inside the CRUMS Leasing employee management dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/employee",
    title: "Employee Dashboard | CRUMS Leasing",
    description:
      "Access internal employee tools, assigned tasks, and operational insights from the CRUMS Leasing staff dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/sitemap-generator",
    title: "Sitemap Generator | CRUMS Leasing",
    description:
      "Generate and review sitemap outputs, indexing assets, and crawl coverage tools inside the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/logs",
    title: "Admin Logs | CRUMS Leasing",
    description:
      "Inspect application logs, operational events, and internal troubleshooting history from the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/lead-sources",
    title: "Lead Sources | CRUMS Leasing",
    description:
      "Analyze campaign sources, attribution patterns, and inbound lead quality inside the CRUMS Leasing marketing dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/dot-inspections",
    title: "DOT Inspections | CRUMS Leasing",
    description:
      "Review DOT inspection records, checklists, and release readiness across the CRUMS Leasing maintenance dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/call-logs",
    title: "Call Logs | CRUMS Leasing",
    description:
      "Review inbound and outbound call activity, recordings, and follow-up history inside the CRUMS Leasing admin dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/phone-leads",
    title: "Phone Leads | CRUMS Leasing",
    description:
      "Track phone lead intake, call outcomes, and follow-up opportunities from the CRUMS Leasing internal sales dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/admin/work-orders",
    title: "Work Orders | CRUMS Leasing",
    description:
      "Manage repair requests, shop workload, and maintenance priorities inside the CRUMS Leasing work order dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/application",
    title: "Customer Application | CRUMS Leasing",
    description:
      "Complete your trailer leasing application, upload required documents, and track submission progress inside your CRUMS Leasing account.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/payment-setup",
    title: "Payment Setup | CRUMS Leasing",
    description:
      "Set up billing details, confirm payment information, and finish account activation inside your CRUMS Leasing customer portal.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/profile",
    title: "Customer Profile | CRUMS Leasing",
    description:
      "Update your contact details, company information, and account preferences inside your CRUMS Leasing customer profile.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/rentals",
    title: "Customer Rentals | CRUMS Leasing",
    description:
      "Review active rentals, trailer assignments, and related account details inside your CRUMS Leasing customer dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/request",
    title: "Rental Request | CRUMS Leasing",
    description:
      "Request another trailer, share timing needs, and submit rental details through your CRUMS Leasing customer account.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/billing",
    title: "Customer Billing | CRUMS Leasing",
    description:
      "Review payment methods, invoices, account status, and billing activity inside your CRUMS Leasing customer portal.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/statements",
    title: "Customer Statements | CRUMS Leasing",
    description:
      "Access statements, billing documents, and account records from your secure CRUMS Leasing customer dashboard.",
    noindex: true,
  },
  {
    pattern: "/dashboard/customer/lease-to-own",
    title: "Lease-to-Own Dashboard | CRUMS Leasing",
    description:
      "Track your lease-to-own account, review progress, and manage related details inside the CRUMS Leasing customer portal.",
    noindex: true,
  },
];

export const RouteMetaFallback = () => {
  const location = useLocation();

  const matchedMeta = routeMetaEntries.find(({ pattern }) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  );

  if (!matchedMeta) {
    return null;
  }

  return (
    <SEO
      title={matchedMeta.title}
      description={matchedMeta.description}
      noindex={matchedMeta.noindex}
    />
  );
};