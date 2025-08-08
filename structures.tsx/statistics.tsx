import { DNF_VALUE } from "@/constants/constants";
import { calculatePenaltySolveTime } from "@/constants/utils";
import { SolveData, StatisticsStatsData } from "@/types/types";
import { AverageCalculator } from "./averageCalculator";

export type ChartDataPoint = {
  solveId: number; //id of solve
  solveTime: number; // Individual solve time in milliseconds
  ao5: number | null; //average of 5
  ao12: number | null; //average of 5
  personalBest: number | null; // null if not a PB compared to previous solves
};

type StatsData = {
  averages: {
    ao3: AverageCalculator;
    ao5: AverageCalculator;
    ao12: AverageCalculator;
    ao50: AverageCalculator;
    ao100: AverageCalculator;
    ao1000: AverageCalculator;
  };
  bestTime: number;
  worstTime: number;
  solveCount: number;
};

export class Statistics {
  private globalData: StatsData;
  private currentSessionData: StatsData;

  private currentSessionIndex: number;

  private currentSessionChartData: ChartDataPoint[] = [];
  private globalChartData: ChartDataPoint[] = [];
  constructor(trimPercentage: number, currentSession: number) {
    this.globalData = {
      averages: {
        ao3: new AverageCalculator(3, 0),
        ao5: new AverageCalculator(5, 5),
        ao12: new AverageCalculator(12, 5),
        ao50: new AverageCalculator(50, trimPercentage),
        ao100: new AverageCalculator(100, trimPercentage),
        ao1000: new AverageCalculator(1000, trimPercentage),
      },
      bestTime: Infinity,
      worstTime: -Infinity,
      solveCount: 0,
    };
    this.currentSessionData = {
      averages: {
        ao3: new AverageCalculator(3, 0),
        ao5: new AverageCalculator(5, 1),
        ao12: new AverageCalculator(12, 1),
        ao50: new AverageCalculator(50, trimPercentage),
        ao100: new AverageCalculator(100, trimPercentage),
        ao1000: new AverageCalculator(1000, trimPercentage),
      },
      bestTime: Infinity,
      worstTime: -Infinity,
      solveCount: 0,
    };
    this.currentSessionIndex = currentSession;
  }

  addSolve(solve: SolveData): void {
    solve.solveTime = calculatePenaltySolveTime(solve);
    const sessionNumber = solve.session;
    const isCurrentSession = this.currentSessionIndex === sessionNumber;
    for (const key in this.globalData.averages) {
      if (isCurrentSession)
        this.currentSessionData.averages[
          key as keyof typeof this.currentSessionData.averages
        ].addTime(solve.solveTime);
      this.globalData.averages[
        key as keyof typeof this.globalData.averages
      ].addTime(solve.solveTime);
    }

    // Update global personal best (only for non-DNF solves)
    if (solve.solveTime < this.globalData.bestTime) {
      this.globalData.bestTime = solve.solveTime;
    }

    if (
      solve.solveTime < this.currentSessionData.bestTime &&
      isCurrentSession
    ) {
      this.currentSessionData.bestTime = solve.solveTime;
    }

    if (
      solve.solveTime > this.globalData.worstTime &&
      solve.solveTime !== DNF_VALUE &&
      solve.solveTime > 0
    ) {
      this.globalData.worstTime = solve.solveTime;
    }

    if (
      isCurrentSession &&
      solve.solveTime > this.currentSessionData.worstTime &&
      solve.solveTime !== DNF_VALUE &&
      solve.solveTime > 0
    ) {
      this.currentSessionData.worstTime = solve.solveTime;
    }

    // Create data point

    this.globalChartData.push({
      solveId: solve.id,
      solveTime: solve.solveTime,
      ao5: this.globalData.averages.ao5.getCurrentAverage(),
      ao12: this.globalData.averages.ao12.getCurrentAverage(),
      personalBest:
        solve.solveTime === this.globalData.bestTime ? solve.solveTime : null,
    });
    this.globalData.solveCount++;

    if (isCurrentSession) {
      this.currentSessionData.solveCount++;
      this.currentSessionChartData.push({
        solveId: solve.id,
        solveTime: solve.solveTime,
        ao5: this.currentSessionData.averages.ao5.getCurrentAverage(),
        ao12: this.currentSessionData.averages.ao12.getCurrentAverage(),
        personalBest:
          solve.solveTime === this.currentSessionData.bestTime
            ? solve.solveTime
            : null,
      });
    }
  }

