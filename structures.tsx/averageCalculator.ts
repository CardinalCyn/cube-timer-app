import { DNF_VALUE } from "@/constants/constants";
import { AverageComponent } from "./average";

/**
 * A summary of the average of the most recently added times. All times are provided in an
 * array and the calculated average, best time and worst time are identified, if appropriate.
 */
export class AverageOfN {
  /**
   * The array of values that contributed to the calculation of the average-of-N. If too few
   * values have been recorded (less than "N"), the array will be null. The times
   * will be ordered with the oldest recorded time first.
   */
  private readonly times: number[] | null;

  /**
   * The total sum of the upper-trim of the calculated times. May be DNF if there are too
   * many DNF solves, or UNKNOWN if there are too few times (less than "N").
   */
  private upperTrimSum: number;

  /**
   * The total sum of the middle-trim of the calculated times. May be DNF if there are too
   * many DNF solves, or UNKNOWN if there are too few times (less than "N").
   */
  private middleTrimSum: number;

  /**
   * The total sum of the lower-trim of the calculated times. May be DNF if there are too
   * many DNF solves, or UNKNOWN if there are too few times (less than "N").
   */
  private lowerTrimSum: number;

  /**
   * The index within times of the best time. The index will be -1 if that array is
   * null, or if the average calculation for the value of "N" does not eliminate the
   * best time, or if all of the times are DNFs, or if DNFs do not cause disqualification,
   * but there is only one non-DNF time recorded.
   */
  private readonly bestTimeIndex: number;

  /**
   * The index within times of the worst time. The index will be -1 if that array is
   * null, or if the average calculation for the value of "N" does not eliminate the
   * best time, or if all of the times are DNFs. The worst time may be a DNF.
   */
  private readonly worstTimeIndex: number;

  /**
   * The average-of-N value calculated for the times. May be DNF if there are too
   * many DNF solves, or UNKNOWN if there are too few times (less than "N").
   */
  private readonly average: number;

  /**
   * Creates a new record of the most recent "average-of-N" recorded by an average calculator.
   */
  constructor(ac: AverageCalculator) {
    const n = ac.getN();

    this.average = ac.getCurrentAverage();
    this.upperTrimSum = ac.upperTrim.getSum();
    this.middleTrimSum = ac.middleTrim.getSum();
    this.lowerTrimSum = ac.lowerTrim.getSum();

    if (this.average !== AverageCalculator.UNKNOWN && ac.getNumSolves() >= n) {
      this.times = new Array(n);

      // The oldest time recorded in ac.times is not necessarily the first one, as
      // that array operates as a circular queue. ac.next marks one index past the
      // last added time. However, the array should be full, so this should also be the
      // index of the first (oldest) time.
      const oldestIndex = ac.next === n ? 0 : ac.next;

      // Copy array segments
      for (let i = 0; i < n - oldestIndex; i++) {
        this.times[i] = ac.times[oldestIndex + i];
      }
      for (let i = 0; i < oldestIndex; i++) {
        this.times[n - oldestIndex + i] = ac.times[i];
      }

      let bestIdx = -1;
      let worstIdx = -1;

      if (
        n >= AverageCalculator.MIN_N_TO_ALLOW_ONE_DNF &&
        n > ac.numCurrentDNFs
      ) {
        const bestTime =
          n - ac.numCurrentDNFs > 1
            ? ac.currentBestTime
            : AverageCalculator.UNKNOWN;
        const worstTime =
          ac.numCurrentDNFs === 0 ? ac.currentWorstTime : AverageCalculator.DNF;

        for (let i = 0; i < n && (bestIdx === -1 || worstIdx === -1); i++) {
          if (bestIdx === -1 && this.times[i] === bestTime) {
            bestIdx = i;
          } else if (worstIdx === -1 && this.times[i] === worstTime) {
            worstIdx = i;
          }
        }
      }

      this.bestTimeIndex = bestIdx;
      this.worstTimeIndex = worstIdx;
    } else {
      this.times = null;
      this.bestTimeIndex = -1;
      this.worstTimeIndex = -1;
    }
  }

  getTimes(): number[] | null {
    return this.times;
  }

  getAverage(): number {
    return this.average;
  }

  getBestTimeIndex(): number {
    return this.bestTimeIndex;
  }

  getWorstTimeIndex(): number {
    return this.worstTimeIndex;
  }

  getUpperTrimSum(): number {
    return this.upperTrimSum;
  }

  getMiddleTrimSum(): number {
    return this.middleTrimSum;
  }

  getLowerTrimSum(): number {
    return this.lowerTrimSum;
  }
}

