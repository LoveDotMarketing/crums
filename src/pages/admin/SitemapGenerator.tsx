import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { guides, BASE_URL, getGuideUrl } from "@/lib/guides";
import { Copy, Check, FileCode, BookOpen, Calculator, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Financial tools registry
const tools = [
  { slug: "cost-per-mile", title: "Cost Per Mile Calculator", lastModified: "2025-12-04", priority: 0.8 },
  { slug: "lease-vs-buy", title: "Lease vs Buy Calculator", lastModified: "2025-12-04", priority: 0.8 },
  { slug: "profit-calculator", title: "Profit Per Load Calculator", lastModified: "2025-12-04", priority: 0.8 },
  { slug: "ifta-calculator", title: "IFTA Tax Estimator", lastModified: "2025-12-04", priority: 0.8 },
  { slug: "fuel-calculator", title: "Fuel Cost Calculator", lastModified: "2025-12-04", priority: 0.7 },
  { slug: "tax-deductions", title: "Tax Deduction Guide", lastModified: "2025-12-04", priority: 0.7 },
];

const SitemapGenerator = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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
    let xml = `  <!-- Financial Tools Hub -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/resources/tools</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n\n`;
    xml += `  <!-- Individual Tools -->\n`;

    tools.forEach(tool => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/resources/tools/${tool.slug}</loc>\n`;
      xml += `    <lastmod>${tool.lastModified}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
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
                  <Calculator className="h-5 w-5 text-primary" />
                  Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tools.length}</div>
                <p className="text-sm text-muted-foreground">Financial calculators</p>
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
                <div className="text-3xl font-bold">{availableGuides.length + tools.length + 2}</div>
                <p className="text-sm text-muted-foreground">Including hub pages</p>
              </CardContent>
            </Card>
          </div>

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
                    Financial calculator tools. These are all published.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tools.map(tool => (
                      <div key={tool.slug} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calculator className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{tool.title}</p>
                            <p className="text-xs text-muted-foreground">/resources/tools/{tool.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>Published</Badge>
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
                How to Add a New Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create the guide page in <code className="bg-muted px-1 rounded">src/pages/resources/guides/</code></li>
                <li>Add the entry to <code className="bg-muted px-1 rounded">src/lib/guides.ts</code> with <code className="bg-muted px-1 rounded">available: true</code></li>
                <li>Add the route in <code className="bg-muted px-1 rounded">src/App.tsx</code></li>
                <li>Come back here and copy the generated XML</li>
                <li>Paste into <code className="bg-muted px-1 rounded">public/sitemap.xml</code></li>
              </ol>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SitemapGenerator;