  getCurrentSessionChartData(): ChartDataPoint[] {
    return this.currentSessionChartData;
  }

  getGlobalChartData(): ChartDataPoint[] {
    return this.globalChartData;
  }

  getStatsData(): StatisticsStatsData {
    return {
      improvementStats: {
        header: "Improvement",
        global: {
          solveCount: this.globalData.solveCount,
          best: this.globalData.bestTime,
          ao12: this.globalData.averages.ao12.getCurrentAverage(),
          ao50: this.globalData.averages.ao50.getCurrentAverage(),
          ao100: this.globalData.averages.ao100.getCurrentAverage(),
          deviation: this.globalData.averages.ao5.getStandardDeviation(),
        },
        currentSession: {
          solveCount: this.currentSessionData.solveCount,
          best: this.currentSessionData.bestTime,
          ao12: this.currentSessionData.averages.ao12.getCurrentAverage(),
          ao50: this.currentSessionData.averages.ao50.getCurrentAverage(),
          ao100: this.currentSessionData.averages.ao100.getCurrentAverage(),
          deviation:
            this.currentSessionData.averages.ao5.getStandardDeviation(), //doesn't matter what average calc to use for deviation
        },
      },
      averageStats: {
        header: "Average",
        global: {
          ao3: this.globalData.averages.ao3.getBestAverage(),
          ao5: this.globalData.averages.ao5.getBestAverage(),
          ao12: this.globalData.averages.ao12.getBestAverage(),
          ao50: this.globalData.averages.ao50.getBestAverage(),
          ao100: this.globalData.averages.ao100.getBestAverage(),
          ao1000: this.globalData.averages.ao1000.getBestAverage(),
        },
        currentSession: {
          ao3: this.currentSessionData.averages.ao3.getBestAverage(),
          ao5: this.currentSessionData.averages.ao5.getBestAverage(),
          ao12: this.currentSessionData.averages.ao12.getBestAverage(),
          ao50: this.currentSessionData.averages.ao50.getBestAverage(),
          ao100: this.currentSessionData.averages.ao100.getBestAverage(),
          ao1000: this.currentSessionData.averages.ao1000.getBestAverage(),
        },
      },
      otherStats: {
        header: "Other",
        global: {
          bestTime: this.globalData.bestTime,
          worstTime: this.globalData.worstTime,
          deviation: this.globalData.averages.ao3.getStandardDeviation(),
          mean: this.globalData.averages.ao3.getMeanTime(),
          solveCount: this.globalData.solveCount,
          totalTime: this.globalData.averages.ao3.getTotalTime(),
        },
        currentSession: {
          bestTime: this.currentSessionData.bestTime,
          worstTime: this.currentSessionData.worstTime,
          deviation:
            this.currentSessionData.averages.ao3.getStandardDeviation(),
          mean: this.currentSessionData.averages.ao3.getMeanTime(),
          solveCount: this.currentSessionData.solveCount,
          totalTime: this.currentSessionData.averages.ao3.getTotalTime(),
        },
      },
    };
  }

  reset(): void {
    this.globalChartData = [];
    this.currentSessionChartData = [];

    this.globalData.bestTime = Infinity;
    this.globalData.worstTime = -Infinity;
    this.globalData.solveCount = 0;
    for (const averageCalc in this.globalData.averages) {
      this.globalData.averages[
        averageCalc as keyof typeof this.globalData.averages
      ].reset();
    }

    this.currentSessionData.bestTime = Infinity;
    this.currentSessionData.worstTime = -Infinity;
    this.currentSessionData.solveCount = 0;
    for (const averageCalc in this.currentSessionData.averages) {
      this.currentSessionData.averages[
        averageCalc as keyof typeof this.currentSessionData.averages
      ].reset();
    }
  }
}
