import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  preview: [string, string, string];
  values: Record<string, string>;
};

type ThemeContextType = {
  theme: ThemeDefinition;
  themes: ThemeDefinition[];
  setTheme: (id: string) => void;
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "ocean-breeze",
    name: "오션 브리즈",
    description: "시원한 블루 톤으로 세련된 느낌의 테마",
    preview: ["#0ea5e9", "#38bdf8", "#e0f2fe"],
    values: {
      "--background": "hsl(204, 100%, 97%)",
      "--foreground": "hsl(222, 47%, 15%)",
      "--card": "hsl(0, 0%, 100%)",
      "--card-foreground": "hsl(222, 47%, 15%)",
      "--popover": "hsl(0, 0%, 100%)",
      "--popover-foreground": "hsl(222, 47%, 15%)",
      "--primary": "hsl(204, 94%, 41%)",
      "--primary-foreground": "hsl(0, 0%, 100%)",
      "--secondary": "hsl(205, 90%, 92%)",
      "--secondary-foreground": "hsl(222, 47%, 18%)",
      "--muted": "hsl(204, 94%, 92%)",
      "--muted-foreground": "hsl(210, 20%, 40%)",
      "--accent": "hsl(201, 100%, 46%)",
      "--accent-foreground": "hsl(0, 0%, 100%)",
      "--destructive": "hsl(0, 84%, 60%)",
      "--destructive-foreground": "hsl(0, 0%, 98%)",
      "--border": "hsl(206, 90%, 82%)",
      "--input": "hsl(206, 90%, 82%)",
      "--ring": "hsl(204, 94%, 41%)",
      "--chart-1": "hsl(201, 100%, 46%)",
      "--chart-2": "hsl(178, 70%, 45%)",
      "--chart-3": "hsl(42, 92%, 56%)",
      "--chart-4": "hsl(217, 91%, 35%)",
      "--chart-5": "hsl(341, 75%, 51%)",
      "--sidebar": "hsl(204, 100%, 97%)",
      "--sidebar-foreground": "hsl(222, 47%, 15%)",
      "--sidebar-primary": "hsl(204, 94%, 41%)",
      "--sidebar-primary-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-accent": "hsl(201, 100%, 46%)",
      "--sidebar-accent-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-border": "hsl(206, 90%, 82%)",
      "--sidebar-ring": "hsl(204, 94%, 41%)",
      "--theme-color": "#0ea5e9",
    },
  },
  {
    id: "warm-sunset",
    name: "웜 선셋",
    description: "따뜻한 코럴과 베이지로 편안한 분위기 연출",
    preview: ["#fb7185", "#f97316", "#fee2d5"],
    values: {
      "--background": "hsl(25, 86%, 96%)",
      "--foreground": "hsl(15, 30%, 20%)",
      "--card": "hsl(0, 0%, 100%)",
      "--card-foreground": "hsl(15, 30%, 20%)",
      "--popover": "hsl(0, 0%, 100%)",
      "--popover-foreground": "hsl(15, 30%, 20%)",
      "--primary": "hsl(11, 87%, 65%)",
      "--primary-foreground": "hsl(0, 0%, 100%)",
      "--secondary": "hsl(20, 90%, 90%)",
      "--secondary-foreground": "hsl(15, 25%, 25%)",
      "--muted": "hsl(20, 60%, 88%)",
      "--muted-foreground": "hsl(15, 20%, 40%)",
      "--accent": "hsl(24, 94%, 57%)",
      "--accent-foreground": "hsl(0, 0%, 100%)",
      "--destructive": "hsl(0, 75%, 55%)",
      "--destructive-foreground": "hsl(0, 0%, 100%)",
      "--border": "hsl(20, 60%, 80%)",
      "--input": "hsl(20, 60%, 80%)",
      "--ring": "hsl(11, 87%, 65%)",
      "--chart-1": "hsl(11, 87%, 65%)",
      "--chart-2": "hsl(32, 95%, 60%)",
      "--chart-3": "hsl(142, 44%, 57%)",
      "--chart-4": "hsl(347, 77%, 60%)",
      "--chart-5": "hsl(199, 89%, 48%)",
      "--sidebar": "hsl(25, 86%, 96%)",
      "--sidebar-foreground": "hsl(15, 30%, 20%)",
      "--sidebar-primary": "hsl(11, 87%, 65%)",
      "--sidebar-primary-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-accent": "hsl(24, 94%, 57%)",
      "--sidebar-accent-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-border": "hsl(20, 60%, 80%)",
      "--sidebar-ring": "hsl(11, 87%, 65%)",
      "--theme-color": "#fb7185",
    },
  },
  {
    id: "calm-forest",
    name: "포레스트 그린",
    description: "자연에서 영감을 받은 싱그러운 그린 테마",
    preview: ["#34d399", "#0f766e", "#ecfdf5"],
    values: {
      "--background": "hsl(156, 72%, 96%)",
      "--foreground": "hsl(160, 27%, 20%)",
      "--card": "hsl(0, 0%, 100%)",
      "--card-foreground": "hsl(160, 27%, 20%)",
      "--popover": "hsl(0, 0%, 100%)",
      "--popover-foreground": "hsl(160, 27%, 20%)",
      "--primary": "hsl(161, 94%, 30%)",
      "--primary-foreground": "hsl(0, 0%, 100%)",
      "--secondary": "hsl(152, 65%, 90%)",
      "--secondary-foreground": "hsl(161, 30%, 20%)",
      "--muted": "hsl(152, 45%, 88%)",
      "--muted-foreground": "hsl(161, 24%, 35%)",
      "--accent": "hsl(161, 94%, 38%)",
      "--accent-foreground": "hsl(0, 0%, 100%)",
      "--destructive": "hsl(0, 76%, 54%)",
      "--destructive-foreground": "hsl(0, 0%, 100%)",
      "--border": "hsl(151, 52%, 80%)",
      "--input": "hsl(151, 52%, 80%)",
      "--ring": "hsl(161, 94%, 38%)",
      "--chart-1": "hsl(161, 94%, 38%)",
      "--chart-2": "hsl(152, 65%, 50%)",
      "--chart-3": "hsl(42, 92%, 56%)",
      "--chart-4": "hsl(199, 89%, 48%)",
      "--chart-5": "hsl(347, 77%, 60%)",
      "--sidebar": "hsl(156, 72%, 96%)",
      "--sidebar-foreground": "hsl(160, 27%, 20%)",
      "--sidebar-primary": "hsl(161, 94%, 30%)",
      "--sidebar-primary-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-accent": "hsl(161, 94%, 38%)",
      "--sidebar-accent-foreground": "hsl(0, 0%, 100%)",
      "--sidebar-border": "hsl(151, 52%, 80%)",
      "--sidebar-ring": "hsl(161, 94%, 38%)",
      "--theme-color": "#34d399",
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME = THEMES[0];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME.id);

  const applyTheme = useCallback((theme: ThemeDefinition) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    Object.entries(theme.values).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", theme.id);
  }, []);

  const applyThemeColor = (value: string) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--theme-color", value);
    root.style.setProperty("--accent", value);
    root.style.setProperty("--primary", value);
    root.style.setProperty("--ring", value);
    root.style.setProperty("--sidebar-primary", value);
    root.style.setProperty("--sidebar-ring", value);
    root.style.setProperty("--sidebar-accent", value);
    root.style.setProperty("--chart-1", value);
  };

  useEffect(() => {
    try {
      const savedId = localStorage.getItem("theme-id");
      if (savedId) {
        const storedTheme = THEMES.find((t) => t.id === savedId);
        if (storedTheme) {
          setThemeId(storedTheme.id);
          return;
        }
      }
    } catch {}
    applyTheme(DEFAULT_THEME);
  }, [applyTheme]);


  const activeTheme = useMemo(() => THEMES.find((theme) => theme.id === themeId) ?? DEFAULT_THEME, [themeId]);


  useEffect(() => {

    applyTheme(activeTheme);
  }, [activeTheme, applyTheme]);

  useEffect(() => {
    try {
      localStorage.setItem("theme-id", activeTheme.id);
    } catch {}
  }, [activeTheme.id]);

  const setTheme = useCallback((id: string) => {
    const nextTheme = THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME;
    setThemeId(nextTheme.id);
  }, []);


  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
