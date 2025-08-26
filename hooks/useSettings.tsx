import { NAV_THEME } from "@/lib/theme";
import { SettingsContext } from "@/providers/SettingsContext";
import { useContext } from "react";

export function useSettings() {
  const {
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
  } = useContext(SettingsContext);
  const colors = NAV_THEME[theme];

  return {
    theme,
    toggleTheme,
    colors,
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
  };
}
