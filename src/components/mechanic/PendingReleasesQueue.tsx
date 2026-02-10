import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Clock, User, Phone, Truck, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

interface ReleaseRequest {
  id: string;
  trailer_id: string;
  customer_name: string | null;
  customer_company: string | null;
  customer_phone: string | null;
  scheduled_pickup_date: string;
  notes: string | null;
  status: string;
  assigned_mechanic_id: string | null;
  trailer: {
    trailer_number: string;
    type: string;
    vin: string | null;
  };
}

interface PendingReleasesQueueProps {
  onStartInspection?: (trailerId: string) => void;
}

export function PendingReleasesQueue({ onStartInspection }: PendingReleasesQueueProps) {
  const navigate = useNavigate();
  const { user, effectiveUserId } = useAuth();
  const currentUserId = effectiveUserId;
  
  const [releases, setReleases] = useState<ReleaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReleases();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("pending-releases")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trailer_release_requests",
        },
        () => {
          fetchPendingReleases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchPendingReleases = async () => {
    try {
      const { data, error } = await supabase
        .from("trailer_release_requests")
        .select(`
          id,
          trailer_id,
          customer_name,
          customer_company,
          customer_phone,
          scheduled_pickup_date,
          notes,
          status,
          assigned_mechanic_id,
          trailer:trailers!inner(
            trailer_number,
            type,
            vin
          )
        `)
        .in("status", ["pending", "inspection_in_progress"])
        .order("scheduled_pickup_date", { ascending: true });

      if (error) throw error;
      
      // Transform the data to flatten the trailer object
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        trailer: item.trailer,
      }));
      
      setReleases(transformedData);
    } catch (error) {
      console.error("Error fetching pending releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async (release: ReleaseRequest) => {
    try {
      // Update release request status
      await supabase
        .from("trailer_release_requests")
        .update({
          status: "inspection_in_progress",
          assigned_mechanic_id: currentUserId,
        })
        .eq("id", release.id);

      // Navigate to inspection form with release request context
      navigate(`/dashboard/mechanic/inspection?trailerId=${release.trailer_id}&releaseId=${release.id}`);
    } catch (error) {
      console.error("Error starting inspection:", error);
    }
  };

  const getUrgencyBadge = (date: string) => {
    const pickupDate = new Date(date);
    
    if (isPast(pickupDate) && !isToday(pickupDate)) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          OVERDUE
        </Badge>
      );
    }
    
    if (isToday(pickupDate)) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          TODAY
        </Badge>
      );
    }
    
    if (isTomorrow(pickupDate)) {
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
        {formatDistanceToNow(pickupDate, { addSuffix: true })}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="mb-6 border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Releases
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        </CardContent>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle>Pending Customer Pickups</CardTitle>
          </div>
          <CardDescription>
            No upcoming pickups scheduled
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle>Pending Customer Pickups</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            {releases.length} awaiting DOT inspection
          </Badge>
        </div>
        <CardDescription>
          These trailers are scheduled for customer pickup and need DOT inspection before release
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <Card 
              key={release.id} 
              className={`bg-card transition-all hover:shadow-md ${
                release.status === "inspection_in_progress" 
                  ? "border-primary ring-1 ring-primary/20" 
                  : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">
                      {release.trailer.trailer_number}
                    </CardTitle>
                  </div>
                  {getUrgencyBadge(release.scheduled_pickup_date)}
                </div>
                <p className="text-xs text-muted-foreground">{release.trailer.type}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Customer Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{release.customer_name || "Unknown"}</span>
                  </div>
                  {release.customer_company && (
                    <p className="text-xs text-muted-foreground ml-5">
                      {release.customer_company}
                    </p>
                  )}
                  {release.customer_phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-5">
                      <Phone className="h-3 w-3" />
                      {release.customer_phone}
                    </div>
                  )}
                </div>

                {/* Pickup Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {format(new Date(release.scheduled_pickup_date), "EEE, MMM d 'at' h:mm a")}
                  </span>
                </div>

                {/* Notes */}
                {release.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {release.notes}
                  </div>
                )}

                {/* Status Badge */}
                {release.status === "inspection_in_progress" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/dashboard/mechanic/inspection?trailerId=${release.trailer_id}&releaseId=${release.id}`)}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Continue Inspection
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartInspection(release)}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Start DOT Inspection
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
