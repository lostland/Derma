import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  color: string;
  setColor: (c: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [color, setColor] = useState<string>("#3b82f6"); // default primary

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-color");
      if (saved) setColor(saved);
    } catch {}
  }, []);

  const update = (c: string) => {
    setColor(c);
    try { localStorage.setItem("theme-color", c); } catch {}
    // also reflect to CSS var
    const root = document.documentElement;
    root.style.setProperty("--theme-color", c);
  };

  // keep CSS variable synced (first render too)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-color", color);
  }, [color]);

  return (
    <ThemeContext.Provider value={{ color, setColor: update }}>
      <div style={{ ["--theme-color" as any]: color }}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
