import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { createContext, ReactNode, useEffect, useState } from "react";
type ColorThemes = "light" | "dark";

export const SettingsContext = createContext<{
  theme: ColorThemes;
  toggleTheme: () => void;
  trimPercentage: number;
  setValidTrimPercentage: (trimPercentage: number) => void;
  inspectionEnabled: boolean;
  toggleInspectionEnabled: () => void;
  inspectionTime: number;
  setValidInspectionTime: (inspectionTime: number) => void;
  displayStats: boolean;
  toggleDisplayStats: () => void;
  displayTimeDuringSolve: boolean;
  toggleDisplayTimeDuringSolve: () => void;
}>({
  theme: DEFAULT_SETTINGS.THEME,
  toggleTheme: () => {},
  trimPercentage: DEFAULT_SETTINGS.TRIM_PERCENTAGE,
  setValidTrimPercentage: () => {},
  inspectionEnabled: DEFAULT_SETTINGS.INSPECTION_ENABLED,
  toggleInspectionEnabled: () => {},
  inspectionTime: DEFAULT_SETTINGS.INSPECTION_TIME,
  setValidInspectionTime: () => {},
  displayStats: DEFAULT_SETTINGS.DISPLAY_STATS,
  toggleDisplayStats: () => {},
  displayTimeDuringSolve: DEFAULT_SETTINGS.DISPLAY_TIME_DURING_SOLVE,
  toggleDisplayTimeDuringSolve: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ColorThemes>(DEFAULT_SETTINGS.THEME);

  const [inspectionEnabled, setInspectionEnabled] = useState(
    DEFAULT_SETTINGS.INSPECTION_ENABLED,
  );
  const [inspectionTime, setInspectionTime] = useState(
    DEFAULT_SETTINGS.INSPECTION_TIME,
  );
  const [trimPercentage, setTrimPercentage] = useState<number>(
    DEFAULT_SETTINGS.TRIM_PERCENTAGE,
  );

  const [displayStats, setDisplayStats] = useState(
    DEFAULT_SETTINGS.DISPLAY_STATS,
  );

  const [displayTimeDuringSolve, setDisplayTimeDuringSolve] = useState(
    DEFAULT_SETTINGS.DISPLAY_TIME_DURING_SOLVE,
  );

  useEffect(() => {
    async function loadSettings() {
      try {
        const results = await AsyncStorage.multiGet([
          STORAGE_KEYS.CURRENT_SESSION,
        ]);
        const settings = Object.fromEntries(results);
        const savedTheme = settings[STORAGE_KEYS.THEME];
        if (savedTheme === "light" || savedTheme === "dark") {
          systemColorScheme.setColorScheme(savedTheme);
          setTheme(savedTheme);
        } else {
          setTheme(systemColorScheme.colorScheme || "light");
        }

        setDisplayStats(
          loadSettingHelper(
            settings[STORAGE_KEYS.DISPLAY_STATS],
            (val): val is boolean => typeof val === "boolean",
            DEFAULT_SETTINGS.DISPLAY_STATS,
          ),
        );

        setInspectionEnabled(
          loadSettingHelper(
            settings[STORAGE_KEYS.INSPECTION_ENABLED],
            (val): val is boolean => typeof val === "boolean",
            DEFAULT_SETTINGS.INSPECTION_ENABLED,
          ),
        );

        setInspectionTime(
          loadSettingHelper(
            settings[STORAGE_KEYS.INSPECTION_TIME],
            (val): val is number => typeof val === "number",
            DEFAULT_SETTINGS.INSPECTION_TIME,
          ),
        );

        setTrimPercentage(
          loadSettingHelper(
            settings[STORAGE_KEYS.TRIM_PERCENTAGE],
            (val): val is number => typeof val === "number",
            DEFAULT_SETTINGS.TRIM_PERCENTAGE,
          ),
        );

        setDisplayTimeDuringSolve(
          loadSettingHelper(
            settings[STORAGE_KEYS.DISPLAY_TIME_DURING_SOLVE],
            (val): val is boolean => typeof val === "boolean",
            DEFAULT_SETTINGS.DISPLAY_TIME_DURING_SOLVE,
          ),
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadSettings();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      systemColorScheme.setColorScheme(newTheme);
      setTheme(newTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const toggleInspectionEnabled = async () => {
    try {
      setInspectionEnabled((prev) => {
        const newValue = !prev;
        AsyncStorage.setItem(
          STORAGE_KEYS.INSPECTION_ENABLED,
          JSON.stringify(newValue),
        ).catch((error) => console.error("Failed to save:", error));

        return newValue;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const setValidInspectionTime = async (inspectionTime: number) => {
    try {
      if (inspectionTime < 0) inspectionTime = DEFAULT_SETTINGS.INSPECTION_TIME;
      setInspectionTime(inspectionTime);
      await AsyncStorage.setItem(
        STORAGE_KEYS.INSPECTION_TIME,
        JSON.stringify(inspectionTime),
      );
    } catch (error) {
      console.error("Failed to set valid inspection time:", error);
    }
  };

  const setValidTrimPercentage = async (newTrimPercentage: number) => {
    try {
      if (newTrimPercentage < 0 || newTrimPercentage > 30)
        newTrimPercentage = DEFAULT_SETTINGS.TRIM_PERCENTAGE;
      setTrimPercentage(newTrimPercentage);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRIM_PERCENTAGE,
        JSON.stringify(newTrimPercentage),
      );
    } catch (error) {
      console.error("Failed to set trim percentage:", error);
    }
  };

  const toggleDisplayTimeDuringSolve = async () => {
    try {
      setDisplayTimeDuringSolve((prev) => {
        const newValue = !prev;
        AsyncStorage.setItem(
          STORAGE_KEYS.DISPLAY_TIME_DURING_SOLVE,
          JSON.stringify(newValue),
        );

        return newValue;
      });
    } catch (error) {
      console.error("Failed to set display time during solve: " + error);
    }
  };

  const toggleDisplayStats = async () => {
    try {
      setDisplayStats((prev) => {
        const newValue = !prev;
        AsyncStorage.setItem(
          STORAGE_KEYS.DISPLAY_STATS,
          JSON.stringify(newValue),
        );
        return newValue;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        trimPercentage,
        setValidTrimPercentage,
        inspectionEnabled,
        toggleInspectionEnabled,
        inspectionTime,
        setValidInspectionTime,
        displayStats,
        toggleDisplayStats,
        displayTimeDuringSolve,
        toggleDisplayTimeDuringSolve,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function loadSettingHelper<T>(
  value: string | null | undefined,
  validator: (val: any) => val is T,
  fallback: T,
) {
  if (value === null || value === undefined) return fallback;
  const parsed = JSON.parse(value);
  return validator(parsed) ? parsed : fallback;
}

//theme, trimpercentage, inspectionenabled, inspectiontime done

//displaystats
