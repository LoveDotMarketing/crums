import { useAuth } from "@/hooks/useAuth";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const { impersonatedUser, stopImpersonation, isImpersonating } = useAuth();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "mechanic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "customer":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 py-2 px-4 shadow-md backdrop-blur-sm" style={{ backgroundColor: 'hsla(45, 93%, 47%, 0.85)', color: 'hsl(20, 14%, 4%)' }}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <span className="font-medium">
            Viewing as:{" "}
            <span className="font-semibold">
              {impersonatedUser.displayName || impersonatedUser.email}
            </span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeColor(impersonatedUser.role)}`}>
            {impersonatedUser.role}
          </span>
        </div>
        <Button
          onClick={stopImpersonation}
          variant="outline"
          size="sm"
          className="bg-background hover:bg-muted text-foreground border-border"
        >
          <X className="h-4 w-4 mr-1" />
          Return to Admin Panel
        </Button>
      </div>
    </div>
  );
}