/**
 * Calculates the average time of a number of puzzle solves. Running averages are easily calculated
 * as each new solve is added. If the number of solve times is five or greater, the best and worst
 * times are discarded before returning the truncated arithmetic mean (aka "trimmed mean" or
 * "modified mean) of the remaining times. All times and averages are in milliseconds. The mean,
 * minimum (best) and maximum (worst) of all added times, and the best average from all values of
 * the running average are also made available.
 */
export class AverageCalculator {
  /**
   * A special time value that represents a solve that "did-not-finish" (DNF). This is also used
   * to represent the calculated value of an average where too many solves included in the
   * average were DNF solves.
   */
  public static readonly DNF = DNF_VALUE;

  /**
   * A value that indicates that a calculated time is unknown. This is usually the case when not
   * enough times have been recorded to satisfy the required number of solves to be included in
   * the calculation of the average, or when all recorded solves are DNFs.
   */
  public static readonly UNKNOWN = -666;

  /**
   * The minimum number of times to include in the average before a single DNF will not result
   * in disqualification.
   */
  public static readonly MIN_N_TO_ALLOW_ONE_DNF = 5;

  /**
   * The number of solve times to include in the average.
   */
  private readonly n: number;

  /**
   * Indicates if averages should be reported as DNFs if too many solve times are DNFs.
   * The number of DNFs that constitute "too many" varies with the value of n.
   */
  private readonly disqualifyDNFs: boolean;

  /**
   * The array holding the most recently added solve times. A solve time can also be recorded as
   * a DNF. This is managed as a circular queue. Once full, the oldest added time is
   * overwritten when the next new time is added.
   */
  public readonly times: number[];

  public upperTrim: AverageComponent;
  public middleTrim: AverageComponent;
  public lowerTrim: AverageComponent;
  private lowerTrimBound: number;
  private upperTrimBound: number;
  private trimSize: number;

  /**
   * The index in times at which to add the next time. If this is equal to the length
   * of the array, it will be wrapped back to zero.
   */
  public next: number = 0;

  /**
   * The total number of solve times that have been added to the array. This may exceed
   * n, but no more than that number of solve times will be stored at any one time.
   */
  private numSolves: number = 0;

  /**
   * The number of DNF results currently recorded in times.
   */
  public numCurrentDNFs: number = 0;

  /**
   * The maximum number of DNFs that can be contained in times
   * before the whole average is considered a DNF
   */
  private numAcceptableDNFs: number;

  /**
   * The number of DNF results ever recorded in times.
   */
  private numAllTimeDNFs: number = 0;

  /**
   * The Welford algorithm for variance is one of the most well-known and used online methods of
   * calculating the variance of a given sample data.
   */
  private mean: number = 0;
  private varianceDelta: number = 0;
  private varianceDelta2: number = 0;
  private varianceM2: number = 0;

  /**
   * The current variance of all solves ever recorded. A value of UNKNOWN indicates
   * the sample size is not enough for it to be calculated yet.
   */
  private variance: number = AverageCalculator.UNKNOWN;

  /**
   * The sum of all non-DNF results currently recorded in times.
   */
  private currentSum: number = AverageCalculator.UNKNOWN;

  /**
   * The sum of all non-DNF results ever recorded in times.
   */
  private allTimeSum: number = AverageCalculator.UNKNOWN;

  /**
   * The best time currently recorded in times.
   */
  public currentBestTime: number = AverageCalculator.UNKNOWN;

  /**
   * The worst time (not a DNF) currently recorded in times.
   */
  public currentWorstTime: number = AverageCalculator.UNKNOWN;

  /**
   * The current average value calculated from all times stored in times.
   */
  private currentAverage: number = AverageCalculator.UNKNOWN;

  /**
   * The best time ever added to this calculator.
   */
  private allTimeBestTime: number = AverageCalculator.UNKNOWN;

  /**
   * The worst time (not a DNF) ever added to this calculator.
   */
  private allTimeWorstTime: number = AverageCalculator.UNKNOWN;

  /**
   * The best average value calculated from all times added to date.
   */
  private allTimeBestAverage: number = AverageCalculator.UNKNOWN;

  /**
   * Creates a new calculator for the "average of n" solve times.
   */
  constructor(n: number, trimPercent: number) {
    if (n <= 0) {
      throw new Error(`Number of solves must be > 0: ${n}`);
    }

    this.n = n;
    this.times = new Array(n);
    this.disqualifyDNFs = true;

    this.trimSize = Math.ceil(n * (trimPercent / 100));
    this.numAcceptableDNFs = this.trimSize;
    this.lowerTrimBound = this.trimSize;
    this.upperTrimBound = n - this.trimSize;

    this.upperTrim = new AverageComponent();
    this.middleTrim = new AverageComponent();
    this.lowerTrim = new AverageComponent();

    this.reset();
  }

