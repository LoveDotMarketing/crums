import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
const CrumsStory = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "The CRUMS Story",
    "description": "The story of CRUMS Leasing told through music - a journey from humble beginnings to building something meaningful.",
    "thumbnailUrl": "https://img.youtube.com/vi/6bgpMNmkQbc/maxresdefault.jpg",
    "uploadDate": "2026-02-04",
    "contentUrl": "https://youtu.be/6bgpMNmkQbc",
    "embedUrl": "https://www.youtube.com/embed/6bgpMNmkQbc"
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <SEO title="The CRUMS Story" description="The story of CRUMS Leasing told through music - a journey from humble beginnings to building something meaningful." canonical="https://crumsleasing.com/crums-story" ogImage="/images/crums-story-og.png" structuredData={structuredData} />
      <Navigation />
      <Breadcrumbs items={[{
      label: "Home",
      href: "/"
    }, {
      label: "The CRUMS Story",
      href: "/crums-story"
    }]} />

      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/95 to-primary/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The CRUMS Story
            </h1>
            <p className="text-xl md:text-2xl text-white/80">
              A journey from humble beginnings to building something meaningful
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe src="https://www.youtube.com/embed/6bgpMNmkQbc?rel=0" title="The CRUMS Story Music Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            </div>
            
            {/* Credits Box */}
            <div className="mt-6 bg-muted/50 rounded-xl p-6 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-foreground">Title:</span>
                  <span className="ml-2 text-muted-foreground">The CRUMS Story</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Music Video:</span>
                  <span className="ml-2 text-muted-foreground">Veo AI</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Song Credit:</span>
                  <span className="ml-2 text-muted-foreground">Suno AI</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Singer:</span>
                  <span className="ml-2 text-muted-foreground">AI Vocals Sampled from Eric Bledseo Voice</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-foreground">Produced by:</span>
                  <span className="ml-2 text-muted-foreground">Love.Marketing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lyrics Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Lyrics
            </h2>

            <div className="space-y-12 text-foreground/90">
              {/* Spoken Word Intro */}
              <div className="bg-muted/50 rounded-xl p-6 md:p-8 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Spoken Word Intro
                </h3>
                <div className="space-y-4 text-lg leading-relaxed italic">
                  <p>Yeah</p>
                  <p>I named this after my mom</p>
                  <p>Because everything I am started with her</p>
                  <p>Watching her figure it out when nothing was promised</p>
                  <p>Lights due gas low still getting us where we needed to be</p>
                  <p>She showed me patience perseverance and how to stay kind</p>
                  <p>Even when the world is not</p>
                  <p>This is me trying to turn that into something real</p>
                </div>
              </div>

              {/* Verse 1 */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Verse 1
                </h3>
                <div className="space-y-2 text-lg leading-relaxed">
                  <p>Late nights growing up watching candles glow</p>
                  <p>Bills on the table momma stressing low</p>
                  <p>Gas light on still made it to work</p>
                  <p>Still made sure we ate still put us first</p>
                  <p className="pt-2">Kingston block with the rec down the street</p>
                  <p>Learned how to stand when the ground not sweet</p>
                  <p>Every walk home felt like rolling dice</p>
                  <p>Bullies one day fights one night</p>
                  <p className="pt-2">I did not know how to change that life</p>
                  <p>All I knew was it could not be mine</p>
                  <p>Dreams felt far when you broke inside</p>
                  <p>But she kept saying son just give it time</p>
                </div>
              </div>

              {/* Hook */}
              <div className="bg-primary/5 rounded-xl p-6 md:p-8 border-l-4 border-primary">
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Hook
                </h3>
                <div className="space-y-2 text-lg leading-relaxed font-medium">
                  <p>From the bottom where the nights was hard</p>
                  <p>Trying to make something from a broken start</p>
                  <p>They did not see the tears or the weight I carry</p>
                  <p>Just the road ahead and the hope I buried</p>
                  <p className="pt-2">Now the phone keep ringing like it know my name</p>
                  <p>Website live and the yard feel different today</p>
                  <p>I am not there yet but I see my way</p>
                  <p>On the rise still praying I do not lose my way</p>
                </div>
              </div>

              {/* Verse 2 */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Verse 2
                </h3>
                <div className="space-y-2 text-lg leading-relaxed">
                  <p>First trailer felt like a miracle</p>
                  <p>Steel frame hope in a tangible</p>
                  <p>Every contract signed felt fragile</p>
                  <p>One mistake could collapse the angle</p>
                  <p className="pt-2">Light bill trauma still in my chest</p>
                  <p>Every payment due feel like a test</p>
                  <p>If it sit still then the clock run fast</p>
                  <p>Every slow week bring the past back</p>
                  <p className="pt-2">I remember days we could not afford</p>
                  <p>Little things people take for normal chores</p>
                  <p>Now I am here trying to build some more</p>
                  <p>Trying to break cycles not just score</p>
                </div>
              </div>

              {/* Hook 2 */}
              <div className="bg-primary/5 rounded-xl p-6 md:p-8 border-l-4 border-primary">
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Hook
                </h3>
                <div className="space-y-2 text-lg leading-relaxed font-medium">
                  <p>From the bottom where the nights was hard</p>
                  <p>Trying to make something from a broken start</p>
                  <p>They did not see the tears or the weight I carry</p>
                  <p>Just the road ahead and the hope I buried</p>
                  <p className="pt-2">Now the phone keep ringing like it know my name</p>
                  <p>Website live and the yard feel different today</p>
                  <p>I am not there yet but I see my way</p>
                  <p>On the rise still praying I do not lose my way</p>
                </div>
              </div>

              {/* Verse 3 */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Verse 3
                </h3>
                <div className="space-y-2 text-lg leading-relaxed">
                  <p>They say business cold no emotion allowed</p>
                  <p>But every decision tied to people now</p>
                  <p>Family counting on me to stand tall</p>
                  <p>If I fall then it hit us all</p>
                  <p className="pt-2">I am learning the world do not slow</p>
                  <p>When the pressure rise you either bend or grow</p>
                  <p>I talk to God in the quiet yard</p>
                  <p>Asking is this strength or is this scar</p>
                  <p className="pt-2">I do not want success if it cost my soul</p>
                  <p>She taught me kindness before control</p>
                  <p>If I win I want the world to know</p>
                  <p>It came from love not cutting throats</p>
                </div>
              </div>

              {/* Bridge */}
              <div className="bg-muted/50 rounded-xl p-6 md:p-8 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Bridge
                </h3>
                <div className="space-y-2 text-lg leading-relaxed italic">
                  <p>Sometimes I miss being just a kid</p>
                  <p>No weight on my back no future bid</p>
                  <p>But then I hear her voice in my head</p>
                  <p>Be patient son just take the steps</p>
                  <p className="pt-2">If you fall get up keep your heart clean</p>
                  <p>Be nice even when they mean</p>
                  <p>Perseverance through the unseen</p>
                  <p>That is how you change everything</p>
                </div>
              </div>

              {/* Final Hook */}
              <div className="bg-primary/5 rounded-xl p-6 md:p-8 border-l-4 border-primary">
                <h3 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wide">
                  Final Hook
                </h3>
                <div className="space-y-2 text-lg leading-relaxed font-medium">
                  <p>From the bottom where the nights was hard</p>
                  <p>Trying to make something from a broken start</p>
                  <p>Now the doors opening piece by piece</p>
                  <p>Still working still losing sleep</p>
                  <p className="pt-2">The phone keep ringing I answer every call</p>
                  <p>Every yes feel like breaking a wall</p>
                  <p>I am on the rise from the very ground</p>
                  <p>Still humble still holding it down</p>
                </div>
              </div>

              {/* Outro */}
              <div className="bg-brand-navy text-white rounded-xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-primary-foreground mb-4 uppercase tracking-wide">
                  Outro
                </h3>
                <div className="space-y-2 text-lg leading-relaxed">
                  <p>This for the kids who grew up like me</p>
                  <p>Watching struggle shape what they see</p>
                  <p>If you got a vision hold it tight</p>
                  <p>Even small wins can change your life</p>
                  <p className="pt-2">Mom this my way of giving back</p>
                  <p>More than money more than plaques</p>
                  <p>This a brand this a stand this a vow</p>
                  <p>I am rising and I am here now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default CrumsStory;