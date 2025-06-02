"use client";

import { useApp } from "@/providers/AppProvider";
import clsx from "clsx";
import { BanknoteArrowDownIcon, BarChart3, BellIcon, ChevronLeft, ChevronRight, LayoutDashboard, MonitorCheckIcon, UserIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

import { IconButton } from "@/components/ui/icon-button";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/atms", label: "ATM Registry", icon: MonitorCheckIcon },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/alerts", label: "Alerts", icon: BellIcon },
  { path: "/profile", label: "Profile", icon: UserIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const [{ sidebarOpen }, { setSidebarOpen }] = useApp();

  return (
    <div
      className={clsx("absolute z-50 flex h-full w-64 flex-col border-r border-[#003A2F] bg-[#004036] transition-all duration-300 md:relative md:left-0", {
        "md:w-[65px]": !sidebarOpen,
        "md:w-64": sidebarOpen,
        "-left-64": !sidebarOpen,
        "left-0": sidebarOpen,
      })}
    >
      <div className={cn("flex justify-center px-3", { "py-3": sidebarOpen, "py-6": !sidebarOpen })}>
        {!sidebarOpen ? (
          <BanknoteArrowDownIcon className="h-6 w-6 text-[#E5F2F1]" />
        ) : (
          <div className="w-3/4">
            <img src="/assets/logo-white-v.png" />
          </div>
        )}
      </div>
      <div
        className={clsx("px-4 py-3 text-sm font-medium text-[#A9CEC8]", {
          hidden: !sidebarOpen,
        })}
      >
        NAVIGATION
      </div>
      <div className="flex-1 px-3">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 font-medium text-[#E5F2F1] transition-all hover:bg-[#005A4B] hover:text-white",
                location.pathname.startsWith(item.path) ? "bg-[#005A4B] text-white" : "bg-transparent",
                !sidebarOpen && "justify-center px-2"
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
      </div>
      <IconButton
        variant="ghost"
        size="md"
        className="absolute -right-4 top-12 z-10 hidden rounded-full border border-[#003A2F] bg-[#004036] text-[#A9CEC8] hover:bg-[#005A4B] hover:text-white md:flex"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {!sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
