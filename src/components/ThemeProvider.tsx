import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("quillpilot_theme");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    // Default to dark mode
    return "dark";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("quillpilot_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Standalone toggle button component
export const DarkModeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`px-3 py-2 rounded-lg transition-colors border-2 ${className}`}
      style={{
        backgroundColor: theme === "dark" ? "#2a2420" : "#fef5e7",
        borderColor: theme === "dark" ? "#4a4237" : "#e0c392",
        color: theme === "dark" ? "#e8d5b7" : "#2c3e50",
      }}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
};
