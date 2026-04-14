import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, ExternalLink } from "lucide-react";

const games = [
  {
    id: "yard-run",
    title: "Trailer Yard Run",
    description:
      "Navigate the busy trailer yard, dodge obstacles, and park your rig before time runs out. Test your skills in this fast-paced trucking challenge!",
    url: "/games/yard-run.html",
    featured: true,
  },
];

const TruckingGames = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Trucking Games | CRUMS Leasing"
        description="Play free trucking games from CRUMS Leasing. Test your skills with our Trailer Yard Run game and more coming soon."
        canonical="https://crumsleasing.com/crums-trucking-games"
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="h-10 w-10 text-secondary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              CRUMS Trucking Games
            </h1>
          </div>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Take a break from the road and test your trucking skills with our free browser games.
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <section className="flex-1 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${
                  game.featured ? "ring-2 ring-secondary" : ""
                }`}
              >
                <div className="relative">
                  <a href={game.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src="/images/crums-yard-run-game-cover.webp"
                      alt={game.title}
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                  {game.featured && (
                    <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(game.url, "_blank")}
                  >
                    Play Now <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Coming Soon placeholder */}
            <Card className="flex flex-col items-center justify-center border-dashed opacity-60 min-h-[320px]">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">More Games Coming Soon</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TruckingGames;
