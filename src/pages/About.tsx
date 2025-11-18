import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, TrendingUp, MapPin, Award, ArrowRight } from "lucide-react";
import teamImage from "@/assets/team-leaders.png";
import fleetImage from "@/assets/fleet-overview.jpg";
import ourStoryImage from "@/assets/our-story-image.png";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Crums Leasing</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            A family-rooted legacy built on trust, integrity, and a genuine commitment to the success
            of every trucker we serve.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Crums Leasing was built on a foundation of family values and an unwavering
                  commitment to the trucking industry. What started as a vision to provide reliable,
                  high-quality trailer solutions has grown into a nationwide enterprise serving
                  thousands of customers.
                </p>
                <p>
                  The Crums name represents more than just equipment leasing — it stands for hard
                  work, dedication, and the belief that every trucker deserves the tools and support
                  to build a life they're proud of, both on and off the road.
                </p>
                <p>
                  Through strategic acquisitions and organic growth, we've expanded our reach while
                  staying true to our core values. Every decision we make is guided by the same
                  principles that founded our company: integrity, quality, and putting people first.
                </p>
              </div>
            </div>
            <div>
              <img
                src={ourStoryImage}
                alt="Crums Leasing leadership team"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Philosophy */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Leadership Philosophy
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our leadership team believes in servant leadership — putting our team members and
              customers first, leading by example, and making decisions that create long-term value
              for everyone involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">People-First Approach</h3>
                <p className="text-muted-foreground">
                  Every decision considers the impact on our team members, customers, and their
                  families.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Excellence as Standard</h3>
                <p className="text-muted-foreground">
                  We don't settle for good enough — we strive for excellence in every aspect of our
                  business.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Sustainable Growth</h3>
                <p className="text-muted-foreground">
                  We grow responsibly, ensuring quality and service never suffer in pursuit of
                  expansion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Growth Through Acquisitions */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={fleetImage}
                alt="Crums Leasing fleet operations"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Strategic Growth
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  As we've grown, we've carefully selected acquisition partners that share our
                  values and commitment to customer service. Each company we bring into the Crums
                  family adds unique strengths while maintaining the integrity and quality our
                  customers expect.
                </p>
                <p>
                  Our multi-company structure allows us to serve diverse markets while providing
                  unified backend support, advanced technology, and the personal touch that defines
                  the Crums experience.
                </p>
                <p>
                  Whether you're working with an acquired company or our flagship operation, you can
                  expect the same family values, transparency, and dedication to your success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Crums Leasing By The Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">15+</div>
              <div className="text-xl text-primary-foreground/80">Years of Service</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">5,000+</div>
              <div className="text-xl text-primary-foreground/80">Trailers in Fleet</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">25+</div>
              <div className="text-xl text-primary-foreground/80">Locations Nationwide</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">99%</div>
              <div className="text-xl text-primary-foreground/80">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Ready to Join the Crums Family?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the difference that family values, integrity, and dedication make in your
            trailer leasing partnership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Get A Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/mission">
              <Button size="lg" variant="outline">
                Our Mission & Values
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