  /**
   * Resets all statistics and averages that have been collected previously.
   */
  public reset(): void {
    this.times.fill(0);
    this.next = 0;
    this.numSolves = 0;
    this.numCurrentDNFs = 0;
    this.numAllTimeDNFs = 0;

    this.mean = 0;
    this.varianceDelta = 0;
    this.varianceDelta2 = 0;
    this.varianceM2 = 0;

    this.middleTrim = new AverageComponent();
    this.lowerTrim = new AverageComponent();
    this.upperTrim = new AverageComponent();

    this.currentSum = AverageCalculator.UNKNOWN;
    this.allTimeSum = AverageCalculator.UNKNOWN;
    this.currentBestTime = AverageCalculator.UNKNOWN;
    this.currentWorstTime = AverageCalculator.UNKNOWN;
    this.currentAverage = AverageCalculator.UNKNOWN;
    this.allTimeBestTime = AverageCalculator.UNKNOWN;
    this.allTimeWorstTime = AverageCalculator.UNKNOWN;
    this.allTimeBestAverage = AverageCalculator.UNKNOWN;
    this.variance = AverageCalculator.UNKNOWN;
  }

  /**
   * Gets the number of solve times that are included in the average.
   */
  public getN(): number {
    return this.n;
  }

  /**
   * Adds a solve time to be included in the calculation of the average.
   */
  public addTime(time: number): void {
    if (time <= 0 && time !== AverageCalculator.DNF) {
      console.error(`Time must be > 0 or be 'DNF': ${time}`);
      return;
    }

    this.numSolves++;

    let ejectedTime: number;

    if (this.numSolves >= this.n) {
      if (this.next === this.n) {
        this.next = 0;
      }
      ejectedTime = this.times[this.next];

      if (this.numSolves === this.n) {
        this.times[this.next] = time;

        const sortedTimes = [...this.times].sort((a, b) => a - b);

        let count = 0;
        for (const solve of sortedTimes) {
          if (count < this.lowerTrimBound) {
            this.lowerTrim.put(solve);
          } else if (count >= this.upperTrimBound) {
            this.upperTrim.put(solve);
          } else {
            this.middleTrim.put(solve);
          }
          count++;
        }
      }
    } else {
      ejectedTime = AverageCalculator.UNKNOWN;
    }

    this.times[this.next] = time;
    this.next++;

    this.updateDNFCounts(time, ejectedTime);
    this.updateCurrentBestAndWorstTimes(time, ejectedTime);
    this.updateSums(time, ejectedTime);
    this.updateCurrentTrims(time, ejectedTime);
    this.updateVariance(time);
    this.updateCurrentAverage();

    this.updateAllTimeBestAndWorstTimes();
    this.updateAllTimeBestAverage();
  }

  /**
   * Adds multiple solve times to be included in the calculation of the average.
   */
  public addTimes(...times: number[]): void {
    for (const time of times) {
      this.addTime(time);
    }
  }

  private updateDNFCounts(addedTime: number, ejectedTime: number): void {
    if (addedTime === AverageCalculator.DNF) {
      this.numCurrentDNFs++;
      this.numAllTimeDNFs++;
    }

    if (ejectedTime === AverageCalculator.DNF) {
      this.numCurrentDNFs--;
    }
  }

  private updateCurrentBestAndWorstTimes(
    addedTime: number,
    ejectedTime: number,
  ): void {
    if (addedTime === AverageCalculator.DNF) {
      if (
        ejectedTime === this.currentBestTime ||
        ejectedTime === this.currentWorstTime
      ) {
        this.currentBestTime = AverageCalculator.UNKNOWN;
        this.currentWorstTime = AverageCalculator.UNKNOWN;
      }
    } else {
      if (
        this.currentBestTime === AverageCalculator.UNKNOWN ||
        addedTime <= this.currentBestTime
      ) {
        this.currentBestTime = addedTime;
      } else if (ejectedTime === this.currentBestTime) {
        this.currentBestTime = AverageCalculator.UNKNOWN;
      }

      if (
        this.currentWorstTime === AverageCalculator.UNKNOWN ||
        addedTime >= this.currentWorstTime
      ) {
        this.currentWorstTime = addedTime;
      } else if (ejectedTime === this.currentWorstTime) {
        this.currentWorstTime = AverageCalculator.UNKNOWN;
      }
    }

    const numCurrentSolves = Math.min(this.numSolves, this.n);

    if (
      this.numCurrentDNFs !== numCurrentSolves &&
      (this.currentBestTime === AverageCalculator.UNKNOWN ||
        this.currentWorstTime === AverageCalculator.UNKNOWN)
    ) {
      this.currentBestTime = Number.MAX_SAFE_INTEGER;
      this.currentWorstTime = 0;

      for (let i = 0; i < numCurrentSolves; i++) {
        const time = this.times[i];
        if (time !== AverageCalculator.DNF) {
          this.currentBestTime = Math.min(this.currentBestTime, time);
          this.currentWorstTime = Math.max(this.currentWorstTime, time);
        }
      }
    }
  }

