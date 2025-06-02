import { ATMStatus } from "@/features/atms/schema";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: ATMStatus;
  className?: string;
  showAnimation?: boolean;
  isRecentlyUpdated?: boolean;
}

export function StatusBadge({ status, className, showAnimation = true, isRecentlyUpdated = false }: StatusBadgeProps) {
  const getStatusVariant = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "active";
      case "inactive":
        return "resolved";
      case "warning":
        return "warning";
      case "error":
        return "critical";
      default:
        return "info";
    }
  };

  const getStatusLabel = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "warning":
        return "Warning";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getIndicatorColor = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Badge variant={getStatusVariant(status)} className={cn("flex items-center gap-1", isRecentlyUpdated && "ring-2 ring-blue-300 ring-opacity-50")}>
        <span className="relative flex h-2 w-2">
          {showAnimation && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                getIndicatorColor(status),
                isRecentlyUpdated && "animate-pulse"
              )}
            ></span>
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", getIndicatorColor(status))}></span>
        </span>
        {getStatusLabel(status)}
        {isRecentlyUpdated && <span className="ml-1 text-blue-600">•</span>}
      </Badge>
    </div>
  );
}
