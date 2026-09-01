import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("speak_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/me");
      setUser(data);
    } catch {
      localStorage.removeItem("speak_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = (token, userData) => {
    localStorage.setItem("speak_token", token);
    setUser(userData);
  };

  const logout = async () => {
    try { await api.post("/logout"); } catch {}
    localStorage.removeItem("speak_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setSession, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
