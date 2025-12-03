import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Redirect {
  id: string;
  source_path: string;
  target_path: string;
  is_active: boolean;
  hit_count: number;
  created_at: string;
}

interface RedirectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceUrl?: string;
  redirect?: Redirect | null;
  onSuccess?: () => void;
}

const COMMON_PAGES = [
  { value: "/", label: "Home" },
  { value: "/contact", label: "Contact" },
  { value: "/services/trailer-leasing", label: "Trailer Leasing" },
  { value: "/services/trailer-rentals", label: "Trailer Rentals" },
  { value: "/services/fleet-solutions", label: "Fleet Solutions" },
  { value: "/locations", label: "Locations" },
  { value: "/about", label: "About" },
  { value: "/mission", label: "Mission" },
  { value: "/get-started", label: "Get Started" },
  { value: "/careers", label: "Careers" },
];

export function RedirectFormDialog({
  open,
  onOpenChange,
  sourceUrl = "",
  redirect = null,
  onSuccess,
}: RedirectFormDialogProps) {
  const [sourcePath, setSourcePath] = useState(sourceUrl);
  const [targetPath, setTargetPath] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (redirect) {
        setSourcePath(redirect.source_path);
        const isCommonPage = COMMON_PAGES.some(p => p.value === redirect.target_path);
        if (isCommonPage) {
          setTargetPath(redirect.target_path);
          setCustomTarget("");
        } else {
          setTargetPath("custom");
          setCustomTarget(redirect.target_path);
        }
        setIsActive(redirect.is_active);
      } else {
        setSourcePath(sourceUrl);
        setTargetPath("");
        setCustomTarget("");
        setIsActive(true);
      }
    }
  }, [open, sourceUrl, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTargetPath = targetPath === "custom" ? customTarget : targetPath;
    
    if (!sourcePath || !finalTargetPath) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (sourcePath === finalTargetPath) {
      toast({ title: "Source and target cannot be the same", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (redirect) {
        const { error } = await supabase
          .from("redirects")
          .update({
            source_path: sourcePath,
            target_path: finalTargetPath,
            is_active: isActive,
          })
          .eq("id", redirect.id);

        if (error) throw error;
        toast({ title: "Redirect updated successfully" });
      } else {
        const { error } = await supabase
          .from("redirects")
          .insert({
            source_path: sourcePath,
            target_path: finalTargetPath,
            is_active: isActive,
          });

        if (error) {
          if (error.code === "23505") {
            toast({ title: "A redirect for this URL already exists", variant: "destructive" });
            return;
          }
          throw error;
        }
        toast({ title: "Redirect created successfully" });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving redirect:", error);
      toast({ title: "Failed to save redirect", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{redirect ? "Edit Redirect" : "Add Redirect"}</DialogTitle>
            <DialogDescription>
              {redirect 
                ? "Update the redirect configuration"
                : "Create a redirect to automatically send visitors from a broken URL to a working page"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="source">Source URL (broken path)</Label>
              <Input
                id="source"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="/old-broken-page"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">Target Page</Label>
              <Select value={targetPath} onValueChange={setTargetPath}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PAGES.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label} ({page.value})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom URL...</SelectItem>
                </SelectContent>
              </Select>
              {targetPath === "custom" && (
                <Input
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="/custom-path"
                  className="mt-2"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : redirect ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
