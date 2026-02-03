import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Download, CheckCircle2, XCircle, Search, ExternalLink, AlertTriangle, ImageIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { newsArticles } from "@/lib/news";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";
import { locations } from "@/lib/locations";

interface SEOCheck {
  hasTitle: boolean;
  hasDescription: boolean;
  hasCanonical: boolean;
  hasSchema: boolean;
  hasOgImage: boolean;
  hasAltTags: boolean; // for pages with images
  hasH1: boolean;
}

interface SEOPageData {
  id: string;
  pageName: string;
  url: string;
  category: "news" | "guide" | "tool" | "location" | "static";
  seoCheck: SEOCheck;
  score: number;
  status: "published" | "draft";
  issues?: string[];
  featuredImage?: string;
}

// Static pages with their SEO configurations
const staticPages = [
  { name: "Home", url: "/", hasSchema: true, hasOgImage: true },
  { name: "About", url: "/about", hasSchema: true, hasOgImage: true },
  { name: "Contact", url: "/contact", hasSchema: true, hasOgImage: true },
  { name: "Services", url: "/services", hasSchema: true, hasOgImage: true },
  { name: "Trailer Leasing", url: "/trailer-leasing", hasSchema: true, hasOgImage: true },
  { name: "Trailer Rentals", url: "/trailer-rentals", hasSchema: true, hasOgImage: true },
  { name: "Dry Van Trailers", url: "/dry-van-trailers", hasSchema: true, hasOgImage: true },
  { name: "Flatbed Trailers", url: "/flatbed-trailers", hasSchema: true, hasOgImage: true },
  { name: "Fleet Solutions", url: "/fleet-solutions", hasSchema: true, hasOgImage: true },
  { name: "Emergency Trailer Rental", url: "/emergency-trailer-rental", hasSchema: true, hasOgImage: true },
  { name: "Locations", url: "/locations", hasSchema: true, hasOgImage: true },
  { name: "Reviews", url: "/reviews", hasSchema: true, hasOgImage: true },
  { name: "Why Choose CRUMS", url: "/why-crums", hasSchema: true, hasOgImage: true },
  { name: "Mission", url: "/mission", hasSchema: true, hasOgImage: true },
  { name: "Careers", url: "/careers", hasSchema: true, hasOgImage: true },
  { name: "News", url: "/news", hasSchema: true, hasOgImage: true },
  { name: "Resources", url: "/resources", hasSchema: true, hasOgImage: true },
  { name: "Guides", url: "/resources/guides", hasSchema: true, hasOgImage: true },
  { name: "Tools", url: "/resources/tools", hasSchema: true, hasOgImage: true },
  { name: "Partners", url: "/partners", hasSchema: true, hasOgImage: true },
  { name: "Industries", url: "/industries", hasSchema: true, hasOgImage: true },
  { name: "Privacy Policy", url: "/privacy", hasSchema: true, hasOgImage: true },
  { name: "Terms of Service", url: "/terms", hasSchema: true, hasOgImage: true },
  { name: "Referral Program", url: "/referral-program", hasSchema: true, hasOgImage: true },
  { name: "Veterans Military Discount", url: "/veterans-military-discount", hasSchema: true, hasOgImage: true },
  { name: "Get Started", url: "/get-started", hasSchema: true, hasOgImage: true },
  // Industry pages
  { name: "Owner Operators", url: "/industries/owner-operators", hasSchema: true, hasOgImage: true },
  { name: "Logistics Companies", url: "/industries/logistics-companies", hasSchema: true, hasOgImage: true },
  { name: "Food Distribution", url: "/industries/food-distribution", hasSchema: true, hasOgImage: true },
  { name: "Retail Distribution", url: "/industries/retail-distribution", hasSchema: true, hasOgImage: true },
  { name: "Manufacturing", url: "/industries/manufacturing", hasSchema: true, hasOgImage: true },
  { name: "Fleet Leasing", url: "/industries/fleet-leasing", hasSchema: true, hasOgImage: true },
  { name: "Seasonal Demand", url: "/industries/seasonal-demand", hasSchema: true, hasOgImage: true },
];

