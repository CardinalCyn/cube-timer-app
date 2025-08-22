import {
  allValidPuzzleCodes,
  subset3x3Data,
  WCAScrData,
} from "@/constants/constants";
import { Database } from "@/database/database";
import {
  DatabaseError,
  DatabaseSuccess,
  NavbarType,
  PenaltyState,
  SolveData,
  StatisticsStatsData,
  Subset3x3ScrambleCategory,
  TimerStats,
  ValidPuzzleCode,
  WCAScrambleCategory,
} from "@/types/types";
import { ChartDataPoint, Statistics } from "./statistics";

export class CubingContextClass {
  private db: Database;
  private currentTimerPuzzleType: WCAScrambleCategory["scrambleCode"];
  private currentPracticePuzzleType: Subset3x3ScrambleCategory["scrambleCode"];
  private statistics: { [K in ValidPuzzleCode]: Statistics };

  constructor(currentSessionIndex: number, trimPercentage: number) {
    this.db = new Database();
    this.currentTimerPuzzleType = WCAScrData[0].scrambleCode;
    this.currentPracticePuzzleType = subset3x3Data[0].scrambleCode;

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
    this.statistics[this.currentTimerPuzzleType].reset();
    const solves = this.db.getAllSolvesByPuzzleCode(
      this.currentTimerPuzzleType,
    );
    if (solves.status === "error")
      throw { error: "There was an issue with retrieving the solves" };

    solves.solveData.forEach((solve) => {
      this.statistics[this.currentTimerPuzzleType].addSolve(solve);
    });

    this.statistics[this.currentPracticePuzzleType].reset();
    const practiceSolves = this.db.getAllSolvesByPuzzleCode(
      this.currentPracticePuzzleType,
    );
    if (practiceSolves.status === "error")
      throw { error: "There was an issue with retrieving the solves" };

    practiceSolves.solveData.forEach((solve) => {
      this.statistics[this.currentPracticePuzzleType].addSolve(solve);
    });
  }

  changeCurrentTimerPuzzleType(
    puzzleType: WCAScrambleCategory["scrambleCode"],
  ): void {
    this.currentTimerPuzzleType = puzzleType;

    this.initializeStatistics();
  }

  changeCurrentPracticePuzzleType(
    puzzleType: Subset3x3ScrambleCategory["scrambleCode"],
  ): void {
    this.currentPracticePuzzleType = puzzleType;
    this.initializeStatistics();
  }

  getSolvesBySessionId(
    isHistorical: boolean,
    sessionId: number,
    navbarType: NavbarType,
  ): (DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError {
    const solvesBySessionData = this.db.getSolvesBySessionPuzzleCode(
      isHistorical,
      sessionId,
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType,
    );
    if (solvesBySessionData.status === "error") return solvesBySessionData;

    return solvesBySessionData;
  }

  async addSolve(
    solve: Omit<SolveData, "id">,
    navbarType: NavbarType,
  ): Promise<DatabaseError | (DatabaseSuccess & { solveId: number })> {
    const addSolveResult = await this.db.addSolve(solve);
    if (addSolveResult.status === "error") return addSolveResult;

    this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].addSolve({
      ...solve,
      id: addSolveResult.solveId,
    });

    return addSolveResult;
  }

  changePenaltyState(
    solveId: number,
    penaltyState: PenaltyState,
  ): DatabaseSuccess | DatabaseError {
    const updatedPenaltyStateResults = this.db.updatePenaltyStateById(
      solveId,
      penaltyState,
    );
    this.initializeStatistics();
    return updatedPenaltyStateResults;
  }

  async removeSolve(
    solveId: number,
    navbarType: NavbarType,
  ): Promise<DatabaseSuccess | DatabaseError> {
    const removeSolveResult = await this.db.removeSolve(solveId);
    if (removeSolveResult.status === "error") return removeSolveResult;

    this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].reset();

    const getAllSolvesResult = this.db.getAllSolvesByPuzzleCode(
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType,
    );
    if (getAllSolvesResult.status === "error") return getAllSolvesResult;

    getAllSolvesResult.solveData.forEach((solve) =>
      this.statistics[
        navbarType === "timer"
          ? this.currentTimerPuzzleType
          : this.currentPracticePuzzleType
      ].addSolve(solve),
    );

    return { status: "success" };
  }

  getStatsData(navbarType: NavbarType): StatisticsStatsData {
    return this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].getAnalyticsStatsData();
  }

  getGlobalChartData(navbarType: NavbarType): ChartDataPoint[] {
    return this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].getGlobalChartData();
  }

  getCurrentSessionChartData(navbarType: NavbarType): ChartDataPoint[] {
    return this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].getCurrentSessionChartData();
  }

  getTimerStats(navbarType: NavbarType): TimerStats {
    return this.statistics[
      navbarType === "timer"
        ? this.currentTimerPuzzleType
        : this.currentPracticePuzzleType
    ].getTimerStatsData();
  }

  getCurrentPuzzleTypes() {
    return {
      currentTimerPuzzleType: this.currentTimerPuzzleType,
      currentPracticePuzzleType: this.currentPracticePuzzleType,
    };
  }
}
