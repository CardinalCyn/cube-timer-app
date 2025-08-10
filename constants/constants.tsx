import { AllScreens, ChartSeries, SolveData, TimerStats } from "@/types/types";
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

export const defaultOtherStats: TimerStats = {
  deviation: { title: "Deviation", value: Infinity },
  mean: { title: "Mean", value: Infinity },
  best: { title: "Best", value: Infinity },
  count: { title: "Count", value: 0 },
  ao5: { title: "Ao5", value: Infinity },
  ao12: { title: "Ao12", value: Infinity },
  ao50: { title: "Ao50", value: Infinity },
  ao100: { title: "Ao100", value: Infinity },
};

type ScrData = { title: string; scrambleCode: string; lengthModifier: number };

export const scrData: { WCA: ScrData[]; "3x3x3 subsets": ScrData[] } = {
  WCA: [
    { title: "3x3x3", scrambleCode: "333", lengthModifier: 0 },
    { title: "2x2x2", scrambleCode: "222so", lengthModifier: 0 },
    { title: "4x4x4", scrambleCode: "444wca", lengthModifier: -40 },
    { title: "5x5x5", scrambleCode: "555wca", lengthModifier: -60 },
    { title: "6x6x6", scrambleCode: "666wca", lengthModifier: -80 },
    { title: "7x7x7", scrambleCode: "777wca", lengthModifier: -100 },
    { title: "3x3 bld", scrambleCode: "333ni", lengthModifier: 0 },
    { title: "3x3 fm", scrambleCode: "333fm", lengthModifier: 0 },
    { title: "3x3 oh", scrambleCode: "333oh", lengthModifier: 0 },
    { title: "clock", scrambleCode: "clkwca", lengthModifier: 0 },
    { title: "megaminx", scrambleCode: "mgmp", lengthModifier: -70 },
    { title: "pyraminx", scrambleCode: "pyrso", lengthModifier: -10 },
    { title: "skewb", scrambleCode: "skbso", lengthModifier: 0 },
    { title: "sq1", scrambleCode: "sqrs", lengthModifier: 0 },
    { title: "4x4 bld", scrambleCode: "444bld", lengthModifier: -40 },
    { title: "5x5 bld", scrambleCode: "555bld", lengthModifier: -60 },
    { title: "3x3 mbld", scrambleCode: "r3ni", lengthModifier: 5 },
  ],
  "3x3x3 subsets": [
    {
      title: "2-generator R,U",
      scrambleCode: "2gen",
      lengthModifier: 0,
    },
    {
      title: "2-generator L,U",
      scrambleCode: "2genl",
      lengthModifier: 0,
    },
    {
      title: "Roux-generator M,U",
      scrambleCode: "roux",
      lengthModifier: 25,
    },
    {
      title: "3-generator F,R,U",
      scrambleCode: "3gen_F",
      lengthModifier: 0,
    },
    {
      title: "3-generator R,U,L",
      scrambleCode: "3gen_L",
      lengthModifier: 0,
    },
    {
      title: "3-generator R,r,U",
      scrambleCode: "RrU",
      lengthModifier: 25,
    },
    {
      title: "Domino Subgroup",
      scrambleCode: "333drud",
      lengthModifier: 0,
    },
    {
      title: "half turns only",
      scrambleCode: "half",
      lengthModifier: 0,
    },
    {
      title: "last slot + last layer (old)",
      scrambleCode: "lsll",
      lengthModifier: 15,
    },
  ],
};
