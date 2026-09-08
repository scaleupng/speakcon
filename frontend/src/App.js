import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { PublicLayout } from "@/components/PublicLayout";
import Home from "@/pages/Home";
import EventDetails from "@/pages/EventDetails";
import FAQ from "@/pages/FAQ";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Verify from "@/pages/Verify";
import Dashboard from "@/pages/Dashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Archive from "@/pages/Archive";
import Team from "@/pages/Team";

function ProtectedUser({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-[#07080B] text-[#E6B800]">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedAdmin({ children }) {
  const { admin, loading } = useAdmin();
  if (loading) return <div className="min-h-screen grid place-items-center bg-[#07080B] text-[#E6B800]">Loading…</div>;
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AdminProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/team" element={<Team />} />
                <Route path="/event-details" element={<EventDetails />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify/:token" element={<Verify />} />
                <Route path="/dashboard" element={<ProtectedUser><Dashboard /></ProtectedUser>} />
              </Route>
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
