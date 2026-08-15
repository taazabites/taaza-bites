import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { canAccessPath } from "../lib/route-access";
import { canViewHealth } from "../lib/rbac";

export function RoleGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessPath(user.role, location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if ((location.pathname === "/customers/health" || location.pathname === "/health") && !canViewHealth(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
