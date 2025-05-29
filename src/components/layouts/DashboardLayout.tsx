import { AppProvider } from "@/providers/AppProvider";
import { Outlet, useLocation } from "react-router-dom";

import { AppFooter } from "@/components/layouts/AppFooter";
import { AppHeader } from "@/components/layouts/AppHeader";
import { AppSidebar } from "@/components/layouts/AppSidebar";

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="relative flex-1">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
