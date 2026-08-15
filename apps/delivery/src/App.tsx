import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import OrderDetail from "./pages/OrderDetail";
import Earnings from "./pages/Earnings";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import History from "./pages/History";
import RoutePlanner from "./pages/RoutePlanner";
import KitchenHandover from "./pages/KitchenHandover";
import Layout from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/partner">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="deliveries/:id" element={<OrderDetail />} />
            <Route path="history" element={<History />} />
            <Route path="route" element={<RoutePlanner />} />
            <Route path="kitchen-handover" element={<KitchenHandover />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