  private updateCurrentTrims(addedTime: number, ejectedTime: number): void {
    if (this.numSolves > this.n && this.lowerTrimBound > 0) {
      // Ejected time belongs to lower trim
      if (ejectedTime <= this.lowerTrim.getGreatest()) {
        this.lowerTrim.remove(ejectedTime);

        if (addedTime <= this.middleTrim.getLeast()) {
          this.lowerTrim.put(addedTime);
        } else if (addedTime >= this.upperTrim.getLeast()) {
          this.lowerTrim.put(this.middleTrim.getLeast());
          this.middleTrim.remove(this.middleTrim.getLeast());
          this.middleTrim.put(this.upperTrim.getLeast());
          this.upperTrim.remove(this.upperTrim.getLeast());
          this.upperTrim.put(addedTime);
        } else {
          this.lowerTrim.put(this.middleTrim.getLeast());
          this.middleTrim.remove(this.middleTrim.getLeast());
          this.middleTrim.put(addedTime);
        }
      }
      // Ejected time belongs to upper trim
      else if (ejectedTime >= this.upperTrim.getLeast()) {
        this.upperTrim.remove(ejectedTime);

        if (addedTime >= this.middleTrim.getGreatest()) {
          this.upperTrim.put(addedTime);
        } else if (addedTime <= this.lowerTrim.getGreatest()) {
          this.upperTrim.put(this.middleTrim.getGreatest());
          this.middleTrim.remove(this.middleTrim.getGreatest());
          this.middleTrim.put(this.lowerTrim.getGreatest());
          this.lowerTrim.remove(this.lowerTrim.getGreatest());
          this.lowerTrim.put(addedTime);
        } else {
          this.upperTrim.put(this.middleTrim.getGreatest());
          this.middleTrim.remove(this.middleTrim.getGreatest());
          this.middleTrim.put(addedTime);
        }
      }
      // Ejected time belongs to middle trim
      else {
        this.middleTrim.remove(ejectedTime);

        if (addedTime >= this.upperTrim.getLeast()) {
          this.middleTrim.put(this.upperTrim.getLeast());
          this.upperTrim.remove(this.upperTrim.getLeast());
          this.upperTrim.put(addedTime);
        } else if (addedTime <= this.lowerTrim.getGreatest()) {
          this.middleTrim.put(this.lowerTrim.getGreatest());
          this.lowerTrim.remove(this.lowerTrim.getGreatest());
          this.lowerTrim.put(addedTime);
        } else {
          this.middleTrim.put(addedTime);
        }
      }
    } else if (this.numSolves > this.n) {
      this.middleTrim.remove(ejectedTime);
      this.middleTrim.put(addedTime);
    }
  }

  private updateSums(addedTime: number, ejectedTime: number): void {
    if (addedTime !== AverageCalculator.DNF) {
      this.currentSum =
        addedTime +
        (this.currentSum === AverageCalculator.UNKNOWN ? 0 : this.currentSum);
      this.allTimeSum =
        addedTime +
        (this.allTimeSum === AverageCalculator.UNKNOWN ? 0 : this.allTimeSum);
    }
    if (
      ejectedTime !== AverageCalculator.DNF &&
      ejectedTime !== AverageCalculator.UNKNOWN
    ) {
      this.currentSum -= ejectedTime;
    }

    if (this.currentSum === 0) {
      this.currentSum = AverageCalculator.UNKNOWN;
    }
  }

  private updateVariance(addedTime: number): void {
    const totalValidSolves = this.numSolves - this.numAllTimeDNFs;
    if (addedTime !== AverageCalculator.DNF) {
      this.varianceDelta = addedTime - this.mean;
      this.mean += this.varianceDelta / totalValidSolves;
      this.varianceDelta2 = addedTime - this.mean;
      this.varianceM2 += this.varianceDelta * this.varianceDelta2;
    }
    if (totalValidSolves > 2) {
      this.variance = this.varianceM2 / (totalValidSolves - 1);
    }
  }

