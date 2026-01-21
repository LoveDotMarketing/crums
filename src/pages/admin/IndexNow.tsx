import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Globe, FileText, CheckCircle, XCircle, Loader2, ExternalLink, Newspaper, Sparkles, MapPin, BookOpen, Calculator, Users, Factory, Briefcase, Truck } from "lucide-react";
import { newsArticles } from "@/lib/news";
import { locations } from "@/lib/locations";
import { guides, getAvailableGuides } from "@/lib/guides";
import { tools, getAvailableTools } from "@/lib/tools";
import { teamMembers } from "@/lib/team";

// Generate news article URLs from the registry
const NEWS_URLS = newsArticles.map(article => `https://crumsleasing.com/news/${article.slug}`);

// Generate location page URLs from the registry
const LOCATION_URLS = locations.map(location => `https://crumsleasing.com/locations/${location.slug}`);

// Generate guide URLs from the registry (available guides only)
const GUIDE_URLS = getAvailableGuides().map(guide => `https://crumsleasing.com/resources/guides/${guide.slug}`);

// Generate tool URLs from the registry (available tools only)
const TOOL_URLS = getAvailableTools().map(tool => `https://crumsleasing.com/resources/tools/${tool.slug}`);

// Generate team member URLs from the registry
const TEAM_URLS = teamMembers.map(member => `https://crumsleasing.com/about/${member.slug}`);

// Industry page URLs
const INDUSTRY_URLS = [
  "https://crumsleasing.com/industries",
  "https://crumsleasing.com/industries/owner-operators",
  "https://crumsleasing.com/industries/logistics-companies",
  "https://crumsleasing.com/industries/manufacturing",
  "https://crumsleasing.com/industries/food-distribution",
  "https://crumsleasing.com/industries/retail-distribution",
  "https://crumsleasing.com/industries/fleet-leasing",
  "https://crumsleasing.com/industries/seasonal-demand",
];

// Career page URLs
const CAREER_URLS = [
  "https://crumsleasing.com/careers",
  "https://crumsleasing.com/careers/trailer-leasing-sales-rep",
];

// Service page URLs
const SERVICE_URLS = [
  "https://crumsleasing.com/services",
  "https://crumsleasing.com/services/trailer-leasing",
  "https://crumsleasing.com/services/trailer-rentals",
  "https://crumsleasing.com/services/fleet-solutions",
  "https://crumsleasing.com/services/emergency-trailer-rental",
  "https://crumsleasing.com/services/dry-van-trailers",
  "https://crumsleasing.com/services/flatbed-trailers",
];

// Static sitemap URLs for the site (main pages)
const SITEMAP_URLS = [
  "https://crumsleasing.com/",
  "https://crumsleasing.com/about",
  "https://crumsleasing.com/about/mission",
  "https://crumsleasing.com/about/why-choose-crums",
  "https://crumsleasing.com/services",
  "https://crumsleasing.com/services/trailer-leasing",
  "https://crumsleasing.com/services/trailer-rentals",
  "https://crumsleasing.com/services/fleet-solutions",
  "https://crumsleasing.com/services/emergency-trailer-rental",
  "https://crumsleasing.com/services/dry-van-trailers",
  "https://crumsleasing.com/services/flatbed-trailers",
  "https://crumsleasing.com/industries",
  "https://crumsleasing.com/industries/owner-operators",
  "https://crumsleasing.com/industries/logistics-companies",
  "https://crumsleasing.com/industries/manufacturing",
  "https://crumsleasing.com/industries/food-distribution",
  "https://crumsleasing.com/industries/retail-distribution",
  "https://crumsleasing.com/industries/fleet-leasing",
  "https://crumsleasing.com/industries/seasonal-demand",
  "https://crumsleasing.com/locations",
  "https://crumsleasing.com/resources",
  "https://crumsleasing.com/resources/guides",
  "https://crumsleasing.com/resources/tools",
  "https://crumsleasing.com/news",
  "https://crumsleasing.com/contact",
  "https://crumsleasing.com/get-started",
  "https://crumsleasing.com/careers",
  "https://crumsleasing.com/partners",
  "https://crumsleasing.com/reviews",
  "https://crumsleasing.com/referral-program",
];

// Combined: all sitemap + all news articles + all locations + guides + tools + team + industries + careers + services
const ALL_URLS = [...SITEMAP_URLS, ...NEWS_URLS, ...LOCATION_URLS, ...GUIDE_URLS, ...TOOL_URLS, ...TEAM_URLS, ...INDUSTRY_URLS, ...CAREER_URLS, ...SERVICE_URLS].filter((url, index, self) => self.indexOf(url) === index);

interface SubmissionResult {
  success: boolean;
  status: number;
  message: string;
  urlsSubmitted: number;
}

