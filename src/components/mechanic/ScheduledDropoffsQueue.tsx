import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, Clock, User, Phone, Truck, Calendar, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { toast } from "sonner";

interface DropoffRequest {
  id: string;
  trailer_id: string;
  customer_name: string | null;
  customer_company: string | null;
  customer_phone: string | null;
  scheduled_dropoff_date: string;
  notes: string | null;
  status: string;
  trailer: {
    trailer_number: string;
    type: string;
    vin: string | null;
  };
}

export function ScheduledDropoffsQueue() {
  const { effectiveUserId } = useAuth();
  const currentUserId = effectiveUserId;

  const [dropoffs, setDropoffs] = useState<DropoffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledDropoffs();

    const channel = supabase
      .channel("scheduled-dropoffs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trailer_dropoff_requests",
        },
        () => {
          fetchScheduledDropoffs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchScheduledDropoffs = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("trailer_dropoff_requests")
        .select(`
          id,
          trailer_id,
          customer_name,
          customer_company,
          customer_phone,
          scheduled_dropoff_date,
          notes,
          status,
          trailer:trailers!inner(
            trailer_number,
            type,
            vin
          )
        `)
        .in("status", ["scheduled"])
        .order("scheduled_dropoff_date", { ascending: true });

      if (error) throw error;
      setDropoffs(data || []);
    } catch (error) {
      console.error("Error fetching scheduled dropoffs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async (dropoff: DropoffRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("trailer_dropoff_requests")
        .update({
          status: "received",
          received_by: currentUserId,
          received_at: new Date().toISOString(),
        })
        .eq("id", dropoff.id);

      if (error) throw error;
      toast.success(`Trailer ${dropoff.trailer.trailer_number} marked as received`);
    } catch (error) {
      console.error("Error marking dropoff as received:", error);
      toast.error("Failed to mark trailer as received");
    }
  };

  const getUrgencyBadge = (date: string) => {
    const dropoffDate = new Date(date);

    if (isPast(dropoffDate) && !isToday(dropoffDate)) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          OVERDUE
        </Badge>
      );
    }

    if (isToday(dropoffDate)) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          TODAY
        </Badge>
      );
    }

    if (isTomorrow(dropoffDate)) {
      return (
        <Badge variant="default" className="bg-amber-500">
          <Clock className="h-3 w-3 mr-1" />
          TOMORROW
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Calendar className="h-3 w-3 mr-1" />
        {formatDistanceToNow(dropoffDate, { addSuffix: true })}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="mb-6 border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-blue-600" />
            Scheduled Drop-offs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (dropoffs.length === 0) {
    return (
      <Card className="mb-6 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-blue-600" />
            <CardTitle>Scheduled Drop-offs</CardTitle>
          </div>
          <CardDescription>
            No upcoming drop-offs scheduled
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-blue-600" />
            <CardTitle>Scheduled Drop-offs</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            {dropoffs.length} expected return{dropoffs.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription>
          Trailers scheduled for customer return
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dropoffs.map((dropoff) => (
            <Card key={dropoff.id} className="bg-card transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">
                      {dropoff.trailer.trailer_number}
                    </CardTitle>
                  </div>
                  {getUrgencyBadge(dropoff.scheduled_dropoff_date)}
                </div>
                <p className="text-xs text-muted-foreground">{dropoff.trailer.type}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{dropoff.customer_name || "Unknown"}</span>
                  </div>
                  {dropoff.customer_company && (
                    <p className="text-xs text-muted-foreground ml-5">
                      {dropoff.customer_company}
                    </p>
                  )}
                  {dropoff.customer_phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-5">
                      <Phone className="h-3 w-3" />
                      {dropoff.customer_phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {format(new Date(dropoff.scheduled_dropoff_date), "EEE, MMM d 'at' h:mm a")}
                  </span>
                </div>

                {dropoff.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {dropoff.notes}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleMarkReceived(dropoff)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Received
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
