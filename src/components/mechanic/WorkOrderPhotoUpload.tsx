import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkOrderPhotoUploadProps {
  workOrderId: string;
  category: string;
  label: string;
  existingPhotos?: { id: string; photo_url: string }[];
  onPhotoUploaded: (url: string) => void;
  onPhotoDeleted?: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}

async function compressImage(file: File): Promise<File> {
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

      if (width <= MAX && height <= MAX) {
        resolve(file);
        return;
      }

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
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export function WorkOrderPhotoUpload({
  workOrderId,
  category,
  label,
  existingPhotos = [],
  onPhotoUploaded,
  onPhotoDeleted,
  readOnly = false,
  className,
}: WorkOrderPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fileExt = compressed.name.split(".").pop() || "jpg";
      const fileName = `${workOrderId}/${category}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("work-order-photos")
        .upload(fileName, compressed);

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        e.target.value = "";
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("work-order-photos")
        .getPublicUrl(fileName);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("work_order_photos")
        .insert({
          work_order_id: workOrderId,
          category,
          photo_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) {
        toast.error(`Failed to save photo record: ${dbError.message}`);
      } else {
        onPhotoUploaded(publicUrl);
        toast.success("Photo uploaded");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo");
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    try {
      const urlParts = photoUrl.split("/work-order-photos/");
      if (urlParts.length > 1) {
        await supabase.storage.from("work-order-photos").remove([urlParts[1]]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("work_order_photos").delete().eq("id", photoId);
      onPhotoDeleted?.(photoId);
      toast.success("Photo deleted");
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const hasPhotos = existingPhotos.length > 0;
  const inputId = `wo-photo-${workOrderId}-${category}`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "p-3 rounded-lg border-2 transition-colors",
        hasPhotos ? "border-primary/50 bg-primary/5" : "border-muted"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          {hasPhotos && (
            <span className="text-xs text-primary font-medium">{existingPhotos.length} photo(s) ✓</span>
          )}
        </div>

        {existingPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={`${label} photo`}
                  className="w-20 h-20 object-cover rounded-md border"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id, photo.photo_url)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!readOnly && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={inputId}
              disabled={uploading}
            />
            <label htmlFor={inputId}>
              <Button
                type="button"
                variant={hasPhotos ? "outline" : "secondary"}
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
                  {uploading ? "Uploading..." : hasPhotos ? "Add Another" : "Take Photo or Choose"}
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
