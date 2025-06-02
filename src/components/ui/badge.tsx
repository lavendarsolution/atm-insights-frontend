import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-900 hover:bg-green-100",
        danger: "border-transparent bg-red-100 text-red-900 hover:bg-red-100",
        // New color variants for severity and status
        critical: "border-transparent bg-red-600 text-white hover:bg-red-700",
        high: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
        medium: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        low: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        // Status variants
        active: "border-transparent bg-green-500 text-white hover:bg-green-600",
        acknowledged: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
        resolved: "border-transparent bg-gray-800 text-white hover:bg-gray-900",
        warning: "border-transparent bg-amber-400 text-white hover:bg-amber-500",
        info: "border-transparent bg-cyan-500 text-white hover:bg-cyan-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
