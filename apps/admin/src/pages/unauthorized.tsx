import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="text-zinc-400 mb-6">You do not have permission to access this page.</p>
      <Link to="/admin/login" className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 font-semibold text-sm">
        Return to Login
      </Link>
    </div>
  );
}
