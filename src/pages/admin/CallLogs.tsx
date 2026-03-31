import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, RefreshCw, Download, Volume2, FileText, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WaveformPlayer } from "@/components/admin/WaveformPlayer";

interface CallLog {
  sid: string;
  from: string;
  fromFormatted: string;
  to: string;
  toFormatted: string;
  direction: "inbound" | "outbound";
  status: string;
  duration: number;
  startTime: string;
  endTime: string;
  price: number | null;
  priceUnit: string;
  recordingSid: string | null;
  recordingDuration: number | null;
  source: string;
  campaign: string | null;
}

interface CallStats {
  total: number;
  todayTotal: number;
  inbound: number;
  outbound: number;
  completed: number;
  missed: number;
  totalDuration: number;
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const formatTotalDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "busy":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Busy</Badge>;
    case "no-answer":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">No Answer</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
    case "canceled":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Canceled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDirectionBadge = (direction: string) => {
  if (direction === "inbound") {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <PhoneIncoming className="h-3 w-3 mr-1" />
        Inbound
      </Badge>
    );
  }
  return (
    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
      <PhoneOutgoing className="h-3 w-3 mr-1" />
      Outbound
    </Badge>
  );
};

const getSourceBadge = (source: string, campaign: string | null) => {
  const badgeContent = () => {
    switch (source) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "Organic":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Organic</Badge>;
      case "Direct":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Direct</Badge>;
      case "Phone Lead":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Phone Lead</Badge>;
      case "Referral":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Referral</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  return (
    <div className="flex flex-col gap-0.5">
      {badgeContent()}
      {campaign && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{campaign}</span>}
    </div>
  );
};

export default function CallLogs() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("7");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [loadingTranscripts, setLoadingTranscripts] = useState<Record<string, boolean>>({});
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});

  const handleTranscribe = async (recordingSid: string) => {
    if (transcripts[recordingSid]) {
      setExpandedTranscripts(prev => ({ ...prev, [recordingSid]: !prev[recordingSid] }));
      return;
    }

    setLoadingTranscripts(prev => ({ ...prev, [recordingSid]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-recording?recordingSid=${recordingSid}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to transcribe");
      }

      const { transcript } = await response.json();
      setTranscripts(prev => ({ ...prev, [recordingSid]: transcript }));
      setExpandedTranscripts(prev => ({ ...prev, [recordingSid]: true }));
    } catch (e: any) {
      toast({ title: "Transcription failed", description: e.message, variant: "destructive" });
    } finally {
      setLoadingTranscripts(prev => ({ ...prev, [recordingSid]: false }));
    }
  };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["call-logs", dateRange, directionFilter],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange))).toISOString();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twilio-call-logs?startDate=${startDate}&endDate=${endDate}&direction=${directionFilter}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch call logs");
      }

      return response.json() as Promise<{ calls: CallLog[]; stats: CallStats }>;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const filteredCalls = data?.calls?.filter(call => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return call.status === "completed";
    if (statusFilter === "missed") return ["busy", "no-answer", "failed", "canceled"].includes(call.status);
    return true;
  }) || [];

  const callsWithRecordings = filteredCalls.filter(c => c.recordingSid).length;

  const handleExportCSV = () => {
    if (!filteredCalls.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = ["Date/Time", "From", "To", "Direction", "Duration", "Status", "Has Recording"];
    const rows = filteredCalls.map(call => [
      call.startTime ? format(new Date(call.startTime), "MMM d, yyyy h:mm a") : "N/A",
      call.fromFormatted || call.from,
      call.toFormatted || call.to,
      call.direction,
      formatDuration(call.duration),
      call.status,
      call.recordingSid ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully" });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Call Logs</h1>
                <p className="text-muted-foreground">View and analyze incoming and outgoing phone calls</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats?.todayTotal ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inbound</CardTitle>
                  <PhoneIncoming className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats?.inbound ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outbound</CardTitle>
                  <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats?.outbound ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Missed</CardTitle>
                  <PhoneMissed className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats?.missed ?? 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Duration and Recordings Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Call Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTotalDuration(data?.stats?.totalDuration ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {data?.stats?.completed ?? 0} completed calls
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calls with Recordings</CardTitle>
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{callsWithRecordings}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredCalls.length > 0 
                      ? `${Math.round((callsWithRecordings / filteredCalls.length) * 100)}% of calls recorded`
                      : "No calls in selected range"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Date Range:</span>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Direction:</span>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Call Log Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recording</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading call logs...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCalls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No call logs found for the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCalls.map((call) => (
                        <>
                          <TableRow key={call.sid}>
                            <TableCell className="font-medium">
                              {call.startTime 
                                ? format(new Date(call.startTime), "MMM d, h:mm a")
                                : "N/A"}
                            </TableCell>
                            <TableCell>{call.fromFormatted || call.from}</TableCell>
                            <TableCell>{call.toFormatted || call.to}</TableCell>
                            <TableCell>{getDirectionBadge(call.direction)}</TableCell>
                            <TableCell>{formatDuration(call.duration)}</TableCell>
                            <TableCell>{getStatusBadge(call.status)}</TableCell>
                            <TableCell className="min-w-[320px]">
                              <div className="flex flex-col gap-2">
                                {call.recordingSid ? (
                                  <>
                                    <WaveformPlayer 
                                      recordingSid={call.recordingSid} 
                                      recordingDuration={call.recordingDuration}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-fit text-xs gap-1.5"
                                      onClick={() => handleTranscribe(call.recordingSid!)}
                                      disabled={loadingTranscripts[call.recordingSid]}
                                    >
                                      {loadingTranscripts[call.recordingSid] ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileText className="h-3 w-3" />
                                      )}
                                      {transcripts[call.recordingSid] 
                                        ? (expandedTranscripts[call.recordingSid] ? 'Hide Transcript' : 'Show Transcript')
                                        : 'Transcribe'}
                                      {transcripts[call.recordingSid] && (
                                        expandedTranscripts[call.recordingSid] 
                                          ? <ChevronUp className="h-3 w-3" />
                                          : <ChevronDown className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {call.recordingSid && expandedTranscripts[call.recordingSid] && transcripts[call.recordingSid] && (
                            <TableRow key={`${call.sid}-transcript`}>
                              <TableCell colSpan={7} className="bg-muted/50 py-3 px-6">
                                <div className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                                  <p className="font-medium text-xs text-muted-foreground mb-2">Transcript</p>
                                  {transcripts[call.recordingSid]}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
