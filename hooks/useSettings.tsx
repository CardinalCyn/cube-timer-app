import { themes } from "@/constants/constants";
import { SettingsContext } from "@/providers/SettingsContext";
import { useContext } from "react";

export function useSettings() {
  const { theme, toggleTheme, trimPercentage, setValidTrimPercentage } =
    useContext(SettingsContext);
  const colors = themes[theme];

  return {
    theme,
    toggleTheme,
    colors,
    trimPercentage,
    setValidTrimPercentage,
  };
}
