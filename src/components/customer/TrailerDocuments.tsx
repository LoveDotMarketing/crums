import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Camera, Calendar } from "lucide-react";

interface TrailerDocumentsProps {
  trailerId: string;
  titleDocumentUrl?: string | null;
}

interface InspectionPhoto {
  id: string;
  photo_url: string;
  category: string;
}

interface InspectionData {
  id: string;
  inspection_date: string;
  status: string;
  photos: InspectionPhoto[];
}

export function TrailerDocuments({ trailerId, titleDocumentUrl }: TrailerDocumentsProps) {
  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestInspection();
  }, [trailerId]);

  const fetchLatestInspection = async () => {
    try {
      const { data: inspData } = await supabase
        .from("dot_inspections")
        .select("id, inspection_date, status")
        .eq("trailer_id", trailerId)
        .eq("status", "completed")
        .order("inspection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!inspData) return;

      const { data: photos } = await supabase
        .from("dot_inspection_photos")
        .select("id, photo_url, category")
        .eq("inspection_id", inspData.id)
        .order("uploaded_at", { ascending: true });

      setInspection({
        ...inspData,
        photos: photos || [],
      });
    } catch (error) {
      console.error("Error fetching inspection:", error);
    }
  };

  const hasTitle = !!titleDocumentUrl;
  const hasInspection = inspection && inspection.photos.length > 0;

  if (!hasTitle && !hasInspection) return null;

  return (
    <>
      <div className="mt-3 pt-3 border-t space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Documents
        </p>

        {hasTitle && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Vehicle Title</p>
            <img
              src={titleDocumentUrl!}
              alt="Vehicle title"
              className="h-20 w-auto rounded border object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage(titleDocumentUrl!)}
            />
          </div>
        )}

        {hasInspection && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">DOT Inspection</p>
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                <Calendar className="h-2.5 w-2.5 mr-0.5" />
                {new Date(inspection!.inspection_date).toLocaleDateString()}
              </Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {inspection!.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photo_url}
                  alt={photo.category}
                  className="h-16 w-16 rounded border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(photo.photo_url)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Document full view"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
