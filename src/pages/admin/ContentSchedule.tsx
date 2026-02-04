import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addWeeks, nextWednesday, isWednesday, parseISO } from "date-fns";
import { Calendar, FileText, Calculator, Newspaper, Clock, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";

interface ScheduledContent {
  id: string;
  content_type: "guide" | "tool" | "news";
  slug: string;
  title: string;
  scheduled_date: string;
  status: "scheduled" | "published" | "cancelled";
  published_at: string | null;
  created_at: string;
}

// Get unpublished content from registries
const getUnpublishedGuides = () => guides.filter(g => !g.available);
const getUnpublishedTools = () => tools.filter(t => !t.available);

export default function ContentSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch scheduled content
  const { data: scheduledContent, isLoading } = useQuery({
    queryKey: ["scheduled-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_content")
        .select("*")
        .order("scheduled_date", { ascending: true });
      
      if (error) throw error;
      return data as ScheduledContent[];
    },
  });

  // Auto-schedule unpublished content
  const autoScheduleMutation = useMutation({
    mutationFn: async () => {
      const unpublishedGuides = getUnpublishedGuides();
      const unpublishedTools = getUnpublishedTools();
      
      // Combine all unpublished content
      const allUnpublished = [
        ...unpublishedGuides.map(g => ({ type: "guide" as const, slug: g.slug, title: g.title })),
        ...unpublishedTools.map(t => ({ type: "tool" as const, slug: t.slug, title: t.title })),
      ];
      
      // Get already scheduled slugs
      const existingSlugs = new Set(
        (scheduledContent || []).map(sc => `${sc.content_type}-${sc.slug}`)
      );
      
      // Filter out already scheduled
      const toSchedule = allUnpublished.filter(
        item => !existingSlugs.has(`${item.type}-${item.slug}`)
      );
      
      if (toSchedule.length === 0) {
        toast.info("All unpublished content is already scheduled");
        return;
      }
      
      // Calculate next Wednesdays
      let nextDate = isWednesday(new Date()) 
        ? addWeeks(new Date(), 1) 
        : nextWednesday(new Date());
      
      // Get the latest scheduled date to continue from there
      const existingDates = (scheduledContent || [])
        .filter(sc => sc.status === "scheduled")
        .map(sc => parseISO(sc.scheduled_date));
      
      if (existingDates.length > 0) {
        const latestDate = new Date(Math.max(...existingDates.map(d => d.getTime())));
        nextDate = addWeeks(latestDate, 1);
      }
      
      // Create schedule entries
      const entries = toSchedule.map((item, index) => ({
        content_type: item.type,
        slug: item.slug,
        title: item.title,
        scheduled_date: format(addWeeks(nextDate, index), "yyyy-MM-dd"),
        status: "scheduled",
        created_by: user?.id,
      }));
      
      const { error } = await supabase
        .from("scheduled_content")
        .insert(entries);
      
      if (error) throw error;
      
      toast.success(`Scheduled ${entries.length} items for weekly Wednesday publication`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
    },
    onError: (error) => {
      toast.error(`Failed to schedule: ${error.message}`);
    },
  });

  // Cancel scheduled item
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_content")
        .update({ status: "cancelled" })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      toast.success("Schedule cancelled");
    },
    onError: (error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });

  // Delete scheduled item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_content")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      toast.success("Schedule entry deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const getContentIcon = (type: string) => {
    switch (type) {
      case "guide": return <FileText className="h-4 w-4" />;
      case "tool": return <Calculator className="h-4 w-4" />;
      case "news": return <Newspaper className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Scheduled</Badge>;
      case "published":
        return <Badge className="gap-1 bg-primary"><CheckCircle className="h-3 w-3" /> Published</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Stats
  const scheduledCount = scheduledContent?.filter(sc => sc.status === "scheduled").length || 0;
  const publishedCount = scheduledContent?.filter(sc => sc.status === "published").length || 0;
  const unpublishedGuideCount = getUnpublishedGuides().length;
  const unpublishedToolCount = getUnpublishedTools().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Schedule</h1>
          <p className="text-muted-foreground">Manage scheduled blog posts, guides, and tools</p>
        </div>
        <Button 
          onClick={() => autoScheduleMutation.mutate()}
          disabled={autoScheduleMutation.isPending}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Auto-Schedule Unpublished
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-2xl">{scheduledCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pending publication</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl">{publishedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Successfully released</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unpublished Guides</CardDescription>
            <CardTitle className="text-2xl">{unpublishedGuideCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Ready to schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unpublished Tools</CardDescription>
            <CardTitle className="text-2xl">{unpublishedToolCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Ready to schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publication Schedule
          </CardTitle>
          <CardDescription>
            Content scheduled for Wednesday releases. Items publish at 9:00 AM CST.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading schedule...</p>
          ) : !scheduledContent?.length ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No content scheduled yet</p>
              <Button onClick={() => autoScheduleMutation.mutate()}>
                Schedule Unpublished Content
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getContentIcon(item.content_type)}
                        <span className="capitalize">{item.content_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {format(parseISO(item.scheduled_date), "EEEE, MMMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      {item.status === "scheduled" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMutation.mutate(item.id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Schedule Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{item.title}" from the schedule. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unpublished Content Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Unpublished Guides ({unpublishedGuideCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unpublishedGuideCount === 0 ? (
              <p className="text-muted-foreground">All guides are published</p>
            ) : (
              <ul className="space-y-2">
                {getUnpublishedGuides().map(guide => (
                  <li key={guide.slug} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    {guide.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Unpublished Tools ({unpublishedToolCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unpublishedToolCount === 0 ? (
              <p className="text-muted-foreground">All tools are published</p>
            ) : (
              <ul className="space-y-2">
                {getUnpublishedTools().map(tool => (
                  <li key={tool.slug} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    {tool.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
