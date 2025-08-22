import { allValidPuzzleCodes } from "@/constants/constants";
import { generateScramble } from "@/constants/utils";
import { ValidPuzzleCode } from "@/types/types";

const cacheSize = 5;

export class ScrambleGenerator {
  private scrambleCache: { [K in ValidPuzzleCode]: string[] };
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize empty cache
    this.scrambleCache = Object.fromEntries(
      allValidPuzzleCodes.map((code) => [code, []]),
    ) as { [K in ValidPuzzleCode]: [] };

    this.initializeCache();
  }

  private initializeCache() {
    //generating each of these scrambles is very intense for stuff like 4x4x4, etc
    for (const puzzleCode of allValidPuzzleCodes)
      for (let i = 0; i < cacheSize; i++)
        this.scrambleCache[puzzleCode].push(generateScramble(puzzleCode));
  }

  getScrambleByPuzzleCode(puzzleCode: ValidPuzzleCode): string {
    const popped = this.scrambleCache[puzzleCode].pop();
    if (popped) return popped;
    while (this.scrambleCache[puzzleCode].length < cacheSize)
      this.scrambleCache[puzzleCode].push(generateScramble(puzzleCode));

    return generateScramble(puzzleCode);
  }
}
