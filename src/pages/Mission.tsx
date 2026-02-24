import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, CheckCircle, Shield, Users, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Link } from "react-router-dom";
import { trackCtaClick } from "@/lib/analytics";

const Mission = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Mission", url: "https://crumsleasing.com/mission" }
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Our Mission & Values - People-First Trailer Leasing"
        description="Discover CRUMS Leasing's mission: empowering carriers with freedom and stability. Our core values include integrity, family-first approach, and quality you can count on."
        canonical="https://crumsleasing.com/mission"
        structuredData={breadcrumbSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Mission & Values</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Building a future where every carrier has the freedom, tools, and support to build a
            life they're proud of both on and off the road.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Mission Statement */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
              Our Mission
            </h2>
            <p className="text-xl text-center text-muted-foreground leading-relaxed mb-12">
              At CRUMS Leasing, we believe every hardworking carrier deserves the freedom and stability to build a better life for their family. Inspired by the values of hard work and dedication passed down from "CRUMS" herself, we are more than a leasing company we are a partner on the road to success. With high quality trailers, flexible solutions, and a people first approach, we make sure our customers always have the tools they need to keep moving forward and make it home safe.
            </p>
            <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg p-8 text-center border-l-4 border-secondary">
              <p className="text-2xl font-semibold text-foreground italic">
                "Follow the <span className="text-secondary">CRUMS</span> home — to a future built
                on trust, family, and opportunity."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Detailed */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Family First */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Family First</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We treat every team member and customer like family — with respect, compassion,
                  and understanding. We know that when we support each other, everyone makes it home
                  safe.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Treating everyone with dignity and care</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Supporting work-life balance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Building lasting relationships</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Hard Work & Dedication */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Hard Work & Dedication
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We honor the spirit of "CRUMS" by showing up every day with pride, effort, and a
                  willingness to go the extra mile for our customers and our team.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Commitment to excellence in everything we do</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Going above and beyond expectations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Taking pride in our work and reputation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Quality You Can Count On */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Quality You Can Count On
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We stand behind every trailer, every promise, and every handshake. Dependability
                  isn't just what we deliver — it's who we are.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Maintaining premium equipment standards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Delivering on our commitments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Ensuring customer satisfaction</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Integrity in Every Mile */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Integrity in Every Mile
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do what's right, even when no one's watching. Honesty and accountability guide
                  every decision we make.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Transparent business practices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Ethical decision-making</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Taking responsibility for our actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Relationships Fuel Our Success */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Relationships Fuel Our Success
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We work hard, but we never lose sight of what matters most. Every decision is
                  guided by respect, empathy, and genuine commitment to our customers and team.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Building partnerships, not transactions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Listening to customer needs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Creating mutual success</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Keep Moving Forward */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/10 to-background">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                  <TrendingUp className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Keep Moving Forward
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We grow, learn, and adapt together. Every challenge is an opportunity to improve
                  ourselves and the company we believe in.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Continuous improvement mindset</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Embracing innovation and technology</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>Learning from challenges</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Our Vision</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              To be the most trusted and respected trailer leasing company in America, known for
              putting people first, delivering exceptional quality, and building lasting partnerships
              that help our customers succeed.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We envision a future where the CRUMS name is synonymous with integrity, reliability,
              and a genuine commitment to the success and well-being of every carrier and fleet
              operator we serve.
            </p>
          </div>
        </div>
      </section>

      {/* Discover CRUMS Leasing CTA */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Discover CRUMS Leasing
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Learn more about the{" "}
              <Link to="/about" onClick={() => trackCtaClick('CRUMS Leasing story', 'mission', '/about')} className="text-primary hover:underline font-semibold">
                CRUMS Leasing story and history
              </Link>{" "}
              and meet the team behind our commitment to carriers nationwide.
            </p>
            <p className="text-muted-foreground mb-6">
              Ready to experience these values firsthand? Explore our{" "}
              <Link to="/dry-van-trailer-leasing" onClick={() => trackCtaClick('trailer leasing services', 'mission', '/dry-van-trailer-leasing')} className="text-secondary hover:underline font-semibold">
                trailer leasing services
              </Link>{" "}
              or browse{" "}
              <Link to="/careers" onClick={() => trackCtaClick('career opportunities', 'mission', '/careers')} className="text-secondary hover:underline font-semibold">
                career opportunities at CRUMS
              </Link>{" "}
              if you share our passion for excellence.
            </p>
            <p className="text-muted-foreground">
              Have questions?{" "}
              <Link to="/contact" onClick={() => trackCtaClick('Contact our team', 'mission', '/contact')} className="text-primary hover:underline font-medium">
                Contact our team
              </Link>{" "}
              — we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mission;
