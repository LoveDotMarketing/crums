import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addWeeks, nextWednesday, isWednesday, parseISO } from "date-fns";
import { Calendar, FileText, Calculator, Newspaper, Clock, CheckCircle, XCircle, Plus, Trash2, RefreshCw, Eye, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";
import { newsArticles } from "@/lib/news";

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
const getUnpublishedNews = () => newsArticles.filter(n => !("available" in n) || !(n as { available?: boolean }).available);

type ContentType = "guide" | "tool" | "news";

interface ContentItem {
  type: ContentType;
  slug: string;
  title: string;
}

export default function ContentSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Fetch scheduled content
  const { data: scheduledContent, isLoading, refetch } = useQuery({
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

  // Auto-publish past-due scheduled items
  const hasAutoPublished = useRef(false);
  useEffect(() => {
    if (!scheduledContent || hasAutoPublished.current) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const pastDue = scheduledContent.filter(
      (item) => item.status === "scheduled" && item.scheduled_date < today
    );
    if (pastDue.length === 0) return;
    hasAutoPublished.current = true;

    const updateAll = async () => {
      for (const item of pastDue) {
        await supabase
          .from("scheduled_content")
          .update({
            status: "published",
            published_at: `${item.scheduled_date}T15:00:00Z`,
          })
          .eq("id", item.id);
      }
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
    };
    updateAll();
  }, [scheduledContent, queryClient]);

  const autoScheduleMutation = useMutation({
    mutationFn: async () => {
      const unpublishedGuides = getUnpublishedGuides();
      const unpublishedTools = getUnpublishedTools();
      const unpublishedNews = getUnpublishedNews();
      
      // Combine all unpublished content
      const allUnpublished = [
        ...unpublishedGuides.map(g => ({ type: "guide" as const, slug: g.slug, title: g.title })),
        ...unpublishedTools.map(t => ({ type: "tool" as const, slug: t.slug, title: t.title })),
        ...unpublishedNews.map(n => ({ type: "news" as const, slug: n.slug, title: n.title })),
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

  // Reschedule cancelled item
  const rescheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find the next available Wednesday
      let nextDate = isWednesday(new Date()) 
        ? addWeeks(new Date(), 1) 
        : nextWednesday(new Date());
      
      const existingDates = (scheduledContent || [])
        .filter(sc => sc.status === "scheduled")
        .map(sc => parseISO(sc.scheduled_date));
      
      if (existingDates.length > 0) {
        const latestDate = new Date(Math.max(...existingDates.map(d => d.getTime())));
        nextDate = addWeeks(latestDate, 1);
      }
      
      const { error } = await supabase
        .from("scheduled_content")
        .update({ 
          status: "scheduled",
          scheduled_date: format(nextDate, "yyyy-MM-dd")
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      toast.success("Item rescheduled");
    },
    onError: (error) => {
      toast.error(`Failed to reschedule: ${error.message}`);
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

  const getPreviewUrl = (type: string, slug: string) => {
    switch (type) {
      case "guide": return `/resources/guides/${slug}`;
      case "tool": return `/resources/tools/${slug}`;
      case "news": return `/news/${slug}`;
      default: return "#";
    }
  };

  // Stats
  const scheduledItems = scheduledContent?.filter(sc => sc.status === "scheduled") || [];
  const publishedItems = scheduledContent?.filter(sc => sc.status === "published") || [];
  const cancelledItems = scheduledContent?.filter(sc => sc.status === "cancelled") || [];
  
  const unpublishedGuideCount = getUnpublishedGuides().length;
  const unpublishedToolCount = getUnpublishedTools().length;
  const unpublishedNewsCount = getUnpublishedNews().length;
  const totalUnpublished = unpublishedGuideCount + unpublishedToolCount + unpublishedNewsCount;

  // Get next scheduled date
  const nextScheduledItem = scheduledItems[0];

  return (
    <>
      <SEO
        title="Content Schedule | Admin"
        description="Manage scheduled content releases for CRUMS Leasing."
        noindex
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border flex items-center px-6 bg-card">
              <SidebarTrigger />
              <div className="flex-1 flex items-center justify-between ml-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Content Schedule</h1>
                  <p className="text-sm text-muted-foreground">Manage blog posts, guides, and tools publication</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => refetch()}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setScheduleDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Manual Schedule
                  </Button>
                  <Button 
                    onClick={() => autoScheduleMutation.mutate()}
                    disabled={autoScheduleMutation.isPending || totalUnpublished === 0}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Auto-Schedule All
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Scheduled</CardDescription>
                    <CardTitle className="text-2xl">{scheduledItems.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {nextScheduledItem 
                        ? `Next: ${format(parseISO(nextScheduledItem.scheduled_date), "MMM d")}`
                        : "No upcoming"
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Published</CardDescription>
                    <CardTitle className="text-2xl">{publishedItems.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Successfully released</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Guides Pending</CardDescription>
                    <CardTitle className="text-2xl">{unpublishedGuideCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Ready to schedule</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Tools Pending</CardDescription>
                    <CardTitle className="text-2xl">{unpublishedToolCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Ready to schedule</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>News Pending</CardDescription>
                    <CardTitle className="text-2xl">{unpublishedNewsCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Ready to schedule</p>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule Table */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Publication Schedule
                  </CardTitle>
                  <CardDescription>
                    Content scheduled for Wednesday releases at 9:00 AM CST.
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
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <a href={getPreviewUrl(item.content_type, item.slug)} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                                
                                {item.status === "scheduled" && (
                                  <>
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
                                  </>
                                )}
                                
                                {item.status === "cancelled" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rescheduleMutation.mutate(item.id)}
                                    disabled={rescheduleMutation.isPending}
                                    className="gap-1"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    Reschedule
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Unpublished Content Preview */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5" />
                      Unpublished Guides ({unpublishedGuideCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {unpublishedGuideCount === 0 ? (
                      <p className="text-muted-foreground text-sm">All guides are published</p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-auto">
                        {getUnpublishedGuides().map(guide => (
                          <li key={guide.slug} className="text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary/60" />
                            {guide.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calculator className="h-5 w-5" />
                      Unpublished Tools ({unpublishedToolCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {unpublishedToolCount === 0 ? (
                      <p className="text-muted-foreground text-sm">All tools are published</p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-auto">
                        {getUnpublishedTools().map(tool => (
                          <li key={tool.slug} className="text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary" />
                            {tool.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Newspaper className="h-5 w-5" />
                      Unpublished News ({unpublishedNewsCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {unpublishedNewsCount === 0 ? (
                      <p className="text-muted-foreground text-sm">All news articles are published</p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-auto">
                        {getUnpublishedNews().map(article => (
                          <li key={article.slug} className="text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            {article.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Manual Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Content Release</DialogTitle>
            <DialogDescription>
              Manually schedule a specific piece of content for publication.
            </DialogDescription>
          </DialogHeader>

          <ManualScheduleForm 
            scheduledContent={scheduledContent || []}
            onSuccess={() => {
              setScheduleDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Separate form component to avoid hook ordering issues
function ManualScheduleForm({ 
  scheduledContent, 
  onSuccess 
}: { 
  scheduledContent: Array<{ content_type: string; slug: string }>;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>("guide");
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    isWednesday(new Date()) ? addWeeks(new Date(), 1) : nextWednesday(new Date())
  );
  const [isPending, setIsPending] = useState(false);

  // Get already scheduled slugs
  const existingSlugs = new Set(
    scheduledContent.map(sc => `${sc.content_type}-${sc.slug}`)
  );

  // Get available content for each type
  const getAvailableContent = (): ContentItem[] => {
    switch (contentType) {
      case "guide":
        return guides
          .filter(g => !g.available && !existingSlugs.has(`guide-${g.slug}`))
          .map(g => ({ type: "guide" as const, slug: g.slug, title: g.title }));
      case "tool":
        return tools
          .filter(t => !t.available && !existingSlugs.has(`tool-${t.slug}`))
          .map(t => ({ type: "tool" as const, slug: t.slug, title: t.title }));
      case "news":
        return newsArticles
          .filter(n => !existingSlugs.has(`news-${n.slug}`))
          .map(n => ({ type: "news" as const, slug: n.slug, title: n.title }));
      default:
        return [];
    }
  };

  const availableContent = getAvailableContent();
  const selectedContent = availableContent.find(c => c.slug === selectedSlug);

  const handleSubmit = async () => {
    if (!selectedContent || !selectedDate) {
      toast.error("Please select content and date");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await supabase
        .from("scheduled_content")
        .insert({
          content_type: selectedContent.type,
          slug: selectedContent.slug,
          title: selectedContent.title,
          scheduled_date: format(selectedDate, "yyyy-MM-dd"),
          status: "scheduled",
          created_by: user?.id,
        });

      if (error) throw error;
      toast.success(`Scheduled "${selectedContent.title}" for ${format(selectedDate, "MMMM d, yyyy")}`);
      onSuccess();
    } catch (error: unknown) {
      toast.error(`Failed to schedule: ${(error as Error).message}`);
    } finally {
      setIsPending(false);
    }
  };

  // Only allow Wednesdays
  const isNotWednesday = (date: Date) => date.getDay() !== 3;

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Content Type</Label>
          <Select
            value={contentType}
            onValueChange={(value: ContentType) => {
              setContentType(value);
              setSelectedSlug("");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="news">News Article</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Content</Label>
          {availableContent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No unpublished {contentType}s available to schedule.
            </p>
          ) : (
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a ${contentType}...`} />
              </SelectTrigger>
              <SelectContent>
                {availableContent.map((item) => (
                  <SelectItem key={item.slug} value={item.slug}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Publication Date (Wednesdays only)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || isNotWednesday(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DialogFooter>
        <Button 
          onClick={handleSubmit}
          disabled={!selectedSlug || !selectedDate || isPending}
        >
          {isPending ? "Scheduling..." : "Schedule"}
        </Button>
      </DialogFooter>
    </>
  );
}
