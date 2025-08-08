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

export type PenaltyState = "noPenalty" | "+2" | "DNF";

export type SolveData = {
  id: number;
  scramble: string;
  solveTime: number;
  date: Date;
  penaltyState: PenaltyState;
  session: number;
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

export type ImprovementStats = {
  deviation: number;
  ao12: number;
  ao50: number;
  ao100: number;
  best: number;
  solveCount: number;
};
export type AverageStats = {
  ao3: number;
  ao5: number;
  ao12: number;
  ao50: number;
  ao100: number;
  ao1000: number;
};
export type OtherStats = {
  bestTime: number;
  worstTime: number;
  deviation: number;
  mean: number;
  totalTime: number;
  solveCount: number;
};
type Stat = {
  header: string;
  global: ImprovementStats | AverageStats | OtherStats;
  currentSession: ImprovementStats | AverageStats | OtherStats;
};
export type StatisticsStatsData = {
  improvementStats: Stat;
  averageStats: Stat;
  otherStats: Stat;
};
