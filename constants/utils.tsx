import {
  PenaltyState,
  SolveData,
  Subset3x3ScrambleCategory,
  WCAScrambleCategory,
} from "@/types/types";
import {
  DNF_VALUE,
  penaltySolveTime,
  penaltyStates,
  subset3x3Data,
  UNKNOWN,
  WCAScrData,
} from "./constants";

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

const statsToTimeFormat = [
  "ao3",
  "ao5",
  "ao12",
  "ao50",
  "ao100",
  "ao1000",
  "best",
  "bestTime",
  "worstTime",
  "mean",
  "totalTime",
];
const invalidTimes = [Infinity, -Infinity, UNKNOWN, UNKNOWN / 1000];

export function parseStat(solveTime: number, key: string): string {
  return solveTime === DNF_VALUE
    ? "DNF"
    : invalidTimes.includes(solveTime)
    ? "--"
    : statsToTimeFormat.includes(key)
    ? convertCubingTime(solveTime, ".", true, true)
    : solveTime.toString();
}

export function isPenaltyState(value: string): value is PenaltyState {
  return (penaltyStates as readonly string[]).includes(value);
}

export function isWCAScrambleCode(
  value: string,
): value is WCAScrambleCategory["scrambleCode"] {
  for (const scrambleData of WCAScrData) {
    if (value === scrambleData.scrambleCode) return true;
  }
  return false;
}

export function isSubsetScrambleCode(
  value: string,
): value is Subset3x3ScrambleCategory["scrambleCode"] {
  for (const scrambleData of subset3x3Data) {
    if (value === scrambleData.scrambleCode) return true;
  }
  return false;
}
