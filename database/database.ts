import {
  isPenaltyState,
  isSubsetScrambleCode,
  isWCAScrambleCode,
} from "@/constants/utils";
import {
  DatabaseError,
  DatabaseSuccess,
  PenaltyState,
  SolveData,
  ValidPuzzleCode,
} from "@/types/types";
import * as SQLite from "expo-sqlite";
// {
//     id: number;
//     scramble: string;
//     solveTime: number;
//     date: Date;
//     penaltyState: PenaltyState;
//     session: number;
// }
export class Database {
  private db: SQLite.SQLiteDatabase;
  constructor() {
    this.db = SQLite.openDatabaseSync("cubing");
    this.initializeTables();
  }

  private initializeTables() {
    const createTableSolvesSql = /*sql*/ `
        CREATE TABLE IF NOT EXISTS solves (
            id INTEGER PRIMARY KEY NOT NULL
            , scramble TEXT NOT NULL
            , solve_time NUMBER NOT NULL
            , solve_date NUMBER NOT NULL
            , penalty_state TEXT NOT NULL
            , session_id NUMBER NOT NULL
            , puzzle_code TEXT NOT NULL
        );
    `;
    this.db.execSync(createTableSolvesSql);

    const indexSolvesSql = /*sql*/ `
          CREATE INDEX IF NOT EXISTS idx_session_id ON solves (session_id);
          CREATE INDEX IF NOT EXISTS idx_puzzle_code ON solves (puzzle_code)
    `;
    this.db.execSync(indexSolvesSql);
  }

