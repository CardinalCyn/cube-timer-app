import {
  penaltyStates,
  subset3x3Data,
  WCAScrData,
} from "@/constants/constants";

export type AllScreens = {
  name: string;
  options: {
    drawerLabel: string;
    title: string;
  };
};

export type TimerSolvesData = {
  deviation: string | null;
  mean: string | null;
  best: string | null;
  count: string | null;
  Ao5: string | null;
  Ao12: string | null;
  Ao50: string | null;
  Ao100: string | null;
};

export type SolveData = {
  id: number;
  scramble: string;
  solveTime: number;
  date: Date;
  penaltyState: PenaltyState;
  session: number;
  puzzleScrambleCode:
    | WCAScrambleCategory["scrambleCode"]
    | Subset3x3ScrambleCategory["scrambleCode"];
};

export type ChartData = {
  solveId?: number;
  time?: number;
  ao5?: number | null;
  index: number;
  ao12?: number | null;
  personalBest?: number | null;
};

export type ChartSeries = {
  color: string;
  title: string;
  property: keyof ChartData;
  connectMissingData: boolean;
  graphDisplay: "line" | "scatter" | "both";
};

export type StatVal = { title: string; value: number };

export type ImprovementStats = {
  deviation: StatVal;
  ao12: StatVal;
  ao50: StatVal;
  ao100: StatVal;
  best: StatVal;
  solveCount: StatVal;
};
export type AverageStats = {
  ao3: StatVal;
  ao5: StatVal;
  ao12: StatVal;
  ao50: StatVal;
  ao100: StatVal;
  ao1000: StatVal;
};
export type OtherStats = {
  bestTime: StatVal;
  worstTime: StatVal;
  deviation: StatVal;
  mean: StatVal;
  totalTime: StatVal;
  solveCount: StatVal;
};
type Stat<T extends Record<string, StatVal>> = {
  header: string;
  global: T;
  currentSession: T;
};

export type TimerStats = {
  deviation: StatVal;
  mean: StatVal;
  best: StatVal;
  count: StatVal;
  ao5: StatVal;
  ao12: StatVal;
  ao50: StatVal;
  ao100: StatVal;
};

export type StatisticsStatsData = {
  improvementStats: Stat<ImprovementStats>;
  averageStats: Stat<AverageStats>;
  otherStats: Stat<OtherStats>;
};

export type ColorTheme = "light" | "dark";

export type AppSettings = {
  theme: "light" | "dark";
  trimPercentage: number;
};

export type DatabaseSuccess = {
  status: "success";
};

export type DatabaseError = {
  status: "error";
  message: string;
};

export type PenaltyState = (typeof penaltyStates)[number];

export type WCAScrambleCategory = (typeof WCAScrData)[number];

export type Subset3x3ScrambleCategory = (typeof subset3x3Data)[number];

export type ValidPuzzleCode =
  | WCAScrambleCategory["scrambleCode"]
  | Subset3x3ScrambleCategory["scrambleCode"];
