import { AllScreens, ChartSeries, SolveData } from "@/types/types";
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
  {
    name: "analytics",
    options: {
      title: "",
      tabBarIcon: ({ color, size }: { color: string; size: number }) => (
        <MaterialIcons name="analytics" size={size} color={color} />
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

export const DNF_VALUE = Number.MAX_SAFE_INTEGER;
export const UNKNOWN = -666;

export const DEFAULT_TRIM_PERCENTAGE = 5;

export const sampleSolveData: SolveData[] = [
  {
    id: 1,
    solveTime: 4190,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "+2",
    session: 1,
  },
  {
    id: 2,
    solveTime: 6270,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 3,
    solveTime: 7810,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 4,
    solveTime: 62270,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 5,
    solveTime: 16150,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 6,
    solveTime: 18200,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 7,
    solveTime: DNF_VALUE,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 8,
    solveTime: DNF_VALUE,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 9,
    solveTime: 750,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 10,
    solveTime: 1090,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 11,
    solveTime: 3010,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
  {
    id: 12,
    solveTime: 4090,
    scramble: "R U R' U' R U R' F' R U R' U' R' F R",
    date: new Date("2024-01-15T10:30:00"),
    penaltyState: "noPenalty",
    session: 1,
  },
];
//how much time is added with a +2
export const penaltySolveTime = 2000;
//FIXME: need to have currentSession come from somewhere not here lol
export const currentSessionIndex = 1;
export const trimPercentage = 5;

export const chartToolTipLabels: { label: string; textColor: string }[] = [
  { label: "Solve Number", textColor: "" },
  { label: "Solve Time", textColor: "red" },
  { label: "PB", textColor: "yellow" },
];

export const chartSeries: ChartSeries[] = [
  {
    title: "Time",
    property: "time",
    color: "white",
    connectMissingData: true,
    graphDisplay: "line",
  },
  {
    title: "Ao5",
    property: "ao5",
    color: "red",
    connectMissingData: true,
    graphDisplay: "line",
  },
  {
    title: "Ao12",
    property: "ao12",
    color: "green",
    connectMissingData: true,
    graphDisplay: "line",
  },
  {
    title: "Personal Best",
    property: "personalBest",
    color: "yellow",
    connectMissingData: true,
    graphDisplay: "both",
  },
];
