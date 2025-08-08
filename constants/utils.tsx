import { SolveData } from "@/types/types";
import { DNF_VALUE, penaltySolveTime } from "./constants";

export function convertCubingTime(
  elapsedTime: number,
  millisecondsFormat: "." | ":",
  padStart: boolean,
  showMilliseconds: boolean,
): string {
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const milliseconds = Math.floor((elapsedTime % 1000) / 10);

  const stringifiedHours = String(hours).padStart(2, "0");
  const stringifiedMinutes = String(minutes).padStart(2, "0");
  const stringifiedSeconds = String(seconds).padStart(2, "0");
  const stringifiedMilliseconds = String(milliseconds).padStart(2, "0");

  return hours
    ? `${
        padStart ? stringifiedHours : String(hours)
      }:${stringifiedMinutes}:${stringifiedSeconds}${
        showMilliseconds ? millisecondsFormat + stringifiedMilliseconds : ""
      }`
    : minutes
    ? `${
        padStart ? stringifiedMinutes : String(minutes)
      }:${stringifiedSeconds}${
        showMilliseconds ? millisecondsFormat + stringifiedMilliseconds : ""
      }`
    : `${padStart ? String(seconds).padStart(1, "0") : String(seconds)}${
        showMilliseconds ? millisecondsFormat + stringifiedMilliseconds : ""
      }`;
}

export function calculatePenaltySolveTime(solve: SolveData): number {
  return solve.penaltyState === "DNF"
    ? DNF_VALUE
    : solve.penaltyState === "+2"
    ? solve.solveTime + penaltySolveTime
    : solve.solveTime;
}
