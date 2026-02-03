import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentItem {
  slug: string;
  title: string;
  lastModified: string;
  available?: boolean;
}

interface ChangelogEntry {
  category: string;
  item_name: string;
  item_slug: string;
  item_url: string | null;
  action: string;
  date_recorded: string;
  month_year: string;
  notes: string | null;
}

// Content registry data - mirrors the TypeScript registries
const newsArticles: ContentItem[] = [
  { slug: "crums-leasing-joins-greater-san-antonio-chamber-of-commerce", title: "CRUMS Leasing Joins The Greater San Antonio Chamber of Commerce", lastModified: "2026-01-29" },
  { slug: "mats-2026-crums-leasing-booth-38024", title: "CRUMS Leasing Returns to Mid-America Trucking Show 2026", lastModified: "2025-12-10" },
  { slug: "family-first-core-values-reaffirmation", title: "CRUMS Leasing Reaffirms Core Values: Family First", lastModified: "2025-12-10" },
  { slug: "mats-2025-debut-louisville", title: "CRUMS Leasing Debuts at Mid-America Trucking Show 2025", lastModified: "2025-12-10" },
  { slug: "major-launch-texas-expansion-march-2025", title: "CRUMS Leasing Announces Major Launch and Texas Expansion", lastModified: "2025-12-10" },
  { slug: "10-4-magazine-feature-february-2025", title: "CRUMS Leasing Featured in 10-4 Magazine", lastModified: "2025-12-10" },
  { slug: "official-industry-entry-announcement", title: "CRUMS Leasing Makes Official Industry Entry Announcement", lastModified: "2025-12-10" },
  { slug: "texas-truckers-giveaway-promotion", title: "Texas Truckers Giveaway Promotion Concludes", lastModified: "2025-12-10" },
  { slug: "new-year-launch-tease-texas-focus", title: "New Year Launch Tease and Texas Focus", lastModified: "2025-12-10" },
  { slug: "eric-bledsoe-shanghai-sharks-contract-extension", title: "Eric Bledsoe Signs Contract Extension with Shanghai Sharks", lastModified: "2025-12-10" },
  { slug: "recognition-dual-career-path", title: "Recognition of Eric Bledsoe's Dual Career Path", lastModified: "2025-12-10" },
  { slug: "founder-spotlight-public-introduction", title: "Founder Spotlight: Public Introduction of CRUMS Leasing Vision", lastModified: "2025-12-10" },
  { slug: "promotional-debut-meet-greet-basketball-tournament", title: "Promotional Debut: Meet & Greet at Basketball Tournament", lastModified: "2025-12-10" },
  { slug: "first-public-tease-fleet-preview", title: "First Public Tease: Fleet Preview with CRUMS", lastModified: "2025-12-10" },
  { slug: "conception-early-planning", title: "CRUMS Leasing: Conception and Early Planning", lastModified: "2025-12-10" },
];

const guides: ContentItem[] = [
  { slug: "getting-your-cdl", title: "How to Get Your CDL License", lastModified: "2026-01-29", available: true },
  { slug: "load-boards-guide", title: "Understanding Load Boards: DAT, Truckstop & More", lastModified: "2026-01-29", available: true },
  { slug: "finding-first-loads", title: "How to Find Your First Trucking Loads", lastModified: "2026-01-29", available: true },
  { slug: "lease-first-trailer", title: "Why Lease Your First Trailer", lastModified: "2026-01-29", available: true },
  { slug: "owner-operator-basics", title: "Owner-Operator Business Basics", lastModified: "2026-01-29", available: true },
  { slug: "choosing-trailer", title: "How to Choose the Right Trailer for Your Haul", lastModified: "2025-12-04", available: true },
  { slug: "why-leasing-a-dry-van-trailer-is-a-smart-business-decision", title: "Why Leasing a Dry Van Trailer is a Smart Business Decision", lastModified: "2025-12-10", available: true },
  { slug: "trailer-specifications", title: "Complete Trailer Specifications & Dimensions Guide", lastModified: "2025-12-26", available: true },
  { slug: "maintenance-schedules", title: "Trailer Maintenance Schedules", lastModified: "2026-01-29", available: true },
  { slug: "tire-care", title: "Commercial Trailer Tire Care & Inspection Guide", lastModified: "2026-01-29", available: true },
  { slug: "pre-trip-inspection", title: "How to Check Your Trailer Before Every Trip", lastModified: "2026-01-20", available: true },
  { slug: "winter-driving", title: "How to Handle Winter Roads Like a Pro", lastModified: "2026-01-29", available: true },
];