const IndexNow = () => {
  const [customUrls, setCustomUrls] = useState("");
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

  // Get the most recent news article for "new content" highlight
  const latestArticle = newsArticles[0];

  const submitMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const { data, error } = await supabase.functions.invoke('indexnow-submit', {
        body: { urls }
      });
      
      if (error) throw error;
      return data as SubmissionResult;
    },
    onSuccess: (data) => {
      setLastResult(data);
      if (data.success) {
        toast.success(`Successfully submitted ${data.urlsSubmitted} URLs to IndexNow`);
      } else {
        toast.error(`Submission failed: ${data.message}`);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmitAll = () => {
    submitMutation.mutate(ALL_URLS);
  };

  const handleSubmitNews = () => {
    submitMutation.mutate([...NEWS_URLS, "https://crumsleasing.com/news"]);
  };

  const handleSubmitLocations = () => {
    submitMutation.mutate([...LOCATION_URLS, "https://crumsleasing.com/locations"]);
  };

  const handleSubmitGuides = () => {
    submitMutation.mutate([...GUIDE_URLS, "https://crumsleasing.com/resources/guides"]);
  };

  const handleSubmitTools = () => {
    submitMutation.mutate([...TOOL_URLS, "https://crumsleasing.com/resources/tools"]);
  };

  const handleSubmitTeam = () => {
    submitMutation.mutate([...TEAM_URLS, "https://crumsleasing.com/about"]);
  };

  const handleSubmitIndustries = () => {
    submitMutation.mutate(INDUSTRY_URLS);
  };

  const handleSubmitCareers = () => {
    submitMutation.mutate(CAREER_URLS);
  };

  const handleSubmitServices = () => {
    submitMutation.mutate(SERVICE_URLS);
  };

  const handleSubmitLatest = () => {
    submitMutation.mutate([`https://crumsleasing.com/news/${latestArticle.slug}`]);
  };

  const handleSubmitSitemap = () => {
    submitMutation.mutate(SITEMAP_URLS);
  };

  const handleSubmitCustom = () => {
    const urls = customUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.startsWith('https://crumsleasing.com'));
    
    if (urls.length === 0) {
      toast.error("No valid URLs found. URLs must start with https://crumsleasing.com");
      return;
    }
    
    submitMutation.mutate(urls);
  };

  return (
    <>
      <SEO 
        title="IndexNow Management | Admin"
        description="Submit URLs to search engines via IndexNow"
        noindex={true}
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">IndexNow</h1>
                <p className="text-muted-foreground mt-1">
                  Submit URLs to Bing, Yandex, and other search engines for instant indexing
                </p>
              </div>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    IndexNow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Key Configured
                    </Badge>
                    <a 
                      href="https://crumsleasing.com/26539d428c9b4617a97ed293e6eea3c0.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      View Key File <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  {lastResult && (
                    <div className={`p-4 rounded-lg ${lastResult.success ? 'bg-primary/10 border border-primary/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {lastResult.success ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-medium">Last Submission</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Status: {lastResult.status} - {lastResult.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        URLs submitted: {lastResult.urlsSubmitted}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    One-click submission for common use cases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      onClick={handleSubmitLatest}
                      disabled={submitMutation.isPending}
                      variant="default"
                      className="w-full"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Newspaper className="mr-2 h-4 w-4" />
                      )}
                      Submit Latest Article
                    </Button>
                    <Button 
                      onClick={handleSubmitAll}
                      disabled={submitMutation.isPending}
                      variant="secondary"
                      className="w-full"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Globe className="mr-2 h-4 w-4" />
                      )}
                      Submit All ({ALL_URLS.length} URLs)
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Latest Article:</p>
                    <p className="text-sm text-muted-foreground truncate">{latestArticle.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Published: {latestArticle.date}</p>
                  </div>
                </CardContent>
              </Card>

              {/* News Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    News Articles ({NEWS_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all news article URLs to IndexNow for faster indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {NEWS_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitNews}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All News Articles
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Submit Sitemap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Main Pages ({SITEMAP_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit core sitemap pages (home, services, industries, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {SITEMAP_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitSitemap}
                    disabled={submitMutation.isPending}
                    variant="secondary"
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Main Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Location Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Pages ({LOCATION_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all city/location landing page URLs for local SEO indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {LOCATION_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitLocations}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Location Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Resource Guides */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Resource Guides ({GUIDE_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all available guide URLs for resource indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {GUIDE_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitGuides}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Guides
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Calculator Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculator Tools ({TOOL_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all available calculator and tool URLs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {TOOL_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitTools}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Tools
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Team Member Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Member Pages ({TEAM_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all team member profile URLs for about section coverage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {TEAM_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitTeam}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Team Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Industry Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Industry Pages ({INDUSTRY_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all industry-specific landing pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {INDUSTRY_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitIndustries}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Industry Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Career Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Career Pages ({CAREER_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit careers hub and job posting pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {CAREER_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitCareers}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Career Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Service Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Service Pages ({SERVICE_URLS.length})
                  </CardTitle>
                  <CardDescription>
                    Submit all service offering pages including trailer types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <ul className="text-sm space-y-1 font-mono">
                      {SERVICE_URLS.map((url, i) => (
                        <li key={i} className="text-muted-foreground">{url}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSubmitServices}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Service Pages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Custom URLs */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit Custom URLs</CardTitle>
                  <CardDescription>
                    Enter URLs to submit (one per line). Must start with https://crumsleasing.com
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="https://crumsleasing.com/news/new-article&#10;https://crumsleasing.com/locations/houston-tx"
                    value={customUrls}
                    onChange={(e) => setCustomUrls(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={handleSubmitCustom}
                    disabled={submitMutation.isPending || !customUrls.trim()}
                    variant="secondary"
                    className="w-full"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Custom URLs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">200</Badge>
                      <span>URLs submitted successfully</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">202</Badge>
                      <span>URLs accepted, pending processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">400</Badge>
                      <span>Invalid format</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">403</Badge>
                      <span>Key not valid or file not found</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">422</Badge>
                      <span>URLs don't belong to host</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-12 justify-center">429</Badge>
                      <span>Too many requests (rate limited)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default IndexNow;
