import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InspectionPhotoUploadProps {
  inspectionId: string;
  category: string;
  label: string;
  existingPhotos?: { id: string; photo_url: string }[];
  onPhotoUploaded: (url: string) => void;
  onPhotoDeleted?: (id: string) => void;
  required?: boolean;
  className?: string;
}

export function InspectionPhotoUpload({
  inspectionId,
  category,
  label,
  existingPhotos = [],
  onPhotoUploaded,
  onPhotoDeleted,
  required = false,
  className
}: InspectionPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${inspectionId}/${category}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("dot-inspection-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("dot-inspection-photos")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("dot_inspection_photos")
        .insert({
          inspection_id: inspectionId,
          category,
          photo_url: publicUrl
        });

      if (dbError) throw dbError;

      onPhotoUploaded(publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split("/dot-inspection-photos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("dot-inspection-photos").remove([filePath]);
      }

      // Delete from database
      await supabase.from("dot_inspection_photos").delete().eq("id", photoId);

      onPhotoDeleted?.(photoId);
      toast.success("Photo deleted");
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const hasPhotos = existingPhotos.length > 0;

  const showRequiredWarning = required && !hasPhotos;

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "p-3 rounded-lg border-2 transition-colors",
        showRequiredWarning ? "border-destructive bg-destructive/5" : hasPhotos ? "border-primary/50 bg-primary/5" : "border-muted"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </span>
          {hasPhotos ? (
            <span className="text-xs text-primary font-medium">{existingPhotos.length} photo(s) ✓</span>
          ) : required ? (
            <span className="text-xs text-destructive font-medium">Required</span>
          ) : null}
        </div>

        {/* Photo previews */}
        {existingPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={`${category} inspection`}
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id, photo.photo_url)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
      <div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id={`photo-${category}`}
          disabled={uploading}
        />
        <label htmlFor={`photo-${category}`}>
          <Button
            type="button"
            variant={showRequiredWarning ? "destructive" : hasPhotos ? "outline" : "secondary"}
            size="sm"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Uploading..." : showRequiredWarning ? "Take Required Photo" : hasPhotos ? "Add Another" : "Take Photo"}
            </span>
          </Button>
        </label>
      </div>
      </div>
    </div>
  );
}
