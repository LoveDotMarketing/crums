import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { FlaskConical, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AuditRow = {
  id: string;
  from_sandbox: boolean;
  to_sandbox: boolean;
  reason: string | null;
  changed_at: string;
  changed_by: string | null;
  customer_subscriptions: {
    id: string;
    customers: {
      full_name: string | null;
      company_name: string | null;
      email: string | null;
    } | null;
  } | null;
};

function ModeBadge({ sandbox }: { sandbox: boolean }) {
  if (sandbox) {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
      >
        Sandbox
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Live
    </Badge>
  );
}

export function SandboxActivityPanel() {
  const { data: audit, isLoading } = useQuery({
    queryKey: ["sandbox-audit-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_sandbox_audit")
        .select(`
          id,
          from_sandbox,
          to_sandbox,
          reason,
          changed_at,
          changed_by,
          customer_subscriptions (
            id,
            customers ( full_name, company_name, email )
          )
        `)
        .order("changed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as AuditRow[];
    },
  });

  const changedByIds = Array.from(
    new Set((audit ?? []).map((r) => r.changed_by).filter(Boolean) as string[]),
  );

  const { data: profilesMap } = useQuery({
    queryKey: ["sandbox-audit-profiles", changedByIds.sort().join(",")],
    enabled: changedByIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", changedByIds);
      if (error) throw error;
      const map = new Map<string, { name: string; email: string | null }>();
      (data ?? []).forEach((p: any) => {
        const name =
          [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
          p.email ||
          "Unknown";
        map.set(p.id, { name, email: p.email });
      });
      return map;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Sandbox Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !audit?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No sandbox toggles yet.
                </TableCell>
              </TableRow>
            ) : (
              audit.map((row) => {
                const customer = row.customer_subscriptions?.customers;
                const customerLabel =
                  customer?.company_name ||
                  customer?.full_name ||
                  customer?.email ||
                  "—";
                const subId = row.customer_subscriptions?.id;
                const adminInfo = row.changed_by
                  ? profilesMap?.get(row.changed_by)
                  : null;
                const adminLabel = adminInfo?.name || "Unknown";
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {subId ? (
                        <Link
                          to={`/dashboard/admin/billing?subscription=${subId}`}
                          className="text-primary hover:underline"
                        >
                          {customerLabel}
                        </Link>
                      ) : (
                        <span>{customerLabel}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{adminLabel}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ModeBadge sandbox={row.from_sandbox} />
                        <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <ModeBadge sandbox={row.to_sandbox} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[280px]">
                      {row.reason ? (
                        <span className="line-clamp-2">{row.reason}</span>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {formatDistanceToNow(new Date(row.changed_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(row.changed_at), "PPpp")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
