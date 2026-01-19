import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface InspectionChecklistProps {
  title: string;
  items: ChecklistItem[];
  comments: string;
  onItemChange: (id: string, checked: boolean) => void;
  onCommentsChange: (comments: string) => void;
  className?: string;
}

export function InspectionChecklist({
  title,
  items,
  comments,
  onItemChange,
  onCommentsChange,
  className
}: InspectionChecklistProps) {
  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked);

  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-card", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          {allChecked ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Complete</span>
          ) : someChecked ? (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Not Started</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) => onItemChange(item.id, checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor={item.id}
              className={cn(
                "text-sm cursor-pointer leading-relaxed",
                item.checked && "text-muted-foreground line-through"
              )}
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Label htmlFor={`${title}-comments`} className="text-sm text-muted-foreground">
          Comments / Notes (Optional)
        </Label>
        <Textarea
          id={`${title}-comments`}
          placeholder="Add any notes or observations..."
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );
}
