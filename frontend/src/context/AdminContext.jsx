import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("speak_admin_token");
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/admin/me");
      setAdmin(data);
    } catch {
      localStorage.removeItem("speak_admin_token");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = (token, adminData) => {
    localStorage.setItem("speak_admin_token", token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem("speak_admin_token");
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, setSession, logout, refresh }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
