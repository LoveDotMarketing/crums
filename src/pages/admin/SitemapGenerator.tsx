import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { guides, BASE_URL, getGuideUrl } from "@/lib/guides";
import { tools, getToolUrl, getAvailableTools } from "@/lib/tools";
import { Copy, Check, FileCode, BookOpen, Calculator as CalculatorIcon, RefreshCw, Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IndexNowResult {
  success: boolean;
  status: number;
  message: string;
  urlsSubmitted: number;
}

const SitemapGenerator = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<IndexNowResult | null>(null);

  // IndexNow submission mutation
  const submitToIndexNow = useMutation({
    mutationFn: async (urls: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("indexnow-submit", {
        body: { urls },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data as IndexNowResult;
    },
    onSuccess: (data) => {
      setLastSubmission(data);
      if (data.success) {
        toast.success(`Submitted ${data.urlsSubmitted} URLs to IndexNow`);
      } else {
        toast.error(`IndexNow error: ${data.message}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });

  // Get all resource URLs for IndexNow submission
  const getAllResourceUrls = (): string[] => {
    const availableGuides = guides.filter(g => g.available);
    const availableToolsList = getAvailableTools();
    
    const urls: string[] = [
      `${BASE_URL}/resources`,
      `${BASE_URL}/resources/guides`,
      `${BASE_URL}/resources/tools`,
      ...availableGuides.map(g => getGuideUrl(g.slug)),
      ...availableToolsList.map(t => getToolUrl(t.slug)),
    ];
    
    return urls;
  };

  const handleGenerateAndSubmit = async () => {
    const urls = getAllResourceUrls();
    submitToIndexNow.mutate(urls);
  };

  const generateGuidesXml = (): string => {
    const availableGuides = guides.filter(g => g.available);
    
    let xml = `  <!-- Guides Hub -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/resources/guides</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n\n`;
    xml += `  <!-- Individual Guides -->\n`;

    availableGuides.forEach(guide => {
      xml += `  <url>\n`;
      xml += `    <loc>${getGuideUrl(guide.slug)}</loc>\n`;
      xml += `    <lastmod>${guide.lastModified}</lastmod>\n`;
      xml += `    <changefreq>${guide.changefreq}</changefreq>\n`;
      xml += `    <priority>${guide.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    return xml;
  };

  const generateToolsXml = (): string => {
    const availableTools = getAvailableTools();
    
    let xml = `  <!-- Financial Tools Hub -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/resources/tools</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n\n`;
    xml += `  <!-- Individual Tools -->\n`;

    availableTools.forEach(tool => {
      xml += `  <url>\n`;
      xml += `    <loc>${getToolUrl(tool.slug)}</loc>\n`;
      xml += `    <lastmod>${tool.lastModified}</lastmod>\n`;
      xml += `    <changefreq>${tool.changefreq}</changefreq>\n`;
      xml += `    <priority>${tool.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    return xml;
  };

  const generateFullSitemap = (): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${generateGuidesXml()}
${generateToolsXml()}
</urlset>`;
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const availableGuides = guides.filter(g => g.available);
  const unavailableGuides = guides.filter(g => !g.available);
  const availableTools = getAvailableTools();
  const unavailableTools = tools.filter(t => !t.available);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">Sitemap Generator</h1>
              <p className="text-muted-foreground">Generate XML sitemap entries for guides and tools</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{availableGuides.length}</div>
                <p className="text-sm text-muted-foreground">
                  {unavailableGuides.length} coming soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalculatorIcon className="h-5 w-5 text-primary" />
                  Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{availableTools.length}</div>
                <p className="text-sm text-muted-foreground">
                  {unavailableTools.length > 0 ? `${unavailableTools.length} coming soon` : "Financial calculators"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  Total URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{availableGuides.length + availableTools.length + 2}</div>
                <p className="text-sm text-muted-foreground">Including hub pages</p>
              </CardContent>
            </Card>
          </div>

          {/* IndexNow Quick Submit */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Submit to IndexNow
                  </CardTitle>
                  <CardDescription>
                    Automatically submit all resource URLs ({getAllResourceUrls().length} URLs) to search engines
                  </CardDescription>
                </div>
                <Button
                  onClick={handleGenerateAndSubmit}
                  disabled={submitToIndexNow.isPending}
                  className="gap-2"
                >
                  {submitToIndexNow.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit All Resource URLs
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {lastSubmission && (
              <CardContent>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  lastSubmission.success ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
                }`}>
                  {lastSubmission.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {lastSubmission.message} ({lastSubmission.urlsSubmitted} URLs)
                  </span>
                </div>
              </CardContent>
            )}
          </Card>

          <Tabs defaultValue="guides" className="space-y-4">
            <TabsList>
              <TabsTrigger value="guides">Guides Registry</TabsTrigger>
              <TabsTrigger value="tools">Tools Registry</TabsTrigger>
              <TabsTrigger value="xml">Generated XML</TabsTrigger>
            </TabsList>

            <TabsContent value="guides">
              <Card>
                <CardHeader>
                  <CardTitle>Guide Registry</CardTitle>
                  <CardDescription>
                    All guides defined in src/lib/guides.ts. Add new guides there to include in sitemap.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guides.map(guide => (
                      <div key={guide.slug} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <guide.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{guide.title}</p>
                            <p className="text-xs text-muted-foreground">/resources/guides/{guide.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={guide.available ? "default" : "secondary"}>
                            {guide.available ? "Published" : "Coming Soon"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Priority: {guide.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Tools Registry</CardTitle>
                  <CardDescription>
                    All tools defined in src/lib/tools.ts. Add new tools there to include in sitemap.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tools.map(tool => (
                      <div key={tool.slug} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <tool.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{tool.title}</p>
                            <p className="text-xs text-muted-foreground">/resources/tools/{tool.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tool.available ? "default" : "secondary"}>
                            {tool.available ? "Published" : "Coming Soon"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Priority: {tool.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xml">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Guides Sitemap XML</CardTitle>
                        <CardDescription>Copy and paste into public/sitemap.xml</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateGuidesXml(), "guides")}
                      >
                        {copiedSection === "guides" ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {generateGuidesXml()}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tools Sitemap XML</CardTitle>
                        <CardDescription>Copy and paste into public/sitemap.xml</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateToolsXml(), "tools")}
                      >
                        {copiedSection === "tools" ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {generateToolsXml()}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Full Sitemap Preview</CardTitle>
                        <CardDescription>Complete XML output for resources section</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateFullSitemap(), "full")}
                      >
                        {copiedSection === "full" ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy Full
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                      {generateFullSitemap()}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                How to Add a New Guide or Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create the page in <code className="bg-muted px-1 rounded">src/pages/resources/guides/</code> or <code className="bg-muted px-1 rounded">src/pages/resources/</code></li>
                <li>Add the entry to <code className="bg-muted px-1 rounded">src/lib/guides.ts</code> or <code className="bg-muted px-1 rounded">src/lib/tools.ts</code> with <code className="bg-muted px-1 rounded">available: true</code></li>
                <li>Add the route in <code className="bg-muted px-1 rounded">src/App.tsx</code></li>
                <li>Copy the generated XML and paste into <code className="bg-muted px-1 rounded">public/sitemap.xml</code></li>
                <li className="font-medium text-foreground">Click "Submit All Resource URLs" above to notify search engines immediately</li>
              </ol>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SitemapGenerator;
