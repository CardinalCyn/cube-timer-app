import { AllScreens, SampleSolveData } from "@/types/types";
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

export const sampleSolveData: SampleSolveData[] = [
  {
    id: 1,
    solveTime: 12340,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
  },
  {
    id: 2,
    solveTime: 128211,
    scramble: "L' D' B' R' D2 F' D F L' B2 U B2 U2 D F2 D R2 F2 U' L2",
    date: new Date("2024-01-19T10:30:00"),
    penaltyState: "+2",
  },
  {
    id: 3,
    solveTime: "DNF",
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:32:00"),
    penaltyState: "DNF",
  },
  {
    id: 2,
    solveTime: 1234134,
    scramble: "L' D' B' R' D2 F' D F L' B2 U B2 U2 D F2 D R2 F2 U' L2",
    date: new Date("2024-01-19T10:31:00"),
    penaltyState: "noPenalty",
  },
];
