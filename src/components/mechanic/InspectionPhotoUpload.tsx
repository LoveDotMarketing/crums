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

/**
 * Compress an image file if it exceeds 2000px on its longest side.
 * Returns a JPEG blob wrapped as a File, capped at 80% quality.
 */
async function compressImage(file: File): Promise<File> {
  // Skip non-image or SVG files
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const MAX = 2000;
      let { width, height } = img;

      // If already small enough, return original
      if (width <= MAX && height <= MAX) {
        resolve(file);
        return;
      }

      // Scale down
      if (width > height) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      } else {
        width = Math.round((width * MAX) / height);
        height = MAX;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };

    img.src = url;
  });
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
      // Compress before upload to prevent memory crashes on mobile
      const compressed = await compressImage(file);

      const fileExt = compressed.name.split(".").pop() || "jpg";
      const fileName = `${inspectionId}/${category}/${Date.now()}.${fileExt}`;

      // Retry logic: attempt up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { error: uploadError } = await supabase.storage
            .from("dot-inspection-photos")
            .upload(fileName, compressed);

          if (uploadError) {
            console.error(`Storage upload error (attempt ${attempt}):`, uploadError);
            if (attempt === 3) {
              toast.error(`Storage upload failed: ${uploadError.message}`);
              break;
            }
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("dot-inspection-photos")
            .getPublicUrl(fileName);

          const { error: dbError } = await supabase
            .from("dot_inspection_photos")
            .insert({
              inspection_id: inspectionId,
              category,
              photo_url: publicUrl
            });

          if (dbError) {
            console.error("Database insert error:", dbError);
            toast.error(`Failed to save photo record: ${dbError.message}`);
            break;
          }

          onPhotoUploaded(publicUrl);
          toast.success("Photo uploaded successfully");
          break;
        } catch (error: any) {
          console.error(`Photo upload error (attempt ${attempt}):`, error);
          if (attempt === 3) {
            toast.error(`Upload failed: ${error?.message || "Unknown error. Please check your connection and try again."}`);
          } else {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
    } catch (compressionError) {
      console.error("Image compression error:", compressionError);
      toast.error("Failed to process image. Please try a different photo.");
    }

    setUploading(false);
    e.target.value = "";
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
                  alt={`${label} inspection photo`}
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

        {/* Upload button — no capture attribute so OS shows camera + gallery picker */}
        <div>
          <input
            type="file"
            accept="image/*"
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
                {uploading ? "Uploading..." : showRequiredWarning ? "Take Required Photo" : hasPhotos ? "Add Another" : "Take Photo or Choose from Gallery"}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
