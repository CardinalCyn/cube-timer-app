import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ColorThemes = "light" | "dark";

export const ThemeContext = createContext<{
  theme: ColorThemes;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "@app_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ColorThemes>("dark");

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme: string | null = await AsyncStorage.getItem(
          THEME_STORAGE_KEY,
        );
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        } else {
          // Use system theme as default if no saved theme
          setTheme(systemColorScheme || "light");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };
    loadSavedTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
