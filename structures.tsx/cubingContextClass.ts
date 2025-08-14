import { allValidPuzzleCodes } from "@/constants/constants";
import { Database } from "@/database/database";
import {
  DatabaseError,
  DatabaseSuccess,
  SolveData,
  StatisticsStatsData,
  TimerStats,
  ValidPuzzleCode,
} from "@/types/types";
import { ChartDataPoint, Statistics } from "./statistics";

export class CubingContextClass {
  private db: Database;
  private currentTimerPuzzleType: ValidPuzzleCode;
  private statistics: { [K in ValidPuzzleCode]: Statistics };

  constructor(
    currentSessionIndex: number,
    trimPercentage: number,
    currentSession: number,
    currentPuzzleType: ValidPuzzleCode,
  ) {
    this.db = new Database();
    this.currentTimerPuzzleType = currentPuzzleType;

    // Fix: Pass parameters in correct order
    this.statistics = this.createStatisticsObj(
      trimPercentage,
      currentSessionIndex,
    );

    const getSessionsData = this.db.getSessions();
    if (getSessionsData.status === "error")
      throw { error: "There was an issue with retrieving the sessions" };

    const sessionsObj: { [puzzle_code: string]: number[] } = {};
    for (const session of getSessionsData.sessions) {
      if (!sessionsObj[session.puzzle_code]) {
        sessionsObj[session.puzzle_code] = [];
      }
      sessionsObj[session.puzzle_code].push(session.session_id);
    }

    this.initializeStatistics();
  }

  private createStatisticsObj(
    trimPercentage: number,
    currentSessionIndex: number,
  ): { [K in ValidPuzzleCode]: Statistics } {
    const validStatisticsObj: { [K in ValidPuzzleCode]: Statistics } =
      Object.fromEntries(
        allValidPuzzleCodes.map((code) => [
          code,
          new Statistics(trimPercentage, currentSessionIndex),
        ]),
      ) as { [K in ValidPuzzleCode]: Statistics };

    return validStatisticsObj;
  }

  private initializeStatistics(): void {
    const solves = this.db.getAllSolvesByPuzzleCode(
      this.currentTimerPuzzleType,
    );
    if (solves.status === "error")
      throw { error: "There was an issue with retrieving the solves" };

    solves.solveData.forEach((solve) => {
      this.statistics[this.currentTimerPuzzleType].addSolve(solve);
    });
  }

  changeCurrentTimerPuzzleType(puzzleType: ValidPuzzleCode): void {
    this.currentTimerPuzzleType = puzzleType;
    this.initializeStatistics();
  }

  getSolvesBySessionId(
    isHistorical: boolean,
    sessionId: number,
  ): (DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError {
    const solvesBySessionData = this.db.getSolvesBySessionPuzzleCode(
      isHistorical,
      sessionId,
      this.currentTimerPuzzleType,
    );
    if (solvesBySessionData.status === "error") return solvesBySessionData;

    return solvesBySessionData;
  }

  async addSolve(
    solve: Omit<SolveData, "id">,
  ): Promise<DatabaseError | DatabaseSuccess> {
    const addSolveResult = await this.db.addSolve(solve);
    if (addSolveResult.status === "error") return addSolveResult;

    this.statistics[this.currentTimerPuzzleType].addSolve({
      ...solve,
      id: addSolveResult.solveId,
    });

    return { status: "success" };
  }

  async removeSolve(solveId: number): Promise<DatabaseSuccess | DatabaseError> {
    const removeSolveResult = await this.db.removeSolve(solveId);
    if (removeSolveResult.status === "error") return removeSolveResult;

    this.statistics[this.currentTimerPuzzleType].reset();

    const getAllSolvesResult = await this.db.getAllSolvesByPuzzleCode(
      this.currentTimerPuzzleType,
    );
    if (getAllSolvesResult.status === "error") return getAllSolvesResult;

    getAllSolvesResult.solveData.forEach((solve) =>
      this.statistics[this.currentTimerPuzzleType].addSolve(solve),
    );

    return { status: "success" };
  }

  getStatsData(): StatisticsStatsData {
    return this.statistics[this.currentTimerPuzzleType].getAnalyticsStatsData();
  }

  getGlobalChartData(): ChartDataPoint[] {
    return this.statistics[this.currentTimerPuzzleType].getGlobalChartData();
  }

  getCurrentSessionChartData(): ChartDataPoint[] {
    return this.statistics[
      this.currentTimerPuzzleType
    ].getCurrentSessionChartData();
  }

  getTimerStats(): TimerStats {
    return this.statistics[this.currentTimerPuzzleType].getTimerStatsData();
  }
}
