import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Gift, Users, DollarSign, ArrowRight, CheckCircle } from "lucide-react";

const ReferralProgram = () => {
  const steps = [
    {
      icon: Users,
      title: "Sign Up",
      description: "Create your free CRUMS account and get your unique referral code instantly."
    },
    {
      icon: Gift,
      title: "Share Your Code",
      description: "Share your referral code with fellow truckers and fleet operators."
    },
    {
      icon: DollarSign,
      title: "Earn $250",
      description: "Get $250 off your trailer lease for each referral who signs a lease."
    }
  ];

  const benefits = [
    "No limit on referrals - earn unlimited rewards",
    "Credit applied directly to your lease payments",
    "Track your referrals in your customer dashboard",
    "Simple sharing via text, email, or social media",
    "Referral codes never expire"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Referral Program - Earn $250 Per Referral"
        description="Join the CRUMS Leasing referral program. Earn $250 off your trailer lease for every referral who signs a lease. Unlimited rewards, no expiration."
        canonical="https://crumsleasing.com/referral-program"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full mb-6">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">Referral Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Earn $250 For Every Referral
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join the CRUMS family and help fellow truckers find quality trailer leasing. 
              For every referral who signs a lease, you'll receive $250 off your next payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Get Your Referral Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/get-started">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  New to CRUMS? Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Earning referral rewards is simple. Follow these three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <Card key={step.title} className="relative border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Why Join Our Referral Program?
              </h2>
              <p className="text-muted-foreground mb-8">
                At CRUMS Leasing, we believe in rewarding loyalty. Our referral program is 
                designed to thank you for spreading the word about quality trailer leasing.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">$250</div>
                <div className="text-xl mb-4">Per Successful Referral</div>
                <div className="border-t border-primary-foreground/20 pt-4 mt-4">
                  <p className="text-sm text-primary-foreground/80 mb-4">
                    Credit is applied once your referral signs a trailer lease agreement with CRUMS Leasing.
                  </p>
                  <Link to="/login">
                    <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full">
                      Start Earning Today
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-2">
                  How do I get my referral code?
                </h3>
                <p className="text-muted-foreground">
                  Sign up for a CRUMS Leasing account and your unique referral code will be 
                  automatically generated. You can find it in your customer dashboard.
                </p>
              </div>
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-2">
                  When do I receive my referral credit?
                </h3>
                <p className="text-muted-foreground">
                  Your $250 credit is applied after your referral signs a lease agreement 
                  and their first payment is processed. We'll notify you when the credit is applied.
                </p>
              </div>
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Is there a limit to how many people I can refer?
                </h3>
                <p className="text-muted-foreground">
                  No limits! Refer as many people as you like and earn $250 for each 
                  successful referral. The more you refer, the more you save.
                </p>
              </div>
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Do referral codes expire?
                </h3>
                <p className="text-muted-foreground">
                  No, your referral code never expires. Share it whenever you want, and 
                  you'll always receive credit when someone signs up using your code.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Can I combine referral credits?
                </h3>
                <p className="text-muted-foreground">
                  Yes! All your referral credits accumulate and can be applied to your 
                  future lease payments until they're fully used.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied CRUMS customers who are earning rewards 
            by sharing the trailer leasing solution they trust.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Your Referral Code Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReferralProgram;