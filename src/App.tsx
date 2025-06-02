import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Notifier } from "@/components/ui/notifier";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "./components/ProtectedRoute";
import { ConfirmProvider } from "./components/confirm";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/PageAnalytics";
import Dashboard from "./pages/PageDashboard";
import Profile from "./pages/Profile";
import PageAtmDetail from "./pages/atms/PageAtmDetail";
import PageAtms from "./pages/atms/PageAtms";
import Login from "./pages/auth/Login";
import { AppProvider } from "./providers/AppProvider";
import { RealtimeDashboardProvider } from "./providers/RealtimeDashboardProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Wrapper component for dashboard pages that need real-time data
const DashboardWithRealtime = ({ children }: { children: React.ReactNode }) => <RealtimeDashboardProvider>{children}</RealtimeDashboardProvider>;

const App = () => (
  <ConfirmProvider>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Notifier />
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
                {/* Dashboard route with real-time provider */}
                <Route
                  path="/dashboard"
                  element={
                    <DashboardWithRealtime>
                      <Dashboard />
                    </DashboardWithRealtime>
                  }
                />

                {/* ATM routes - PageAtms now has its own real-time provider */}
                <Route path="/atms" element={<PageAtms />} />
                <Route path="/atm/:atmId" element={<PageAtmDetail />} />

                {/* Other routes */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ConfirmProvider>
);

export default App;