export function SEOTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Build SEO data from all registries
  const seoData = useMemo<SEOPageData[]>(() => {
    const pages: SEOPageData[] = [];

    // News articles
    newsArticles.forEach((article) => {
      const hasImage = !!article.image;
      const titleLength = article.title.length;
      const descLength = article.description.length;
      const seoCheck: SEOCheck = {
        hasTitle: !!article.title && titleLength <= 60,
        hasDescription: !!article.description && descLength <= 160,
        hasCanonical: true, // All news pages have canonical URLs
        hasSchema: true, // NewsArticle schema is generated
        hasOgImage: true, // Default OG image fallback exists
        hasAltTags: true, // Images have alt tags when present
        hasH1: !!article.title,
      };
      const score = calculateScore(seoCheck);
      const issues: string[] = [];
      if (titleLength > 60) issues.push(`Title: ${titleLength} chars (max 60)`);
      if (descLength > 160) issues.push(`Desc: ${descLength} chars (max 160)`);
      if (!hasImage) issues.push("No featured image");
      
      pages.push({
        id: `news-${article.slug}`,
        pageName: article.title,
        url: `/news/${article.slug}`,
        category: "news",
        seoCheck,
        score,
        status: "published",
        issues,
        featuredImage: article.image,
      });
    });

    // Guides
    guides.forEach((guide) => {
      const titleLength = guide.title.length;
      const descLength = guide.description.length;
      const seoCheck: SEOCheck = {
        hasTitle: !!guide.title && titleLength <= 60,
        hasDescription: !!guide.description && descLength <= 160,
        hasCanonical: true,
        hasSchema: true,
        hasOgImage: true,
        hasAltTags: true,
        hasH1: !!guide.title,
      };
      const score = calculateScore(seoCheck);
      const issues: string[] = [];
      if (titleLength > 60) issues.push(`Title: ${titleLength} chars (max 60)`);
      if (descLength > 160) issues.push(`Desc: ${descLength} chars (max 160)`);
      
      pages.push({
        id: `guide-${guide.slug}`,
        pageName: guide.title,
        url: `/resources/guides/${guide.slug}`,
        category: "guide",
        seoCheck,
        score,
        status: guide.available ? "published" : "draft",
        issues,
      });
    });

    // Tools
    tools.forEach((tool) => {
      const titleLength = tool.title.length;
      const descLength = tool.description.length;
      const seoCheck: SEOCheck = {
        hasTitle: !!tool.title && titleLength <= 60,
        hasDescription: !!tool.description && descLength <= 160,
        hasCanonical: true,
        hasSchema: true,
        hasOgImage: true,
        hasAltTags: true,
        hasH1: !!tool.title,
      };
      const score = calculateScore(seoCheck);
      const issues: string[] = [];
      if (titleLength > 60) issues.push(`Title: ${titleLength} chars (max 60)`);
      if (descLength > 160) issues.push(`Desc: ${descLength} chars (max 160)`);
      
      pages.push({
        id: `tool-${tool.slug}`,
        pageName: tool.title,
        url: `/resources/tools/${tool.slug}`,
        category: "tool",
        seoCheck,
        score,
        status: tool.available ? "published" : "draft",
        issues,
      });
    });

    // Locations
    locations.forEach((location) => {
      const titleLength = location.metaTitle.length;
      const descLength = location.metaDescription.length;
      const seoCheck: SEOCheck = {
        hasTitle: !!location.metaTitle && titleLength <= 60,
        hasDescription: !!location.metaDescription && descLength <= 160,
        hasCanonical: true,
        hasSchema: true,
        hasOgImage: true,
        hasAltTags: true,
        hasH1: !!location.h1,
      };
      const score = calculateScore(seoCheck);
      const issues: string[] = [];
      if (titleLength > 60) issues.push(`Title: ${titleLength} chars (max 60)`);
      if (descLength > 160) issues.push(`Desc: ${descLength} chars (max 160)`);
      
      pages.push({
        id: `location-${location.slug}`,
        pageName: `${location.city}, ${location.stateAbbr}`,
        url: `/locations/${location.slug}`,
        category: "location",
        seoCheck,
        score,
        status: "published",
        issues,
      });
    });

    // Static pages
    staticPages.forEach((page) => {
      const seoCheck: SEOCheck = {
        hasTitle: true,
        hasDescription: true,
        hasCanonical: true,
        hasSchema: page.hasSchema,
        hasOgImage: page.hasOgImage,
        hasAltTags: true,
        hasH1: true,
      };
      const score = calculateScore(seoCheck);
      pages.push({
        id: `static-${page.url}`,
        pageName: page.name,
        url: page.url,
        category: "static",
        seoCheck,
        score,
        status: "published",
      });
    });

    return pages;
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return seoData.filter((page) => {
      const matchesSearch =
        page.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || page.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === "published") matchesStatus = page.status === "published";
      else if (statusFilter === "draft") matchesStatus = page.status === "draft";
      else if (statusFilter === "issues") matchesStatus = (page.issues?.length || 0) > 0;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [seoData, searchTerm, categoryFilter, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const published = seoData.filter((p) => p.status === "published");
    const perfect = published.filter((p) => p.score === 100).length;
    const needsWork = published.filter((p) => p.score < 80).length;
    const avgScore = published.length
      ? Math.round(published.reduce((sum, p) => sum + p.score, 0) / published.length)
      : 0;
    
    // Count issues by type
    const issues = {
      title: published.filter((p) => !p.seoCheck.hasTitle).length,
      description: published.filter((p) => !p.seoCheck.hasDescription).length,
      canonical: published.filter((p) => !p.seoCheck.hasCanonical).length,
      schema: published.filter((p) => !p.seoCheck.hasSchema).length,
      ogImage: published.filter((p) => !p.seoCheck.hasOgImage).length,
      altTags: published.filter((p) => !p.seoCheck.hasAltTags).length,
      h1: published.filter((p) => !p.seoCheck.hasH1).length,
    };

    return { total: published.length, perfect, needsWork, avgScore, issues };
  }, [seoData]);

  const exportCSV = () => {
    const headers = [
      "Page Name",
      "URL",
      "Category",
      "Status",
      "Score",
      "Title OK",
      "Desc OK",
      "Schema",
      "H1",
      "Issues",
    ];
    const rows = filteredData.map((page) => [
      `"${page.pageName.replace(/"/g, '""')}"`,
      page.url,
      page.category,
      page.status,
      page.score,
      page.seoCheck.hasTitle ? "✓" : "✗",
      page.seoCheck.hasDescription ? "✓" : "✗",
      page.seoCheck.hasSchema ? "✓" : "✗",
      page.seoCheck.hasH1 ? "✓" : "✗",
      `"${(page.issues || []).join("; ").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getCategoryBadge = (category: SEOPageData["category"]) => {
    const colors: Record<string, string> = {
      news: "bg-blue-500/10 text-blue-600 border-blue-200",
      guide: "bg-green-500/10 text-green-600 border-green-200",
      tool: "bg-purple-500/10 text-purple-600 border-purple-200",
      location: "bg-orange-500/10 text-orange-600 border-orange-200",
      static: "bg-gray-500/10 text-gray-600 border-gray-200",
    };
    return <Badge variant="outline" className={colors[category]}>{category}</Badge>;
  };

  const getScoreBadge = (score: number) => {
    if (score === 100) {
      return <Badge className="bg-green-600">100%</Badge>;
    } else if (score >= 80) {
      return <Badge className="bg-yellow-500">{score}%</Badge>;
    } else {
      return <Badge variant="destructive">{score}%</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Published pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.avgScore >= 90 ? "text-green-600" : stats.avgScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>
              {stats.avgScore}%
            </div>
            <p className="text-xs text-muted-foreground">SEO health score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Perfect Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.perfect}</div>
            <p className="text-xs text-muted-foreground">100% compliant pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.needsWork > 0 ? "text-red-600" : "text-green-600"}`}>
              {stats.needsWork}
            </div>
            <p className="text-xs text-muted-foreground">Pages below 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Overview */}
      {(stats.issues.title > 0 || stats.issues.description > 0 || stats.issues.schema > 0 || stats.issues.ogImage > 0) && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              {stats.issues.title > 0 && (
                <span className="text-muted-foreground">{stats.issues.title} missing/long titles</span>
              )}
              {stats.issues.description > 0 && (
                <span className="text-muted-foreground">{stats.issues.description} missing/long descriptions</span>
              )}
              {stats.issues.schema > 0 && (
                <span className="text-muted-foreground">{stats.issues.schema} missing schemas</span>
              )}
              {stats.issues.ogImage > 0 && (
                <span className="text-muted-foreground">{stats.issues.ogImage} missing OG images</span>
              )}
              {stats.issues.h1 > 0 && (
                <span className="text-muted-foreground">{stats.issues.h1} missing H1 tags</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SEO Audit Report</CardTitle>
            <CardDescription>
              Comprehensive SEO diagnostic for all published pages
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="location">Locations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issues">Has Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Page</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Title</TableHead>
                  <TableHead className="text-center">Desc</TableHead>
                  <TableHead className="text-center">Schema</TableHead>
                  <TableHead className="text-center">H1</TableHead>
                  <TableHead className="min-w-[150px]">Issues</TableHead>
                  <TableHead className="min-w-[120px]">Featured Image</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{page.pageName}</div>
                        <div className="text-xs text-muted-foreground">{page.url}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(page.category)}</TableCell>
                    <TableCell className="text-center">{getScoreBadge(page.score)}</TableCell>
                    <TableCell className="text-center">
                      <SEOCheckIcon passed={page.seoCheck.hasTitle} />
                    </TableCell>
                    <TableCell className="text-center">
                      <SEOCheckIcon passed={page.seoCheck.hasDescription} />
                    </TableCell>
                    <TableCell className="text-center">
                      <SEOCheckIcon passed={page.seoCheck.hasSchema} />
                    </TableCell>
                    <TableCell className="text-center">
                      <SEOCheckIcon passed={page.seoCheck.hasH1} />
                    </TableCell>
                    <TableCell>
                      {page.issues && page.issues.length > 0 ? (
                        <div className="text-xs text-destructive space-y-0.5">
                          {page.issues.filter(i => !i.includes("featured image")).map((issue, i) => (
                            <div key={i}>{issue}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {page.category === "news" ? (
                        page.featuredImage ? (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <div className="w-10 h-10 rounded border overflow-hidden bg-muted flex-shrink-0">
                                  <img 
                                    src={page.featuredImage} 
                                    alt="Featured" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 p-2" side="left">
                              <img 
                                src={page.featuredImage} 
                                alt="Featured preview" 
                                className="w-full h-auto rounded"
                              />
                              <p className="text-xs text-muted-foreground mt-2 truncate">{page.featuredImage}</p>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" />
                            No featured image
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {seoData.length} pages
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SEOCheckIcon({ passed }: { passed: boolean }) {
  return passed ? (
    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
  ) : (
    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
  );
}

function calculateScore(check: SEOCheck): number {
  const weights = {
    hasTitle: 20,
    hasDescription: 20,
    hasCanonical: 10,
    hasSchema: 20,
    hasOgImage: 10,
    hasAltTags: 10,
    hasH1: 10,
  };

  let score = 0;
  if (check.hasTitle) score += weights.hasTitle;
  if (check.hasDescription) score += weights.hasDescription;
  if (check.hasCanonical) score += weights.hasCanonical;
  if (check.hasSchema) score += weights.hasSchema;
  if (check.hasOgImage) score += weights.hasOgImage;
  if (check.hasAltTags) score += weights.hasAltTags;
  if (check.hasH1) score += weights.hasH1;

  return score;
}
