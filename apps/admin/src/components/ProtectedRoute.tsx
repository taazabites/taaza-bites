import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { canAccessPath } from "../lib/route-access";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === "Suspended") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function RoleOutlet() {
  const { user } = useAuth();
  const path = typeof window !== "undefined" ? window.location.pathname.replace(/^\/admin/, "") || "/" : "/";

  if (user && !canAccessPath(user.role, path || "/")) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
