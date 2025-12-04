import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Search, Radio, Phone, Calendar, Filter } from "lucide-react";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  status: string;
  year: number | null;
  make: string | null;
  model: string | null;
  is_rented: boolean | null;
}

const Trailers = () => {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTrailers();

    // Set up real-time subscription
    const channel = supabase
      .channel("public-trailers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trailers",
        },
        () => {
          fetchTrailers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrailers = async () => {
    const { data, error } = await supabase
      .from("trailers")
      .select("id, trailer_number, type, status, year, make, model, is_rented")
      .order("trailer_number", { ascending: true });

    if (!error && data) {
      setTrailers(data);
    }
    setLoading(false);
  };

  const filteredTrailers = trailers.filter((trailer) => {
    const matchesSearch = trailer.trailer_number
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || trailer.type === typeFilter;
    const isAvailable = trailer.status === "available" && !trailer.is_rented;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && isAvailable) ||
      (statusFilter === "rented" && !isAvailable);
    return matchesSearch && matchesType && matchesStatus;
  });

  const availableCount = trailers.filter(
    (t) => t.status === "available" && !t.is_rented
  ).length;
  const rentedCount = trailers.length - availableCount;
  const trailerTypes = [...new Set(trailers.map((t) => t.type))];

  const getStatusBadge = (trailer: Trailer) => {
    const isAvailable = trailer.status === "available" && !trailer.is_rented;
    if (isAvailable) {
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30">
          Available
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Currently Rented
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Trailer Inventory"
        description="Browse our live trailer inventory. View available 53-foot dry van trailers and flatbeds for lease or rent. Real-time availability updated instantly."
        canonical="https://crumsleasing.com/trailers"
      />
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full mb-6">
                <Radio className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Live Inventory</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our Trailer Fleet
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Browse our available trailers in real-time. When a trailer is
                leased, this directory updates automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Stats & Filters */}
        <section className="py-8 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{trailers.length}</span>
                  <span className="text-muted-foreground">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="font-semibold">{availableCount}</span>
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                  <span className="font-semibold">{rentedCount}</span>
                  <span className="text-muted-foreground">In Use</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by trailer #"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {trailerTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Trailer Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredTrailers.length === 0 ? (
              <div className="text-center py-20">
                <Truck className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No trailers found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTrailers.map((trailer) => {
                  const isAvailable =
                    trailer.status === "available" && !trailer.is_rented;
                  return (
                    <Card
                      key={trailer.id}
                      className={`overflow-hidden transition-all hover:shadow-lg ${
                        isAvailable
                          ? "border-green-500/30 hover:border-green-500/50"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`h-2 ${
                          isAvailable ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isAvailable
                                  ? "bg-green-500/10"
                                  : "bg-muted"
                              }`}
                            >
                              <Truck
                                className={`h-6 w-6 ${
                                  isAvailable
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">
                                #{trailer.trailer_number}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {trailer.type}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(trailer)}
                        </div>

                        <div className="space-y-2 mb-6">
                          {trailer.year && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Year:
                              </span>
                              <span className="text-foreground font-medium">
                                {trailer.year}
                              </span>
                            </div>
                          )}
                          {trailer.make && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground ml-6">
                                Make:
                              </span>
                              <span className="text-foreground font-medium">
                                {trailer.make}
                              </span>
                            </div>
                          )}
                        </div>

                        {isAvailable ? (
                          <Link to="/get-started">
                            <Button className="w-full bg-secondary hover:bg-secondary/90">
                              Reserve Now
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            Currently In Use
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Lease a Trailer?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Contact us today to discuss your needs. Our team is ready to help
              you find the perfect trailer solution.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/get-started">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Get Started
                </Button>
              </Link>
              <a href="tel:+18885704564">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  (888) 570-4564
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Trailers;