const tools: ContentItem[] = [
  { slug: "cost-per-mile", title: "Trucking Cost Per Mile Calculator", lastModified: "2025-12-26", available: true },
  { slug: "lease-vs-buy", title: "Lease vs Buy Calculator", lastModified: "2025-12-04", available: true },
  { slug: "profit-calculator", title: "Trucking Profit Calculator", lastModified: "2025-12-26", available: true },
  { slug: "ifta-calculator", title: "IFTA Tax Estimator", lastModified: "2025-12-04", available: true },
  { slug: "fuel-calculator", title: "Fuel Cost Calculator", lastModified: "2025-12-04", available: true },
  { slug: "tax-deductions", title: "Owner-Operator Tax Deduction Guide", lastModified: "2025-12-26", available: true },
  { slug: "per-diem-calculator", title: "Truck Driver Per Diem Calculator", lastModified: "2025-12-27", available: true },
];

function getMonthYear(dateStr: string): string {
  return dateStr.substring(0, 7); // "2026-01-29" -> "2026-01"
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing changelog entries
    const { data: existingEntries, error: fetchError } = await supabase
      .from("development_changelog")
      .select("item_slug, category, date_recorded");

    if (fetchError) {
      throw new Error(`Failed to fetch existing entries: ${fetchError.message}`);
    }

    // Create a map of existing entries by slug+category
    const existingMap = new Map<string, { date_recorded: string }>();
    (existingEntries || []).forEach((entry) => {
      const key = `${entry.category}:${entry.item_slug}`;
      existingMap.set(key, { date_recorded: entry.date_recorded });
    });

    const newEntries: ChangelogEntry[] = [];

    // Process news articles
    for (const article of newsArticles) {
      const key = `news:${article.slug}`;
      if (!existingMap.has(key)) {
        newEntries.push({
          category: "news",
          item_name: article.title,
          item_slug: article.slug,
          item_url: `/news/${article.slug}`,
          action: "added",
          date_recorded: article.lastModified,
          month_year: getMonthYear(article.lastModified),
          notes: null,
        });
      }
    }

    // Process guides (only available ones)
    for (const guide of guides.filter(g => g.available !== false)) {
      const key = `guide:${guide.slug}`;
      if (!existingMap.has(key)) {
        newEntries.push({
          category: "guide",
          item_name: guide.title,
          item_slug: guide.slug,
          item_url: `/resources/guides/${guide.slug}`,
          action: "added",
          date_recorded: guide.lastModified,
          month_year: getMonthYear(guide.lastModified),
          notes: null,
        });
      }
    }

    // Process tools (only available ones)
    for (const tool of tools.filter(t => t.available !== false)) {
      const key = `tool:${tool.slug}`;
      if (!existingMap.has(key)) {
        newEntries.push({
          category: "tool",
          item_name: tool.title,
          item_slug: tool.slug,
          item_url: `/resources/tools/${tool.slug}`,
          action: "added",
          date_recorded: tool.lastModified,
          month_year: getMonthYear(tool.lastModified),
          notes: null,
        });
      }
    }

    // Insert new entries if any
    let insertedCount = 0;
    if (newEntries.length > 0) {
      const { error: insertError } = await supabase
        .from("development_changelog")
        .insert(newEntries);

      if (insertError) {
        throw new Error(`Failed to insert entries: ${insertError.message}`);
      }
      insertedCount = newEntries.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${insertedCount} new entries`,
        details: {
          newEntries: insertedCount,
          existingEntries: existingMap.size,
          categories: {
            news: newEntries.filter(e => e.category === "news").length,
            guides: newEntries.filter(e => e.category === "guide").length,
            tools: newEntries.filter(e => e.category === "tool").length,
          },
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
