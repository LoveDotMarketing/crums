import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, Search, Loader2, RotateCcw, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ArchivedTrailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string | null;
  year: number | null;
  vin: string | null;
  license_plate: string | null;
  updated_at: string;
}

export default function AdminArchivedTrailers() {
  const navigate = useNavigate();
  const [trailers, setTrailers] = useState<ArchivedTrailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTrailerId, setDeleteTrailerId] = useState<string | null>(null);
  const [deleteTrailerNumber, setDeleteTrailerNumber] = useState("");

  useEffect(() => {
    fetchArchivedTrailers();
  }, []);

  const fetchArchivedTrailers = async () => {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, type, make, year, vin, license_plate, updated_at")
        .eq("status", "archived")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setTrailers(data || []);
    } catch (error) {
      console.error("Error fetching archived trailers:", error);
      toast.error("Failed to load archived trailers");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, trailerNumber: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Trailer ${trailerNumber} restored`);
      fetchArchivedTrailers();
    } catch (error) {
      console.error("Error restoring trailer:", error);
      toast.error("Failed to restore trailer");
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTrailerId) return;
    try {
      const { error } = await supabase
        .from("trailers")
        .delete()
        .eq("id", deleteTrailerId);

      if (error) throw error;
      toast.success(`Trailer ${deleteTrailerNumber} permanently deleted`);
      setDeleteTrailerId(null);
      fetchArchivedTrailers();
    } catch (error) {
      console.error("Error deleting trailer:", error);
      toast.error("Failed to delete trailer");
    }
  };

  const filtered = trailers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.trailer_number.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.vin?.toLowerCase().includes(q) ||
      t.make?.toLowerCase().includes(q)
    );
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-4 ml-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/admin/fleet")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Fleet
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Archived Trailers</h1>
              <Badge variant="secondary">{trailers.length}</Badge>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archived trailers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Archived Fleet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No archived trailers found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trailer #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Archived</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((trailer) => (
                        <TableRow key={trailer.id}>
                          <TableCell className="font-medium">{trailer.trailer_number}</TableCell>
                          <TableCell>{trailer.type}</TableCell>
                          <TableCell>{trailer.year || "—"}</TableCell>
                          <TableCell>{trailer.make || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">{trailer.vin || "—"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(trailer.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(trailer.id, trailer.trailer_number)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => {
                                  setDeleteTrailerId(trailer.id);
                                  setDeleteTrailerNumber(trailer.trailer_number);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <AlertDialog open={!!deleteTrailerId} onOpenChange={(open) => !open && setDeleteTrailerId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Permanently Delete Trailer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete trailer {deleteTrailerNumber}? This action cannot be undone and all associated data will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePermanentDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Permanently Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