  getSessions():
    | (DatabaseSuccess & {
        sessions: { session_id: number; puzzle_code: string }[];
      })
    | DatabaseError {
    try {
      const getSessionsSql = /*sql*/ `
      SELECT DISTINCT
        session_id
        , puzzle_code
      FROM solves
    `;

      const sessions = this.db.getAllSync<{
        session_id: number;
        puzzle_code: string;
      }>(getSessionsSql);

      return { status: "success", sessions };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "There was an issue with retrieving the sessions",
      };
    }
  }

  getSessionsByPuzzleType({
    puzzleType,
  }: {
    puzzleType: ValidPuzzleCode;
  }): (DatabaseSuccess & { sessions: number[] }) | DatabaseError {
    try {
      const getSessionsSql = /*sql*/ `
      SELECT DISTINCT
        session_id
      FROM solves
      WHERE puzzle_code = $puzzle_code
    `;

      const sessions = this.db.getAllSync<number>(getSessionsSql, {
        $puzzle_code: puzzleType,
      });

      return { status: "success", sessions };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "There was an issue with retrieving the sessions",
      };
    }
  }

  async addSolve(
    solveData: Omit<SolveData, "id">,
  ): Promise<(DatabaseSuccess & { solveId: number }) | DatabaseError> {
    const addSolveSql = /*sql*/ `
        INSERT INTO solves (
            scramble
            , solve_time
            , solve_date
            , penalty_state
            , session_id
            , puzzle_code
        )
        VALUES (
            $scramble
            , $solve_time
            , $solve_date
            , $penalty_state
            , $session_id
            , $puzzle_code
        )
    `;

    const statement = await this.db.prepareAsync(addSolveSql);
    try {
      const result = await statement.executeAsync({
        $scramble: solveData.scramble,
        $solve_time: solveData.solveTime,
        $solve_date: solveData.date.getTime(),
        $penalty_state: solveData.penaltyState,
        $session_id: solveData.session,
        $puzzle_code: solveData.puzzleScrambleCode,
      });
      return { status: "success", solveId: result.lastInsertRowId };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "There was an issue with adding the solve",
      };
    } finally {
      await statement.finalizeAsync();
    }
  }

  async removeSolve(solveId: number): Promise<DatabaseSuccess | DatabaseError> {
    try {
      const removeSolveSql = /*sql*/ `
            DELETE FROM solves
            WHERE id = $solveId
        `;

      await this.db.runAsync(removeSolveSql, { $solveId: solveId });

      return { status: "success" };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : `There was an error with removing solve of id: ${solveId}`,
      };
    }
  }

  getAllSolvesByPuzzleCode(
    puzzleCode: ValidPuzzleCode,
  ): (DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError {
    try {
      const getSolveByIdSql = /*sql*/ `
            SELECT
                id
                , scramble
                , solve_time
                , solve_date
                , penalty_state
                , session_id
                , puzzle_code
            FROM solves
            WHERE puzzle_code = $puzzle_code
        `;
      const res = this.db.getAllSync<GetSolveData>(getSolveByIdSql, {
        $puzzle_code: puzzleCode,
      });
      if (!res)
        return {
          status: "error",
          message: `There was an issue with retrieving solves`,
        };

      const solves: SolveData[] = [];

      for (const solve of res) {
        const penaltyState: PenaltyState = isPenaltyState(solve.penalty_state)
          ? solve.penalty_state
          : "DNF";

        if (
          !isWCAScrambleCode(solve.puzzle_code) &&
          !isSubsetScrambleCode(solve.puzzle_code)
        )
          return { status: "error", message: "The puzzle code is invalid" };

        solves.push({
          id: solve.id,
          scramble: solve.scramble,
          date: new Date(solve.solve_date),
          solveTime: solve.solve_time,
          penaltyState,
          session: solve.session_id,
          puzzleScrambleCode: solve.puzzle_code,
        });
      }

      return { status: "success", solveData: solves };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : `There was an issue with getting all solves`,
      };
    }
  }

  /*Gets solves based on the session id. if isHistorical is true, retrieves all solves that are not of the session*/
  getSolvesBySessionPuzzleCode(
    isHistorical: boolean,
    sessionId: number,
    puzzleCode: ValidPuzzleCode,
  ): (DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError {
    try {
      const getSolveByIdSql = /*sql*/ `
            SELECT
                id
                , scramble
                , solve_time
                , solve_date
                , penalty_state
                , session_id
                , puzzle_code
            FROM solves
            WHERE
              session_id ${isHistorical ? "!=" : "="} $session_id
              AND puzzle_code = $puzzle_code
        `;
      const res = this.db.getAllSync<GetSolveData>(getSolveByIdSql, {
        $session_id: sessionId,
        $puzzle_code: puzzleCode,
      });

      if (!res)
        return {
          status: "error",
          message: `There was an issue with retrieving solves based on the session id of ${sessionId}`,
        };

      const solves: SolveData[] = [];

      for (const solve of res) {
        const penaltyState: PenaltyState = isPenaltyState(solve.penalty_state)
          ? solve.penalty_state
          : "DNF";

        if (
          !isWCAScrambleCode(solve.puzzle_code) &&
          !isSubsetScrambleCode(solve.puzzle_code)
        )
          return { status: "error", message: "The puzzle code is invalid" };
        solves.push({
          id: solve.id,
          scramble: solve.scramble,
          date: new Date(solve.solve_date),
          solveTime: solve.solve_time,
          penaltyState,
          session: solve.session_id,
          puzzleScrambleCode: solve.puzzle_code,
        });
      }

      return { status: "success", solveData: solves };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : `There was an issue with getting solves by the session of ${sessionId}`,
      };
    }
  }

  async getSolveById(
    solveId: number,
  ): Promise<(DatabaseSuccess & { solveData: SolveData }) | DatabaseError> {
    try {
      const getSolveByIdSql = /*sql*/ `
            SELECT
                id
                , scramble
                , solve_time
                , solve_date
                , penalty_state
                , session_id
                , puzzle_code
            FROM solves
            WHERE
                id = $id
        `;
      const res = await this.db.getFirstAsync<GetSolveData>(getSolveByIdSql, {
        id: solveId,
      });

      if (!res)
        return {
          status: "error",
          message: `A solve with id: ${solveId} was not found`,
        };

      if (!isPenaltyState(res.penalty_state)) {
        return {
          status: "error",
          message: `Penalty state of solve is invalid, and is of value: ${res.penalty_state}`,
        };
      }
      if (
        !isWCAScrambleCode(res.puzzle_code) &&
        !isSubsetScrambleCode(res.puzzle_code)
      )
        return { status: "error", message: "The puzzle code is invalid" };
      const solveData: SolveData = {
        id: solveId,
        scramble: res.scramble,
        date: new Date(res.solve_date),
        solveTime: res.solve_time,
        penaltyState: res.penalty_state,
        session: res.session_id,
        puzzleScrambleCode: res.puzzle_code,
      };

      return { status: "success", solveData };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : `There was an issue with getting the solve by the id of ${solveId}`,
      };
    }
  }

  async updatePenaltyStateById(
    solveId: number,
    penaltyState: PenaltyState,
  ): Promise<DatabaseSuccess | DatabaseError> {
    try {
      const updatePenaltyStateByIdSql = /*sql*/ `
            UPDATE solves
                SET penalty_state = $penalty_state
            WHERE id = $solve_id
    `;

      await this.db.runAsync(updatePenaltyStateByIdSql, {
        $penalty_state: penaltyState,
        $solve_id: solveId,
      });

      return { status: "success" };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : `There was an issue with updating the penalty state by id of ${solveId}`,
      };
    }
  }
}

type GetSolveData = {
  id: number;
  scramble: string;
  solve_time: number;
  solve_date: number;
  penalty_state: string;
  session_id: number;
  puzzle_code: string;
};
