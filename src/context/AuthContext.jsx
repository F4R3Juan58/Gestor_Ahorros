import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authenticateUser,
  registerUser,
  refreshSyncCode,
  STORAGE_KEY as AUTH_STORAGE_KEY,
} from "../services/database";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = ({ email, password }) => {
    const result = authenticateUser({ email, password });
    if (result.ok) {
      setUser(result.profile);
    }
    return result;
  };

  const register = ({ name, email, password }) => {
    const result = registerUser({ name, email, password });
    if (result.ok) {
      setUser(result.profile);
    }
    return result;
  };

  const logout = () => setUser(null);

  const regenerateSyncCode = () => {
    if (!user) return;
    const profile = refreshSyncCode(user.email);
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
    <AuthContext.Provider value={{ user, login, register, logout, refreshSyncCode: regenerateSyncCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
