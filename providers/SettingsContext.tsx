import { DEFAULT_TRIM_PERCENTAGE, STORAGE_KEYS } from "@/constants/constants";
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
          STORAGE_KEYS.THEME,
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
        STORAGE_KEYS.TRIM_PERCENTAGE,
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
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const setValidTrimPercentage = async (trimPercentage: number) => {
    if (trimPercentage < 0 || trimPercentage > 30)
      trimPercentage = DEFAULT_TRIM_PERCENTAGE;
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRIM_PERCENTAGE,
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
