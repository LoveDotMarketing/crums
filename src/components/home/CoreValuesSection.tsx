import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, CheckCircle, Shield, Users, TrendingUp } from "lucide-react";

export const CoreValuesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted to-background content-deferred">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Core Values
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            At CRUMS Leasing, we see a future where every carrier has the freedom, tools, and
            support to build a life they're proud of both on and off the road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Family First */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/10 to-background">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Family First</h3>
              <p className="text-muted-foreground leading-relaxed">
                We treat every team member and customer like family — with respect, compassion,
                and understanding. We know that when we support each other, everyone makes it home
                safe.
              </p>
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
              <p className="text-muted-foreground leading-relaxed">
                We honor the spirit of "CRUMS" by showing up every day with pride, effort, and a
                willingness to go the extra mile for our customers and our team.
              </p>
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
              <p className="text-muted-foreground leading-relaxed">
                We stand behind every trailer, every promise, and every handshake. Dependability
                isn't just what we deliver — it's who we are.
              </p>
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
              <p className="text-muted-foreground leading-relaxed">
                We do what's right, even when no one's watching. Honesty and accountability guide
                every decision we make.
              </p>
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
              <p className="text-muted-foreground leading-relaxed">
                We work hard, but we never lose sight of what matters most. Every decision is
                guided by respect, empathy, and genuine commitment to our customers and team.
              </p>
            </CardContent>
          </Card>

          {/* Keep Moving Forward */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-background">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Keep Moving Forward
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We grow, learn, and adapt together. Every challenge is an opportunity to improve
                ourselves and the company we believe in.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground italic max-w-4xl mx-auto">
            Follow the <span className="text-secondary font-semibold">CRUMS</span> home — to a
            future built on trust, family, and opportunity.
          </p>
        </div>
      </div>
    </section>
  );
};
