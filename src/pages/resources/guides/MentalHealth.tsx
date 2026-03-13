import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Brain, Sun, Moon, Heart, Music, Phone, Coffee, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MentalHealth = () => {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Keep Your Mind Sharp and Positive on the Road",
      "description": "Mental health guide for truck drivers. Learn strategies for staying alert, reducing stress, maintaining connections, and keeping a positive mindset during long hauls.",
      "author": {
        "@type": "Organization",
        "name": "CRUMS Leasing"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CRUMS Leasing",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crumsleasing.com/logo.png"
        }
      },
      "datePublished": "2026-02-01",
      "dateModified": "2026-02-01",
      "mainEntityOfPage": "https://crumsleasing.com/resources/guides/mental-health"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can truck drivers deal with loneliness on the road?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stay connected through regular video calls with family, join online trucker communities, listen to podcasts and audiobooks, stop at busy truck stops to socialize, and consider getting a pet if your lifestyle allows. Building a routine that includes social interaction helps combat isolation."
          }
        },
        {
          "@type": "Question",
          "name": "What are signs of driver fatigue I should watch for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Warning signs include frequent yawning, difficulty focusing, drifting between lanes, missing exits, heavy eyelids, irritability, and daydreaming. If you experience these symptoms, pull over safely and rest. No load is worth risking your life."
          }
        },
        {
          "@type": "Question",
          "name": "How can I reduce stress as a truck driver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Effective stress reducers include planning routes in advance, building buffer time into schedules, practicing deep breathing exercises, listening to calming music or podcasts, taking short walks during breaks, maintaining a healthy diet, and getting quality sleep. Setting boundaries and accepting what you can't control also helps."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://crumsleasing.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://crumsleasing.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Guides", "item": "https://crumsleasing.com/resources/guides" },
        { "@type": "ListItem", "position": 4, "name": "Mental Health", "item": "https://crumsleasing.com/resources/guides/mental-health" }
      ]
    }
  ];

  const alertnessTips = [
    { icon: Sun, title: "Get Natural Light", description: "Morning sunlight helps regulate your sleep cycle" },
    { icon: Coffee, title: "Smart Caffeine Use", description: "Time caffeine strategically, avoid 6+ hours before sleep" },
    { icon: Activity, title: "Stay Physically Active", description: "Short walks during breaks boost energy and focus" },
    { icon: Music, title: "Engage Your Mind", description: "Podcasts, audiobooks, and music prevent mental drift" }
  ];

  const stressSignals = [
    "Difficulty sleeping or sleeping too much",
    "Irritability or short temper",
    "Loss of interest in things you enjoy",
    "Difficulty concentrating",
    "Physical symptoms (headaches, stomach issues)",
    "Feeling overwhelmed or hopeless"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Keep Your Mind Sharp and Positive on the Road"
        description="Mental health guide for truck drivers. Strategies for staying alert, reducing stress, and maintaining a positive mindset during long hauls."
        canonical="https://crumsleasing.com/resources/guides/mental-health"
        structuredData={structuredData}
        article={{
          publishedTime: "2026-02-01",
          modifiedTime: "2026-02-01",
          section: "Resources",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-lg">
                <Brain className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Driver Wellness
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Keep Your Mind Sharp and Positive on the Road
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl">
              Long-haul trucking can be mentally demanding. Learn practical strategies to stay 
              alert, manage stress, combat loneliness, and maintain the positive mindset that 
              keeps you safe and successful.
            </p>
          </div>
        </section>

        {/* Why Mental Health Matters */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your mental health directly impacts your safety, your driving performance, and 
                your quality of life. Studies show that truck drivers face higher rates of 
                depression, anxiety, and sleep disorders than the general population. But it 
                doesn't have to be that way. With the right strategies, you can thrive on the road.
              </p>
            </div>
          </div>
        </section>

        {/* Staying Alert */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Sun className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Staying Alert and Focused</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {alertnessTips.map((tip, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <tip.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Know the Warning Signs of Fatigue
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="text-muted-foreground space-y-2">
                      <li>• Frequent yawning or heavy eyelids</li>
                      <li>• Drifting between lanes</li>
                      <li>• Missing exits or signs</li>
                    </ul>
                    <ul className="text-muted-foreground space-y-2">
                      <li>• Difficulty remembering the last few miles</li>
                      <li>• Restlessness or irritability</li>
                      <li>• Daydreaming or zoning out</li>
                    </ul>
                  </div>
                  <p className="mt-4 font-medium text-amber-800 dark:text-amber-200">
                    If you experience these symptoms, pull over safely and rest. No load is worth your life.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Managing Stress */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Heart className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Managing Stress on the Road</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Common Stressors</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Tight deadlines and schedule pressure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Traffic, weather, and road conditions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Time away from family and home
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Financial concerns and market fluctuations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Difficult customers or dispatchers
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Healthy Coping Strategies</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Plan routes and build buffer time into schedules</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Practice deep breathing during frustrating moments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Listen to calming music or comedy podcasts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Take short walks during breaks to reset</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Accept what you can't control</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-lg mb-3">💡 The 4-7-8 Breathing Technique</h3>
                <p className="text-muted-foreground mb-4">
                  When stress hits, try this calming technique: Breathe in for 4 seconds, hold for 
                  7 seconds, exhale slowly for 8 seconds. Repeat 3-4 times. This activates your 
                  body's relaxation response.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Combating Loneliness */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Phone className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Staying Connected</h2>
              </div>

              <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
                Isolation is one of the biggest challenges in trucking. Building and maintaining 
                connections keeps you grounded and gives you something to look forward to.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Family Connections</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Schedule regular video calls</li>
                      <li>• Share photos from your travels</li>
                      <li>• Send postcards from different states</li>
                      <li>• Plan home time carefully</li>
                      <li>• Celebrate milestones together virtually</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Driver Community</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Join online trucker groups</li>
                      <li>• Use CB radio to chat</li>
                      <li>• Stop at busy truck stops</li>
                      <li>• Attend industry events</li>
                      <li>• Build relationships with regular customers</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Entertainment</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Podcasts and audiobooks</li>
                      <li>• Music playlists for different moods</li>
                      <li>• Language learning apps</li>
                      <li>• Call-in radio shows</li>
                      <li>• Consider a pet companion</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Sleep & Recovery */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Moon className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Quality Sleep & Recovery</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Creating a Sleep Routine</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Keep a consistent sleep schedule when possible</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Use blackout curtains and white noise</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Keep your sleeper berth cool (65-68°F ideal)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Limit screen time 30 minutes before bed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Avoid heavy meals and caffeine before sleep</span>
                    </li>
                  </ul>
                </div>

                <Card className="bg-accent">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Recognize When You Need Help</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      These signs may indicate it's time to talk to a professional:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {stressSignals.map((signal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Heart className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-6">You're Not Alone</h2>
              <p className="text-xl text-primary-foreground/90 mb-8">
                If you're struggling, help is available. These resources provide confidential 
                support specifically for truck drivers:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Truckers Against Trafficking Hotline</h3>
                  <p className="text-primary-foreground/80 text-sm mb-2">Resources and support for drivers</p>
                  <p className="font-mono">1-888-373-7888</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">National Suicide Prevention Lifeline</h3>
                  <p className="text-primary-foreground/80 text-sm mb-2">24/7 crisis support</p>
                  <p className="font-mono">988</p>
                </div>
              </div>
              <Button asChild size="lg" variant="secondary">
                <Link to="/resources/guides/work-life-balance">Work-Life Balance Guide</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/resources/guides/road-comfort" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Road Comfort</h3>
                  <p className="text-sm text-muted-foreground">Make your cab a comfortable home away from home</p>
                </Link>
                <Link to="/resources/guides/work-life-balance" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Work-Life Balance</h3>
                  <p className="text-sm text-muted-foreground">Staying connected with family while on the road</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <GuideRelatedContent currentSlug="mental-health" />
      <Footer />
    </div>
  );
};

export default MentalHealth;
