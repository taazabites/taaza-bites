import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

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
    return <Navigate to="/admin/login" replace />;
  }

  if (user.status === 'Suspended') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
