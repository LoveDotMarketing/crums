import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  BookOpen, 
  Wrench,
  MapPin,
  ExternalLink,
  Newspaper,
  Layers,
  Calendar
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

import { newsArticles, type NewsArticle } from "@/lib/news";
import { guides, type Guide } from "@/lib/guides";
import { tools, type Tool } from "@/lib/tools";
import { locations, type LocationData } from "@/lib/locations";

// Unified content item for display
interface ContentItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  category: "news" | "guide" | "tool" | "location";
  lastModified: string;
  monthYear: string;
  available: boolean;
  priority: number;
}

// Category styling
const categoryConfig = {
  news: {
    label: "News",
    icon: Newspaper,
    color: "hsl(var(--chart-1))",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  guide: {
    label: "Guide",
    icon: BookOpen,
    color: "hsl(var(--chart-2))",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  tool: {
    label: "Tool",
    icon: Wrench,
    color: "hsl(var(--chart-3))",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  location: {
    label: "Location",
    icon: MapPin,
    color: "hsl(var(--chart-4))",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
};

// Transform all content registries into unified items
function getAllContent(): ContentItem[] {
  const items: ContentItem[] = [];

  // News articles
  newsArticles.forEach((article: NewsArticle) => {
    items.push({
      id: `news-${article.slug}`,
      title: article.title,
      slug: article.slug,
      url: `/news/${article.slug}`,
      category: "news",
      lastModified: article.lastModified,
      monthYear: article.lastModified.substring(0, 7),
      available: true,
      priority: article.priority,
    });
  });

  // Guides
  guides.forEach((guide: Guide) => {
    items.push({
      id: `guide-${guide.slug}`,
      title: guide.title,
      slug: guide.slug,
      url: `/resources/guides/${guide.slug}`,
      category: "guide",
      lastModified: guide.lastModified,
      monthYear: guide.lastModified.substring(0, 7),
      available: guide.available,
      priority: guide.priority,
    });
  });

  // Tools
  tools.forEach((tool: Tool) => {
    items.push({
      id: `tool-${tool.slug}`,
      title: tool.title,
      slug: tool.slug,
      url: `/resources/tools/${tool.slug}`,
      category: "tool",
      lastModified: tool.lastModified,
      monthYear: tool.lastModified.substring(0, 7),
      available: tool.available,
      priority: tool.priority,
    });
  });

  // Locations (using a default date since they don't have lastModified)
  locations.forEach((location: LocationData) => {
    items.push({
      id: `location-${location.slug}`,
      title: `${location.city}, ${location.stateAbbr}`,
      slug: location.slug,
      url: `/locations/${location.slug}`,
      category: "location",
      lastModified: "2025-12-01", // Default date for locations
      monthYear: "2025-12",
      available: true,
      priority: 0.7,
    });
  });

  return items;
}

export function ContentTab() {
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get all content items
  const allContent = useMemo(() => getAllContent(), []);

  // Get available months for filter
  const availableMonths = useMemo(() => {
    const months = new Set(allContent.map(item => item.monthYear));
    return Array.from(months).sort().reverse();
  }, [allContent]);

  // Filter content
  const filteredContent = useMemo(() => {
    return allContent
      .filter(item => monthFilter === "all" || item.monthYear === monthFilter)
      .filter(item => categoryFilter === "all" || item.category === categoryFilter)
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [allContent, monthFilter, categoryFilter]);

  // Generate chart data by month
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; displayLabel: string; news: number; guide: number; tool: number; location: number }>();
    
    allContent.forEach((item) => {
      if (!monthMap.has(item.monthYear)) {
        monthMap.set(item.monthYear, {
          month: item.monthYear,
          displayLabel: format(parseISO(`${item.monthYear}-01`), "MMM yy"),
          news: 0,
          guide: 0,
          tool: 0,
          location: 0,
        });
      }
      const data = monthMap.get(item.monthYear)!;
      data[item.category]++;
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [allContent]);

  // Summary stats
  const stats = useMemo(() => {
    const published = allContent.filter(item => item.available);
    return {
      total: allContent.length,
      published: published.length,
      news: allContent.filter(item => item.category === "news").length,
      guides: allContent.filter(item => item.category === "guide" && item.available).length,
      tools: allContent.filter(item => item.category === "tool" && item.available).length,
      locations: allContent.filter(item => item.category === "location").length,
    };
  }, [allContent]);

  const formatMonthLabel = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), "MMMM yyyy");
    } catch {
      return month;
    }
  };

  const handleExportCSV = () => {
    const headers = ["Title", "Category", "URL", "Last Modified", "Status"];
    const rows = filteredContent.map(item => [
      item.title,
      categoryConfig[item.category].label,
      `https://crumsleasing.com${item.url}`,
      item.lastModified,
      item.available ? "Published" : "Draft",
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `content-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Content by Month Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Published Content by Month
              </CardTitle>
              <CardDescription>
                All published pages across news, guides, tools, and locations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No content data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayLabel" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.filter(entry => Number(entry.value) > 0).map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                              {categoryConfig[entry.dataKey as keyof typeof categoryConfig]?.label || entry.dataKey}:
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                        {total > 0 && (
                          <div className="border-t mt-2 pt-2 text-sm font-medium">
                            Total: {total}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend 
                  formatter={(value) => categoryConfig[value as keyof typeof categoryConfig]?.label || value}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Bar dataKey="news" stackId="1" fill={categoryConfig.news.color} />
                <Bar dataKey="guide" stackId="1" fill={categoryConfig.guide.color} />
                <Bar dataKey="tool" stackId="1" fill={categoryConfig.tool.color} />
                <Bar dataKey="location" stackId="1" fill={categoryConfig.location.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All content items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.news}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Guides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.guides}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.tools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Calculators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.locations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              City pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Published Content</CardTitle>
            <CardDescription>
              All pages with links to view each
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="location">Locations</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No content found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.slice(0, 50).map((item) => {
                  const config = categoryConfig[item.category];
                  const IconComponent = config.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.badgeClass}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(item.lastModified), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {item.available ? (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {filteredContent.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {filteredContent.length} items. Export CSV to see all.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}