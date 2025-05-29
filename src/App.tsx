import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import ATMDetail from "./pages/ATMDetail";
import AddATM from "./pages/AddATM";
import Alerts from "./pages/Alerts";
import EditATM from "./pages/EditATM";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/PageAnalytics";
import Dashboard from "./pages/PageDashboard";
import Settings from "./pages/Settings";
import PageAtms from "./pages/atms/PageAtms";
import Login from "./pages/auth/Login";
import { AppProvider } from "./providers/AppProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/atms" element={<PageAtms />} />
              <Route path="/atm/add" element={<AddATM />} />
              <Route path="/atm/:atmId" element={<ATMDetail />} />
              <Route path="/atm/:atmId/edit" element={<EditATM />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
