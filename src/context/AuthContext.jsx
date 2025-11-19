import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authenticateUser,
  registerUser,
  refreshSyncCode,
  STORAGE_KEY as AUTH_STORAGE_KEY,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    const result = await authenticateUser({ email, password });
    setLoading(false);
    if (result.ok) {
      setUser(result.profile);
    } else {
      setError(result.error);
    }
    return result;
  };

  const register = async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    const result = await registerUser({ name, email, password });
    setLoading(false);
    if (result.ok) {
      setUser(result.profile);
    } else {
      setError(result.error);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const regenerateSyncCode = async () => {
    if (!user) return;
    const profile = await refreshSyncCode(user.token);
    setUser(profile);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refreshSyncCode: regenerateSyncCode, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
