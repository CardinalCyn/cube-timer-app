import {
  DatabaseError,
  DatabaseSuccess,
  PenaltyState,
  SolveData,
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
        );
    `;
    this.db.execSync(createTableSolvesSql);

    const indexSolvesSql = /*sql*/ `
          CREATE INDEX IF NOT EXISTS solve_Date ON solves (session_id);
    `;
    this.db.execSync(indexSolvesSql);
  }

  getSessions(): (DatabaseSuccess & { sessions: number[] }) | DatabaseError {
    try {
      const getSessionsSql = /*sql*/ `
      SELECT DISTINCT
        session_id
      FROM solves
    `;

      const sessions = this.db.getAllSync<number>(getSessionsSql);
      return { status: "success", sessions };
    } catch (err: unknown) {
      console.error(err);
      return {
        status: "error",
        message: "There was an issue with retrieving the sessions",
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
        )\
        VALUES (
            $scramble
            , $solve_time
            , $solve_date
            , $penalty_state
            , $session_id
        )\
    `;

    const statement = await this.db.prepareAsync(addSolveSql);
    try {
      const result = await statement.executeAsync({
        $scramble: solveData.scramble,
        $solve_time: solveData.solveTime,
        $solve_date: solveData.date.getTime(),
        $penalty_state: solveData.penaltyState,
        $session_id: solveData.session,
      });
      console.log(result);
      return { status: "success", solveId: result.lastInsertRowId };
    } catch (err: unknown) {
      console.log(err);
      return {
        status: "error",
        message: "There was an issue with adding the solve",
      };
    } finally {
      await statement.finalizeAsync();
    }
  }

  async removeSolve(solveId: number): Promise<DatabaseSuccess | DatabaseError> {
    try {
      const addSolveSql = /*sql*/ `
            DELETE FROM solves
            WHERE id = ?
        `;

      const res = await this.db.runAsync(addSolveSql, [solveId]);
      console.log(res);

      return { status: "success" };
    } catch (err: unknown) {
      console.log(err);
      return {
        status: "error",
        message: `There was an error with removing solve of id: ${solveId}`,
      };
    }
  }

  async getAllSolves(): Promise<
    (DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError
  > {
    try {
      const getSolveByIdSql = /*sql*/ `
            SELECT
                id
                , scramble
                , solve_time
                , solve_date
                , penalty_state
                , session_id
            FROM solves
            WHERE

        `;
      const res = await this.db.getAllAsync<GetSolveData>(getSolveByIdSql);

      if (!res)
        return {
          status: "error",
          message: `There was an issue with retrieving solves`,
        };

      const solves: SolveData[] = [];

      for (const solve of res) {
        let penaltyState = solve.penalty_state;
        if (
          !["noPenalty", "+2", "DNF"].includes(
            solve.penalty_state as PenaltyState,
          )
        )
          penaltyState = "DNF";
        solves.push({
          id: solve.id,
          scramble: solve.scramble,
          date: new Date(solve.solve_date),
          solveTime: solve.solve_time,
          penaltyState: penaltyState as PenaltyState,
          session: solve.session_id,
        });
      }

      return { status: "success", solveData: solves };
    } catch (err: unknown) {
      console.log(err);
      return {
        status: "error",
        message: `There was an issue with getting all solves`,
      };
    }
  }

  /*Gets solves based on the session id. if isHistorical is true, retrieves all solves that are not of the session*/
  async getSolvesBySession(
    isHistorical: boolean,
    sessionId: number,
  ): Promise<(DatabaseSuccess & { solveData: SolveData[] }) | DatabaseError> {
    try {
      const getSolveByIdSql = /*sql*/ `
            SELECT
                id
                , scramble
                , solve_time
                , solve_date
                , penalty_state
                , session_id
            FROM solves
            WHERE
                session_id ${isHistorical ? "!=" : "="} ?
        `;
      const res = await this.db.getAllAsync<GetSolveData>(getSolveByIdSql, [
        sessionId,
      ]);

      if (!res)
        return {
          status: "error",
          message: `There was an issue with retrieving solves based on the session id of ${sessionId}`,
        };

      const solves: SolveData[] = [];

      for (const solve of res) {
        let penaltyState = solve.penalty_state;
        if (
          !["noPenalty", "+2", "DNF"].includes(
            solve.penalty_state as PenaltyState,
          )
        )
          penaltyState = "DNF";
        solves.push({
          id: solve.id,
          scramble: solve.scramble,
          date: new Date(solve.solve_date),
          solveTime: solve.solve_time,
          penaltyState: penaltyState as PenaltyState,
          session: solve.session_id,
        });
      }

      return { status: "success", solveData: solves };
    } catch (err: unknown) {
      console.log(err);
      return {
        status: "error",
        message: `There was an issue with getting solves by the session of ${sessionId}`,
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
            FROM solves
            WHERE
                id = ?
        `;
      const res = await this.db.getFirstAsync<GetSolveData>(getSolveByIdSql, [
        solveId,
      ]);

      if (!res)
        return {
          status: "error",
          message: `A solve with id: ${solveId} was not found`,
        };

      if (
        !["noPenalty", "+2", "DNF"].includes(res.penalty_state as PenaltyState)
      )
        return {
          status: "error",
          message: `Penalty state of solve is invalid, and is of value: ${res.penalty_state}`,
        };
      const solveData: SolveData = {
        id: solveId,
        scramble: res.scramble,
        date: new Date(res.solve_date),
        solveTime: res.solve_time,
        penaltyState: res.penalty_state as PenaltyState,
        session: res.session_id,
      };

      return { status: "success", solveData };
    } catch (err: unknown) {
      console.log(err);
      return {
        status: "error",
        message: `There was an issue with getting the solve by the id of ${solveId}`,
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
      console.log(err);
      return {
        status: "error",
        message: `There was an issue with updating the penalty state by id of ${solveId}`,
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
};
