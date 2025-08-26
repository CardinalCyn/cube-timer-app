import {
  AllScreens,
  ChartSeries,
  ColorTheme,
  PenaltyState,
  Subset3x3ScrambleCategory,
  ValidPuzzleCode,
  WCAScrambleCategory,
} from "@/types/types";
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

export const DNF_VALUE = Number.MAX_SAFE_INTEGER;
export const UNKNOWN = -666;

//how much time is added with a +2
export const penaltySolveTime = 2000;
export const trimPercentage = 5;

export const penaltyStates = ["+2", "noPenalty", "DNF"] as const;

export const penaltyStateTitleMap: { [key in PenaltyState]: string } = {
  noPenalty: "No penalty",
  "+2": "+2",
  DNF: "DNF",
};

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

export const WCAScrData = [
  { title: "3x3x3", scrambleCode: "333", lengthModifier: 0 },
  { title: "2x2x2", scrambleCode: "222so", lengthModifier: 0 },
  { title: "4x4x4", scrambleCode: "444wca", lengthModifier: -40 },
  { title: "5x5x5", scrambleCode: "555wca", lengthModifier: -60 },
  { title: "6x6x6", scrambleCode: "666wca", lengthModifier: -80 },
  { title: "7x7x7", scrambleCode: "777wca", lengthModifier: -100 },
  { title: "clock", scrambleCode: "clkwca", lengthModifier: 0 },
  { title: "megaminx", scrambleCode: "mgmp", lengthModifier: -70 },
  { title: "pyraminx", scrambleCode: "pyrso", lengthModifier: -10 },
  { title: "skewb", scrambleCode: "skbso", lengthModifier: 0 },
  { title: "sq1", scrambleCode: "sqrs", lengthModifier: 0 },
] as const;

export const subset3x3Data = [
  { title: "2-generator R,U", scrambleCode: "2gen", lengthModifier: 0 },
  { title: "2-generator L,U", scrambleCode: "2genl", lengthModifier: 0 },
  { title: "Roux-generator M,U", scrambleCode: "roux", lengthModifier: 25 },
  { title: "3-generator F,R,U", scrambleCode: "3gen_F", lengthModifier: 0 },
  { title: "3-generator R,U,L", scrambleCode: "3gen_L", lengthModifier: 0 },
  { title: "3-generator R,r,U", scrambleCode: "RrU", lengthModifier: 25 },
  { title: "Domino Subgroup", scrambleCode: "333drud", lengthModifier: 0 },
  { title: "half turns only", scrambleCode: "half", lengthModifier: 0 },
  {
    title: "last slot + last layer (old)",
    scrambleCode: "lsll",
    lengthModifier: 15,
  },
] as const;

export const DEFAULT_SETTINGS: {
  THEME: ColorTheme;
  TRIM_PERCENTAGE: number;
  DEFAULT_TIMER_PUZZLE_CATEGORY: WCAScrambleCategory;
  DEFAULT_PRACTICE_PUZZLE_CATEGORY: Subset3x3ScrambleCategory;
  INSPECTION_ENABLED: boolean;
  INSPECTION_TIME: number;
  DISPLAY_STATS: boolean;
  DISPLAY_TIME_DURING_SOLVE: boolean;
} = {
  THEME: "dark",
  TRIM_PERCENTAGE: 5,
  DEFAULT_TIMER_PUZZLE_CATEGORY: WCAScrData[0],
  DEFAULT_PRACTICE_PUZZLE_CATEGORY: subset3x3Data[0],
  INSPECTION_ENABLED: false,
  INSPECTION_TIME: 15,
  DISPLAY_STATS: true,
  DISPLAY_TIME_DURING_SOLVE: true,
};

export const STORAGE_KEYS = {
  CURRENT_SESSION: "@app_current_session",
  THEME: "@app_theme",
  TRIM_PERCENTAGE: "@app_trim_percentage",
  TIMER_CUBING_CATEGORY: "@app_timer_cubing_category",
  PRACTICE_CUBING_CATEGORY: "@app_practice_cubing_category",
  INSPECTION_ENABLED: "@app_inspection_enabled",
  INSPECTION_TIME: "@app_inspection_time",
  DISPLAY_STATS: "@app_display_stats",
  DISPLAY_TIME_DURING_SOLVE: "@app_display_time_during_solve",
};

export const allValidPuzzleCodes: ValidPuzzleCode[] = [
  ...WCAScrData.map((c) => c.scrambleCode),
  ...subset3x3Data.map((c) => c.scrambleCode),
];

export const SCRAMBLE_DEBUG = false;