  private updateCurrentAverage(): void {
    if (this.numSolves < this.n) {
      this.currentAverage = AverageCalculator.UNKNOWN;
    } else if (this.numCurrentDNFs === this.n) {
      this.currentAverage = AverageCalculator.DNF;
    } else if (!this.disqualifyDNFs && this.numCurrentDNFs === this.n - 1) {
      this.currentAverage = this.currentBestTime;
    } else if (this.n >= AverageCalculator.MIN_N_TO_ALLOW_ONE_DNF) {
      if (this.disqualifyDNFs && this.numCurrentDNFs > this.numAcceptableDNFs) {
        this.currentAverage = AverageCalculator.DNF;
      } else {
        this.currentAverage = Math.floor(
          this.middleTrim.getSum() /
            (this.n -
              this.trimSize * 2 -
              (this.numCurrentDNFs > 1 ? this.numCurrentDNFs - 1 : 0)),
        );
      }
    } else {
      if (this.disqualifyDNFs && this.numCurrentDNFs > 0) {
        this.currentAverage = AverageCalculator.DNF;
      } else {
        this.currentAverage = Math.floor(
          this.currentSum / (this.n - this.numCurrentDNFs),
        );
      }
    }
  }

  private updateAllTimeBestAndWorstTimes(): void {
    if (this.allTimeBestTime === AverageCalculator.UNKNOWN) {
      this.allTimeBestTime = this.currentBestTime;
    } else if (this.currentBestTime !== AverageCalculator.UNKNOWN) {
      this.allTimeBestTime = Math.min(
        this.allTimeBestTime,
        this.currentBestTime,
      );
    }

    if (this.allTimeWorstTime === AverageCalculator.UNKNOWN) {
      this.allTimeWorstTime = this.currentWorstTime;
    } else if (this.currentWorstTime !== AverageCalculator.UNKNOWN) {
      this.allTimeWorstTime = Math.max(
        this.allTimeWorstTime,
        this.currentWorstTime,
      );
    }
  }

  private updateAllTimeBestAverage(): void {
    if (
      this.allTimeBestAverage === AverageCalculator.UNKNOWN ||
      this.allTimeBestAverage === AverageCalculator.DNF
    ) {
      this.allTimeBestAverage = this.currentAverage;
    } else if (this.currentAverage !== AverageCalculator.DNF) {
      this.allTimeBestAverage = Math.min(
        this.allTimeBestAverage,
        this.currentAverage,
      );
    }
  }

  /**
   * Gets the current value of the average.
   */
  public getCurrentAverage(): number {
    return this.currentAverage;
  }

  /**
   * Gets the best value of the average.
   */
  public getBestAverage(): number {
    return this.allTimeBestAverage;
  }

  /**
   * Gets the best time of all those added to this calculator.
   */
  public getBestTime(): number {
    return this.allTimeBestTime;
  }

  /**
   * Gets the worst time (not a DNF) of all those added to this calculator.
   */
  public getWorstTime(): number {
    return this.allTimeWorstTime;
  }

  /**
   * Gets the total number of solve times (including DNFs) that were added to this calculator.
   */
  public getNumSolves(): number {
    return this.numSolves;
  }

  /**
   * Gets the total number of DNF solves that were added to this calculator.
   */
  public getNumDNFSolves(): number {
    return this.numAllTimeDNFs;
  }

  /**
   * Gets the total time of all non-DNF solves that were added to this calculator.
   */
  public getTotalTime(): number {
    return this.allTimeSum;
  }

  /**
   * Gets the current Sample Standard Deviation of all non-DNF solves that were added to this
   * calculator
   */
  public getStandardDeviation(): number {
    return this.variance !== AverageCalculator.UNKNOWN
      ? Math.floor(Math.sqrt(this.variance))
      : AverageCalculator.UNKNOWN;
  }

  /**
   * Gets the simple arithmetic mean time of all non-DNF solves that were added to this
   * calculator. The returned millisecond value is truncated to a whole milliseconds value, not
   * rounded.
   */
  public getMeanTime(): number {
    return this.mean !== 0 ? Math.floor(this.mean) : AverageCalculator.UNKNOWN;
  }

  /**
   * Captures the details of the average-of-N calculation including the most recently added time.
   */
  public getAverageOfN(): AverageOfN {
    return new AverageOfN(this);
  }

  /**
   * Translates a time value that may be UNKNOWN or DNF into a time value
   * that is compatible with display methods.
   */
  public static tr(time: number): number {
    if (time === AverageCalculator.UNKNOWN) {
      return 0;
    }
    if (time === AverageCalculator.DNF) {
      return -1; // Assuming -1 represents DNF in display
    }
    return time;
  }
}
