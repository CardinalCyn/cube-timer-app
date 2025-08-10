import { Database } from "@/database/database";
import {
  DatabaseError,
  DatabaseSuccess,
  SolveData,
  StatisticsStatsData,
} from "@/types/types";
import { ChartDataPoint, Statistics } from "./statistics";

//create new session
//change session

export class CubingContextClass {
  private db: Database;
  private statistics: Statistics;
  private sessions: number[];
  private setCurrentSessionIndex: (currentSession: number) => void;
  private currentSession: number;
  private trimPercentage: number;

  constructor(
    currentSessionIndex: number,
    trimPercentage: number,
    currentSession: number,
    setCurrentSessionIndex: (currentSession: number) => void,
  ) {
    this.db = new Database();
    this.statistics = new Statistics(currentSessionIndex, trimPercentage);
    const getSessionsData = this.db.getSessions();
    this.setCurrentSessionIndex = setCurrentSessionIndex;
    if (getSessionsData.status === "error")
      throw { error: "There was an issue with retrieving the sessions" };
    this.sessions = getSessionsData.sessions;
    this.currentSession = currentSession;
    this.trimPercentage = trimPercentage;
  }

  createNewSession(): number {
    this.currentSession = Math.max(...this.sessions) + 1;
    this.sessions.push(this.currentSession);

    this.resetStatistics();
    return this.currentSession;
  }

  //resets statistics, readds Solves
  private async resetStatistics() {
    this.statistics = new Statistics(this.currentSession, this.trimPercentage);

    const getAllSolvesData = await this.db.getAllSolves();

    if (getAllSolvesData.status === "error") return getAllSolvesData;

    getAllSolvesData.solveData.forEach((solve) =>
      this.statistics.addSolve(solve),
    );
  }

  async changeSession(
    sessionToSwapTo: number,
  ): Promise<DatabaseError | DatabaseSuccess> {
    try {
      this.setCurrentSessionIndex(sessionToSwapTo);

      return { status: "success" };
    } catch (err) {
      console.error(err);
      return {
        status: "error",
        message: "The session was unable to be changed",
      };
    }
  }

  async getSolvesBySessionId(
    isHistorical: boolean,
    sessionId: number,
  ): Promise<(DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError> {
    const solvesBySessionData = await this.db.getSolvesBySession(
      isHistorical,
      sessionId,
    );
    if (solvesBySessionData.status === "error") return solvesBySessionData;

    return solvesBySessionData;
  }

  async addSolve(
    solve: Omit<SolveData, "id">,
  ): Promise<DatabaseError | DatabaseSuccess> {
    const addSolveResult = await this.db.addSolve(solve);
    if (addSolveResult.status === "error") return addSolveResult;

    this.statistics.addSolve({ ...solve, id: addSolveResult.solveId });

    return { status: "success" };
  }

  async removeSolve(solveId: number): Promise<DatabaseSuccess | DatabaseError> {
    const removeSolveResult = await this.db.removeSolve(solveId);
    if (removeSolveResult.status === "error") return removeSolveResult;

    //removal of a solve is nontrivial, have to reset this.statistics
    this.statistics.reset();

    const getAllSolvesResult = await this.db.getAllSolves();
    if (getAllSolvesResult.status === "error") return getAllSolvesResult;

    getAllSolvesResult.solveData.forEach((solve) =>
      this.statistics.addSolve(solve),
    );

    return { status: "success" };
  }

  getStatsData(): StatisticsStatsData {
    return this.statistics.getStatsData();
  }

  getGlobalChartData(): ChartDataPoint[] {
    return this.statistics.getGlobalChartData();
  }

  getCurrentSessionChartData(): ChartDataPoint[] {
    return this.statistics.getCurrentSessionChartData();
  }
}
