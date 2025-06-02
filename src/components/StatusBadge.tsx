import { ATMStatus } from "@/features/atms/schema";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ATMStatus;
  className?: string;
  showAnimation?: boolean;
  isRecentlyUpdated?: boolean;
}

export function StatusBadge({ status, className, showAnimation = true, isRecentlyUpdated = false }: StatusBadgeProps) {
  const getStatusClass = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "decommissioned":
        return "bg-red-100 text-red-800 border-red-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "maintenance":
        return "Maintenance";
      case "decommissioned":
        return "Decommissioned";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const getIndicatorColor = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "decommissioned":
        return "bg-red-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        getStatusClass(status),
        isRecentlyUpdated && "ring-2 ring-blue-300 ring-opacity-50",
        className
      )}
    >
      <span className="relative mr-1 flex h-2 w-2">
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
    </div>
  );
}
