import { ReactNode } from "react";

import { useApp } from "@/providers/AppProvider";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import LoadingOverlay from "./LoadingOverlay";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [{ user, isAuthenticating }] = useApp();
  const location = useLocation();

  if (isAuthenticating) {
    return <LoadingOverlay isLoading={isAuthenticating}></LoadingOverlay>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
