
import { cn } from "@/lib/utils";
import { ATMStatus } from "@/features/atms/schema";

interface StatusBadgeProps {
  status: ATMStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClass = (status: ATMStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "decommissioned":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getStatusClass(status),
        className
      )}
    >
      <span className="relative flex h-2 w-2 mr-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
      </span>
      {getStatusLabel(status)}
    </div>
  );
}
