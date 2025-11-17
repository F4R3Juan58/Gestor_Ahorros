import React, { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

const THEME_STORAGE = "savings-theme-preference";

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "system";
    return window.localStorage.getItem(THEME_STORAGE) || "system";
  }); // "light" | "dark" | "system"
  const [language, setLanguage] = useState("es");

  // Aplicar tema al <html>
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (value) => {
      if (value === "light") {
        root.classList.remove("dark");
      } else if (value === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.toggle("dark", mq.matches);
      }
    };

    applyTheme(theme);
    const listener = () => theme === "system" && applyTheme("system");
    mq.addEventListener("change", listener);

    window.localStorage.setItem(THEME_STORAGE, theme);

    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
