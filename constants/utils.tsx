import {
  PenaltyState,
  Subset3x3ScrambleCategory,
  ValidPuzzleCode,
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

export function calculatePenaltySolveTime(
  solveTime: number,
  penaltyState: PenaltyState,
): number {
  return penaltyState === "DNF"
    ? DNF_VALUE
    : penaltyState === "+2"
    ? solveTime + penaltySolveTime
    : solveTime;
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
    : solveTime.toFixed(2).toString();
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

export function generateScramble(scrambleCode: ValidPuzzleCode): string {
  try {
    // const scrambleFuncMap: { [K in ValidPuzzleCode]: string } = {
    //   "333": scramble_333.getAnyScramble(
    //     0xffffffffffff,
    //     0xffffffffffff,
    //     0xffffffff,
    //     0xffffffff,
    //   ),
    //   "222so": scramble_222.getScramble("222so"),
    //   "444wca": scramble_444.getRandomScramble(),
    //   "555wca":
    //     megascramble.megascramble("555wca", 60) || "Issue with generating 555",
    //   "666wca":
    //     megascramble.megascramble("666wca", 80) || "Issue with generating 666",
    //   "777wca":
    //     megascramble.megascramble("666wca", 100) || "Issue with generating 777",
    //   clkwca: clock.getScramble(),
    //   mgmp: utilscramble.utilscramble("mgmp", 70),
    //   pyrso: pyraminx.getScramble("pyrso"),
    //   skbso: skewb.getScramble("skbso"),
    //   sqrs: sq1.getRandomScramble(),
    //   "2gen": scramble_333.subsetScramble(["U", "R"]),
    //   "2genl": scramble_333.subsetScramble(["U", "L"]),
    //   roux: scramble_333.subsetScramble(["M", "U"]),
    //   "3gen_F": scramble_333.subsetScramble(["U", "R", "F"]),
    //   "3gen_L": scramble_333.subsetScramble(["U", "R", "L"]),
    //   RrU: scramble_333.subsetScramble(["R", "Rw", "U"]),
    //   "333drud": scramble_333.subsetScramble([
    //     "U",
    //     "R2",
    //     "F2",
    //     "D",
    //     "L2",
    //     "B2",
    //   ]),
    //   half: scramble_333.subsetScramble(["U2", "R2", "F2", "D2", "L2", "B2"]),
    //   lsll: scramble_333.getLSLLScramble(),
    // };
    // return scrambleFuncMap[scrambleCode];

    // return cstimer_module.getScramble(scrambleCode);

    return "random scramble" + Math.random();
  } catch (err) {
    console.error(err);
    return "Issue with scramble creator";
  }
}

export function hslToHex(hslString: string): string {
  const values = hslString.match(/\d+/g);
  if (!values || values.length < 3) return hslString;

  const h = parseInt(values[0]) / 360;
  const s = parseInt(values[1]) / 100;
  const l = parseInt(values[2]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `#${Math.round(r * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round(g * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round(b * 255)
    .toString(16)
    .padStart(2, "0")}`;
}
