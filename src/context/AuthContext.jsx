import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const STORAGE_KEY = "savings-auth-profile";

const createSyncCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = ({ name, email }) => {
    if (!name || !email) return;
    const profile = {
      id: createId(),
      name,
      email,
      syncCode: createSyncCode(),
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
  };

  const logout = () => setUser(null);

  const refreshSyncCode = () =>
    setUser((prev) =>
      prev ? { ...prev, syncCode: createSyncCode(), refreshedAt: new Date().toISOString() } : prev
    );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshSyncCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
