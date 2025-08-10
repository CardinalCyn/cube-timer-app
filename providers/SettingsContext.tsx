import { DEFAULT_TRIM_PERCENTAGE } from "@/constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ColorThemes = "light" | "dark";

export const SettingsContext = createContext<{
  theme: ColorThemes;
  toggleTheme: () => void;
  trimPercentage: number;
  setValidTrimPercentage: (trimPercentage: number) => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
  trimPercentage: DEFAULT_TRIM_PERCENTAGE,
  setValidTrimPercentage: () => {},
});

const THEME_STORAGE_KEY = "@app_theme";
const TRIM_PERCENTAGE_KEY = "@app_trim_percentage";
export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ColorThemes>("dark");

  const [trimPercentage, setTrimPercentage] = useState<number>(
    DEFAULT_TRIM_PERCENTAGE,
  );

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
    const loadTrimPercentage = async () => {
      const savedTrimPercentage: string | null = await AsyncStorage.getItem(
        TRIM_PERCENTAGE_KEY,
      );
      if (!Number.isNaN(savedTrimPercentage))
        setTrimPercentage(Number(savedTrimPercentage));
      else setTrimPercentage(DEFAULT_TRIM_PERCENTAGE);
    };
    loadSavedTheme();
    loadTrimPercentage();
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

  const setValidTrimPercentage = async (trimPercentage: number) => {
    if (trimPercentage < 0 || trimPercentage > 30)
      trimPercentage = DEFAULT_TRIM_PERCENTAGE;
    try {
      await AsyncStorage.setItem(
        TRIM_PERCENTAGE_KEY,
        trimPercentage.toString(),
      );
    } catch (error) {
      console.error("Failed to set trim percentage:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{ theme, toggleTheme, trimPercentage, setValidTrimPercentage }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
