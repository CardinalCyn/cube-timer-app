import { AllScreens } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";

export const allScreens: AllScreens[] = [
  { name: "(standard)", options: { drawerLabel: "Timer", title: "Timer" } },
  {
    name: "(practice)",
    options: { drawerLabel: "Practice", title: "Practice" },
  },
  {
    name: "settings",
    options: {
      drawerLabel: "Settings",
      title: "Settings",
    },
  },
];

export const allTabs = [
  {
    name: "index",
    options: {
      title: "",
      tabBarIcon: ({ color, size }: { color: string; size: number }) => (
        <MaterialIcons name="timer" size={size} color={color} />
      ),
    },
  },
  {
    name: "history",
    options: {
      title: "",
      tabBarIcon: ({ color, size }: { color: string; size: number }) => (
        <MaterialIcons name="history" size={size} color={color} />
      ),
    },
  },
];

export const themes: {
  [key: string]: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
    card: string;
  };
} = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    primary: "#007AFF",
    secondary: "#5856D6",
    border: "#E5E5EA",
    card: "#F2F2F7",
  },
  dark: {
    background: "#000000",
    text: "#FFFFFF",
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    border: "#38383A",
    card: "#1C1C1E",
  },
};
