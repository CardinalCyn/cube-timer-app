import { allValidPuzzleCodes } from "@/constants/constants";
import { generateScramble } from "@/constants/utils";
import { ValidPuzzleCode } from "@/types/types";

// Scramble cache configuration
const CACHE_SIZE = 10; // Number of scrambles to pre-generate per puzzle type
const MIN_CACHE_SIZE = 3; // Refill cache when it drops below this

export class ScrambleGenerator {
  private scrambleCache: { [K in ValidPuzzleCode]: string[] };
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize empty cache
    this.scrambleCache = Object.fromEntries(
      allValidPuzzleCodes.map((code) => [code, []]),
    ) as { [K in ValidPuzzleCode]: [] };

    // Start initialization but don't await it in constructor
    this.initializationPromise = this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    console.log("Initializing scramble cache...");

    for (const puzzleCode of allValidPuzzleCodes) {
      try {
        // Generate initial batch of scrambles
        const promises = Array(CACHE_SIZE)
          .fill(null)
          .map(() => this.generateScrambleAsync(puzzleCode));

        const scrambles = await Promise.all(promises);
        this.scrambleCache[puzzleCode] = scrambles;
        console.log(
          `Generated ${scrambles.length} scrambles for ${puzzleCode}`,
        );
      } catch (error) {
        console.error(`Failed to generate scrambles for ${puzzleCode}:`, error);
      }
    }

    this.isInitialized = true;
    console.log("Scramble cache initialized");
  }

  // Public method to wait for initialization
  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  // Check if cache is ready
  get isReady(): boolean {
    return this.isInitialized;
  }

  private generateScrambleAsync(puzzleCode: ValidPuzzleCode): Promise<string> {
    return new Promise((resolve) => {
      setImmediate(() => {
        const scramble = generateScramble(puzzleCode);
        resolve(scramble);
      });
    });
  }

  // Get next scramble from cache and refill if needed
  getNextScramble(puzzleCode: ValidPuzzleCode): string {
    if (!this.isInitialized) {
      console.warn(
        "Cache not yet initialized, generating scramble synchronously",
      );
      return generateScramble(puzzleCode);
    }

    if (
      !this.scrambleCache[puzzleCode] ||
      this.scrambleCache[puzzleCode].length === 0
    ) {
      // Fallback: generate one immediately if cache is empty
      console.warn(
        `Cache empty for ${puzzleCode}, generating fallback scramble`,
      );
      return generateScramble(puzzleCode);
    }

    const scramble = this.scrambleCache[puzzleCode].shift()!;

    // Refill cache if running low (do this asynchronously)
    if (this.scrambleCache[puzzleCode].length < MIN_CACHE_SIZE) {
      this.refillCache(puzzleCode);
    }

    return scramble;
  }

  private async refillCache(puzzleCode: ValidPuzzleCode): Promise<void> {
    const currentSize = this.scrambleCache[puzzleCode]?.length || 0;
    const neededScrambles = CACHE_SIZE - currentSize;

    if (neededScrambles <= 0) return;

    console.log(
      `Refilling cache for ${puzzleCode}, adding ${neededScrambles} scrambles`,
    );

    const promises = Array(neededScrambles)
      .fill(null)
      .map(() => this.generateScrambleAsync(puzzleCode));

    try {
      const newScrambles = await Promise.all(promises);
      if (!this.scrambleCache[puzzleCode]) {
        this.scrambleCache[puzzleCode] = [];
      }
      this.scrambleCache[puzzleCode].push(...newScrambles);
      console.log(
        `Cache refilled for ${puzzleCode}, now has ${this.scrambleCache[puzzleCode].length} scrambles`,
      );
    } catch (error) {
      console.error(`Failed to refill cache for ${puzzleCode}:`, error);
    }
  }

  // Optional: Method to get cache stats for debugging
  getCacheStats(): { [K in ValidPuzzleCode]: number } {
    return Object.fromEntries(
      allValidPuzzleCodes.map((code) => [
        code,
        this.scrambleCache[code]?.length || 0,
      ]),
    ) as { [K in ValidPuzzleCode]: number };
  }
}
