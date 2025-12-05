import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, FileText, ArrowRight } from "lucide-react";

export const CarrierResourcesSection = () => {
  return (
    <section className="py-20 bg-background content-deferred">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Carrier Resources
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tools, guides, and resources to help you succeed on the road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                <Calculator className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Financial Tools</h3>
              <p className="text-muted-foreground mb-6">
                Calculate costs, compare lease vs buy options, and estimate your profit per load with our free calculators.
              </p>
              <Link to="/resources/tools">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Explore Financial Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all">
                <BookOpen className="h-8 w-8 text-secondary group-hover:text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Industry Guides</h3>
              <p className="text-muted-foreground mb-6">
                Expert advice on trailer selection, maintenance tips, and best practices for carrier success.
              </p>
              <Link to="/resources/guides">
                <Button variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  Read Industry Guides
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:scale-110 transition-all">
                <FileText className="h-8 w-8 text-accent group-hover:text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                More resources including documentation templates, compliance guides, and business forms.
              </p>
              <Button variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
