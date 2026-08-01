import {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({children}: {children: ReactNode}) {
  const {currentUser, loading} = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" state={{from: location}} replace />;

  return <>{children}</>;
}
