import { themes } from "@/constants/constants";
import { ThemeContext } from "@/providers/ThemeContext";
import { useContext } from "react";

export function useTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const colors = themes[theme];

  return {
    theme,
    toggleTheme,
    colors,
  };
}
