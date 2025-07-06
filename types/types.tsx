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

export type SampleSolveData = {
  id: number;
  scramble: string;
  solveTime: number | "DNF";
  date: Date;
  penaltyState: PenaltyState;
};
