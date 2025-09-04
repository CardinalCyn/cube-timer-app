import { DNF_VALUE, UNKNOWN } from "@/constants/constants";
import { AverageComponent } from "./average";

/**
 * Calculates the average time of a number of puzzle solves. Running averages are easily calculated
 * as each new solve is added. If the number of solve times is five or greater, the best and worst
 * times are discarded before returning the truncated arithmetic mean (aka "trimmed mean" or
 * "modified mean) of the remaining times. All times and averages are in milliseconds. The mean,
 * minimum (best) and maximum (worst) of all added times, and the best average from all values of
 * the running average are also made available.
 *
 */
export class AverageCalculator {
  // NOTE: This implementation is reasonably efficient, as it can calculate an average without
  // iterating over the array of recorded times. Iteration is only required when the known best
  // or worst values are ejected to make room for new times. Storing times in sorted order would
  // reduce this explicit iteration, but a second data structure would be required to record the
  // insertion order and the insertion operations would be more costly, as the sort order would
  // need to be maintained.
  //
  // Discarding only the single best and single worst values is standard for average-of-5
  // calculations, but for higher values of "n", it might be better to exclude, say, the best 10%
  // and worst 10%. However, that would make the implementation significantly more complicated if
  // arrays of best and worst values (or the limits of the ranges of each set of values and the
  // sums of those sets) were to be maintained. One approach might be to support calculation of
  // the median value instead, which would be relatively simple to do: sort the times, eliminate
  // the allowed DNFs and then find the time value in the middle position of the remaining times
  // in their sorted order (or the mean of the two middle values, if there are an even number of
  // remaining times).
  //
  // There are several alternative "streaming" algorithms that would not require the times to
  // be stored. However, all of those would introduce some amount of error due to rounding or
  // precision errors. As the largest value of "n" is likely to be 1,000, the approach used here
  // should be good enough and not use memory excessively.

  /**
   * A special time value that represents a solve that "did-not-finish" (DNF). This is also used
   * to represent the calculated value of an average where too many solves included in the
   * average were DNF solves.
   */
  // Deliberately avoiding using "PuzzleUtils.TIME_DNF" as the canonical flag value, as there is
  // no guarantee that it will remain with its current value of "-1" and this class needs to be
  // sure that the value will be negative and will not clash with "UNKNOWN". If changing these,
  // use values that can also be represented as in "int".

  /**
   * A value that indicates that a calculated time is unknown. This is usually the case when not
   * enough times have been recorded to satisfy the required number of solves to be included in
   * the calculation of the average, or when all recorded solves are {@link #DNF}s.
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
  private mN: number;

  /**
   * Indicates if averages should be reported as {@link #DNF}s if too many solve times are DNFs.
   * The number of DNFs that constitute "too many" varies with the value of {@link #mN}.
   */
  private readonly mDisqualifyDNFs: boolean;

  /**
   * The array holding the most recently added solve times. A solve time can also be recorded as
   * a {@link #DNF}. This is managed as a circular queue. Once full, the oldest added time is
   * overwritten when the next new time is added.
   */
  private mTimes: number[];

  private mUpperTrim: AverageComponent;
  private mMiddleTrim: AverageComponent;
  private mLowerTrim: AverageComponent;
  private mLowerTrimBound: number;
  private mUpperTrimBound: number;
  private mTrimSize: number;

  /**
   * The index in {@link #mTimes} at which to add the next time. If this is equal to the length
   * of the array, it will be wrapped back to zero.
   */
  private mNext: number;

  /**
   * The total number of solve times that have been added to the array. This may exceed
   * {@link #mN}, but no more than that number of solve times will be stored at any one time.
   */
  private mNumSolves: number;

  /**
   * The number of DNF results currently recorded in {@code #mTimes}.
   */
  private mNumCurrentDNFs: number;

  /**
   * The maximum number of DNFs that can be contained in {@link #mTimes}
   * before the whole average is considered a DNF
   */
  private mNumAcceptableDNFs: number;

  /**
   * The number of DNF results ever recorded in {@code #mTimes}.
   */
  private mNumAllTimeDNFs: number;

  /**
   * The Welford algorithm for variance is one of the most well-known and used online methods of
   * calculating the variance of a given sample data. The algorithm itself has several
   * variables, which are listed here. I won't pretend to fully understand it myself, but there
   * are a lot of references online for it.
   */
  private mMean = 0;
  private mVarianceDelta = 0;
  private mVarianceDelta2 = 0;
  private mVarianceM2 = 0;

  /**
   * The current variance of all solves ever recorded. A value of {@link #UNKNOWN} indicates
   * the sample size is not enough for it to be calculated yet.
   */
  private mVariance: number;

  /**
   * The sum of all non-DNF results currently recorded in {@code #mTimes}. The number of such
   * results is given by {@code Math.min(mN, mNumSolves) - mNumCurrentDNFs}. A value of
   * {@link #UNKNOWN} indicates that there are no non-DNF results recorded.
   */
  private mCurrentSum: number;

  /**
   * The sum of all non-DNF results ever recorded in {@code #mTimes}. The number of such results
   * is given by {@code mNumSolves - mNumAllTimeDNFs}. A value of {@link #UNKNOWN} indicates
   * that there are no non-DNF results recorded.
   */
  private mAllTimeSum: number;

  /**
   * The best time currently recorded in {@code #mTimes}. A value of {@link #UNKNOWN} indicates
   * that there is no non-DNF result recorded.
   */
  private mCurrentBestTime: number;

  /**
   * The worst time (not a DNF) currently recorded in {@code #mTimes}. If any DNF is present, a
   * DNF will be taken instead as the worst time, if the calculation needs to exclude one. A
   * value of {@link #UNKNOWN} indicates that there is no non-DNF result recorded.
   */
  private mCurrentWorstTime: number;

  /**
   * The current average value calculated from all times stored in {@link #mTimes}. A value of
   * {@link #UNKNOWN} indicates insufficient results have been added to calculate the required
   * average, or that the calculation has not been performed. A value of {@link #DNF} indicates
   * that too many DNF results are present and the average is disqualified.
   */
  private mCurrentAverage: number;

  /**
   * The best time ever added to this calculator. This time may not currently be recorded in
   * {@code #mTimes}, as it may have been overwritten. A value of {@link #UNKNOWN} indicates that
   * there is no non-DNF result recorded.
   */
  private mAllTimeBestTime: number;

  /**
   * The worst time (not a DNF) ever added to this calculator. This time may not currently be
   * recorded in {@code #mTimes}, as it may have been overwritten. A value of {@link #UNKNOWN}
   * indicates that there is no non-DNF result recorded.
   */
  private mAllTimeWorstTime: number;

  /**
   * The best average value calculated from all times added to date. A value of {@link #UNKNOWN}
   * indicates that insufficient results have been added to calculate the required average. A
   * value of {@link #DNF} indicates that averages could be calculated, but that every average
   * was disqualified as a DNF average.
   */
  private mAllTimeBestAverage: number;

  /**
   * The best average is updated or not
   */
  private mIsAllTimeBestAverageUpdated = false;

  /**
   * Creates a new calculator for the "average of <i>n</i>" solve times.
   *
   * @param n
   *     The number of solve times that will be averaged (e.g., 3, 5, 12, ...). Must be greater
   *     than zero.
   *
   * @throws IllegalArgumentException
   *     If {@code n} is not greater than zero.
   */
  constructor(n: number, trimPercent: number) {
    if (n <= 0) {
      throw "Number of solves must be > 0: " + n;
    }

    this.mN = n;
    this.mTimes = new Array(n);
    this.mDisqualifyDNFs = true;

    this.mTrimSize = Math.ceil(this.mN * (trimPercent / 100));
    this.mNumAcceptableDNFs = this.mTrimSize;
    this.mLowerTrimBound = this.mTrimSize;
    this.mUpperTrimBound = this.mN - this.mTrimSize;

    this.mUpperTrim = new AverageComponent();
    this.mMiddleTrim = new AverageComponent();
    this.mLowerTrim = new AverageComponent();

    this.mTimes.fill(0);
    this.mNext = 0;
    this.mNumSolves = 0;
    this.mNumCurrentDNFs = 0;
    this.mNumAllTimeDNFs = 0;

    // Variance variables
    this.mMean = 0;
    this.mVarianceDelta = 0;
    this.mVarianceDelta2 = 0;
    this.mVarianceM2 = 0;

    this.mMiddleTrim = new AverageComponent();
    this.mLowerTrim = new AverageComponent();
    this.mUpperTrim = new AverageComponent();

    this.mCurrentSum = UNKNOWN;
    this.mAllTimeSum = UNKNOWN;
    this.mCurrentBestTime = UNKNOWN;
    this.mCurrentWorstTime = UNKNOWN;
    this.mCurrentAverage = UNKNOWN;
    this.mAllTimeBestTime = UNKNOWN;
    this.mAllTimeWorstTime = UNKNOWN;
    this.mAllTimeBestAverage = UNKNOWN;
    this.mVariance = UNKNOWN;
    this.mIsAllTimeBestAverageUpdated = false;
  }

  /**
   * Resets all statistics and averages that have been collected previously.
   */
  public reset() {
    this.mTimes.fill(0);
    this.mNext = 0;
    this.mNumSolves = 0;
    this.mNumCurrentDNFs = 0;
    this.mNumAllTimeDNFs = 0;

    // Variance variables
    this.mMean = 0;
    this.mVarianceDelta = 0;
    this.mVarianceDelta2 = 0;
    this.mVarianceM2 = 0;

    this.mMiddleTrim = new AverageComponent();
    this.mLowerTrim = new AverageComponent();
    this.mUpperTrim = new AverageComponent();

    this.mCurrentSum = UNKNOWN;
    this.mAllTimeSum = UNKNOWN;
    this.mCurrentBestTime = UNKNOWN;
    this.mCurrentWorstTime = UNKNOWN;
    this.mCurrentAverage = UNKNOWN;
    this.mAllTimeBestTime = UNKNOWN;
    this.mAllTimeWorstTime = UNKNOWN;
    this.mAllTimeBestAverage = UNKNOWN;
    this.mVariance = UNKNOWN;
    this.mIsAllTimeBestAverageUpdated = false;
  }

  /**
   * Gets the number of solve times that are included in the average. This is inclusive of any
   * times, such as the best and worst times, that are excluded when calculating the truncated
   * mean. For example, for an "average of 12", the best time and the worst time are trimmed
   * before getting the truncated arithmetic mean of the remaining 10 times, but this method
   * returns 12. This may be greater than the number of times added so far and given by
   * {@link #getNumSolves()}.
   *
   * @return The number of times that must be considered in the calculation of the average.
   */
  public getN(): number {
    return this.mN;
  }

  /**
   * Adds a solve time to be included in the calculation of the average. Solve times should be
   * added in chronological order (i.e., by solve time-stamp, not solve time).
   *
   * @param time
   *     The solve time in milliseconds. The time must be greater than zero. Use {@link #DNF} to
   *     represent a DNF solve.
   *
   * @throws IllegalArgumentException
   *     If the added time is not greater than zero and is not {@code DNF}.
   */
  public addTime(time: number): void {
    if (time <= 0 && time != DNF_VALUE) {
      // FIXME: throwing an IllegalArgumentException here is too harsh for the user. If the app
      // incorrectly imports an illegal solve, the app will keep crashing and the only way for
      // the user to fix this is to clear the app data. I'm commenting this off for the time
      // being until the import algorithm gets sorted out.
      // TODO: Should the app automatically remove illegal solves?

      console.error(
        "AverageCalculator",
        "Time must be > 0 or be 'DNF': " + time,
      );

      // throw new IllegalArgumentException("Time must be > 0 or be 'DNF': " + time);
    } else {
      this.mNumSolves++;

      let ejectedTime: number;

      // If the array has just been filled, store a sorted version of it
      // If the array is full, "mNext" points to the oldest result that needs to be ejected first.
      //      We also need to remove the oldest solve from the sorted array and insert the new solve
      // If the array is not full, then "mNext" points to an empty entry, so no special handling
      // is needed.
      if (this.mNumSolves >= this.mN) {
        if (this.mNext == this.mN) {
          // Need to wrap around to the start (index zero).
          this.mNext = 0;
        }
        ejectedTime = this.mTimes[this.mNext]; // May be DNF.

        // Create the sorted list as soon as numSolves reaches N
        // We only need to sort it once. Subsequent added solves will use
        // an algorithm to insert the new solves in the correct (sorted) position
        if (this.mNumSolves == this.mN) {
          this.mTimes[this.mNext] = time;

          // Sort this.mTimes
          const sortedTimes = [...this.mTimes].sort((a, b) => a - b);

          // Distribute the sorted times into the trims
          let count = 0;
          for (const solve of sortedTimes) {
            if (count < this.mLowerTrimBound) this.mLowerTrim.put(solve);
            else if (count >= this.mUpperTrimBound) this.mUpperTrim.put(solve);
            else this.mMiddleTrim.put(solve);
            count++;
          }
        }
      } else {
        // "this.mNext" must be less than "mN" if "mNumSolves" is less than "mN".
        ejectedTime = UNKNOWN; // Nothing ejected.
      }

      this.mTimes[this.mNext] = time;
      this.mNext++;

      //Log.d("AverageCalculator", "N: " + mN + " | Set: " + mSortedTimes);

      // Order is important here, as these methods change fields and some methods depend on the
      // fields being updated by other methods before they are called. All depend on the new
      // time being stored already (see above) and any ejected time being known (also above).
      this.updateDNFCounts(time, ejectedTime);
      this.updateCurrentBestAndWorstTimes(time, ejectedTime);
      this.updateSums(time, ejectedTime);
      this.updateCurrentTrims(time, ejectedTime);
      this.updateVariance(time);
      this.updateCurrentAverage();

      this.updateAllTimeBestAndWorstTimes();
      this.updateAllTimeBestAverage();
    }
  }

  /**
   * Adds solve times to be included in the calculation of the average. Solve times should be
   * added in chronological order (i.e., by solve time-stamp, not solve time). This method can be
   * called repeatedly to add any number of solve times over any number of calls.
   *
   * @param times
   *     Zero or more solve times in milliseconds. Times must be greater than zero. Use
   *     {@link #DNF} to represent each DNF. If this is {@code null} or empty, it will be ignored
   *     and this method will have no effect.
   *
   * @throws IllegalArgumentException
   *     If any added time is not greater than zero and is not {@code DNF}.
   */
  public addTimes(times: number[]) {
    // The variable arguments list makes it easier to write compact test cases; it does not
    // really make life any easier when adding times via a database cursor. In non-test
    // contexts, it will be more efficient to call "addTime", as each call will not need to
    // create a "long[]" object.
    if (times != null && times.length) {
      for (const time of times) {
        this.addTime(time); // May throw IAE.
      }
    }
  }

  /**
   * Updates the current and all-time counts of DNF solves.
   *
   * @param addedTime
   *     The newly added time. May be {@link #DNF}.
   * @param ejectedTime
   *     An old time that was ejected to make room for the newly added time. May be {@code DNF}.
   *     Use {@link #UNKNOWN} if no old time was ejected.
   */
  private updateDNFCounts(addedTime: number, ejectedTime: number): void {
    if (addedTime == DNF_VALUE) {
      this.mNumCurrentDNFs++;
      this.mNumAllTimeDNFs++;
    }

    if (ejectedTime == DNF_VALUE) {
      this.mNumCurrentDNFs--;
    }
  }

  /**
   * Updates the current best and worst times after a new time is added. The count of DNFs must
   * be updated by {@link #updateDNFCounts(long, long)} before calling this method.
   *
   * @param addedTime
   *     The newly added time. May be {@link #DNF}. Must already be stored.
   * @param ejectedTime
   *     An old time that was ejected to make room for the newly added time. May be {@code DNF}.
   *     Use {@link #UNKNOWN} if no old time was ejected.
   */
  private updateCurrentBestAndWorstTimes(
    addedTime: number,
    ejectedTime: number,
  ): void {
    // The logic here will set one or both of "mCurrentBestTime" and "mCurrentWorstTime" to
    // "UNKNOWN" if knowledge of the best or worst time has been lost. If either value becomes
    // "UNKNOWN", a new iteration over "mTimes" will recalculate both values.

    if (addedTime == DNF_VALUE) {
      // Newly added time does not change the current best or worst time, but has either of
      // the best or worst times (not a DNF) just been ejected and is recalculation required?
      if (
        ejectedTime == this.mCurrentBestTime ||
        ejectedTime == this.mCurrentWorstTime
      ) {
        // It does not matter which has been ejected, just recalculate both.
        this.mCurrentBestTime = UNKNOWN;
        this.mCurrentWorstTime = UNKNOWN;
      }
    } else {
      // Newly added time is not a DNF and may be the new best or worst time (or both).
      // However, if it is not the new (or equal) best or worst time, then check if we are
      // ejecting the old best or worst time. If either is ejected, there may be another best
      // or worst time in "mTimes" (with respect to "addedTime") and it must be found. There
      // if no need to check if "ejectedTime" is DNF or UNKNOWN.
      if (
        this.mCurrentBestTime == UNKNOWN ||
        addedTime <= this.mCurrentBestTime
      ) {
        this.mCurrentBestTime = addedTime;
      } else if (ejectedTime == this.mCurrentBestTime) {
        this.mCurrentBestTime = UNKNOWN;
      }

      if (
        this.mCurrentWorstTime == UNKNOWN ||
        addedTime >= this.mCurrentWorstTime
      ) {
        this.mCurrentWorstTime = addedTime;
      } else if (ejectedTime == this.mCurrentWorstTime) {
        this.mCurrentWorstTime = UNKNOWN;
      }
    }

    // Recalculate the best and worst times. We can skip this if every stored time is a DNF.
    // In that case, both "mCurrentBestTime" and "mCurrentWorstTime" will remain UNKNOWN.
    const numCurrentSolves = Math.min(this.mNumSolves, this.mN);

    if (
      this.mNumCurrentDNFs != numCurrentSolves &&
      (this.mCurrentBestTime == UNKNOWN || this.mCurrentWorstTime == UNKNOWN)
    ) {
      // At least one stored time is not a DNF and is > 0, so reset the fields and rescan.
      this.mCurrentBestTime = DNF_VALUE;
      this.mCurrentWorstTime = 0;

      // There is no need to follow the chronological insertion order here. The array may
      // not be full yet.
      for (let i = 0; i < numCurrentSolves; i++) {
        const time = this.mTimes[i];

        if (time != DNF_VALUE) {
          this.mCurrentBestTime = Math.min(this.mCurrentBestTime, time);
          this.mCurrentWorstTime = Math.max(this.mCurrentWorstTime, time);
        }
      }
    }
  }

  protected updateCurrentTrims(addedTime: number, ejectedTime: number): void {
    if (this.mNumSolves > this.mN && this.mLowerTrimBound > 0) {
      // Ejected time belongs to lower trim
      if (ejectedTime <= this.mLowerTrim.getGreatest()) {
        // Remove the ejected time
        this.mLowerTrim.remove(ejectedTime);

        if (addedTime <= this.mMiddleTrim.getLeast()) {
          // Added time belongs to lower trim
          this.mLowerTrim.put(addedTime);
        } else if (addedTime >= this.mUpperTrim.getLeast()) {
          // Added time belongs to upper trim
          // Move least elements to the left
          this.mLowerTrim.put(this.mMiddleTrim.getLeast());
          this.mMiddleTrim.remove(this.mMiddleTrim.getLeast());
          this.mMiddleTrim.put(this.mUpperTrim.getLeast());
          this.mUpperTrim.remove(this.mUpperTrim.getLeast());
          this.mUpperTrim.put(addedTime);
        } else {
          // Added time belongs to middle trim
          // Move least elements to the left
          this.mLowerTrim.put(this.mMiddleTrim.getLeast());
          this.mMiddleTrim.remove(this.mMiddleTrim.getLeast());
          this.mMiddleTrim.put(addedTime);
        }
      }

      // Ejected time belongs to upper trim
      else if (ejectedTime >= this.mUpperTrim.getLeast()) {
        // Remove the ejected time
        this.mUpperTrim.remove(ejectedTime);

        if (addedTime >= this.mMiddleTrim.getGreatest()) {
          // Added time belongs to upper trim
          this.mUpperTrim.put(addedTime);
        } else if (addedTime <= this.mLowerTrim.getGreatest()) {
          // Added time belongs to lower trim
          // Move greatest elements to right
          this.mUpperTrim.put(this.mMiddleTrim.getGreatest());
          this.mMiddleTrim.remove(this.mMiddleTrim.getGreatest());
          this.mMiddleTrim.put(this.mLowerTrim.getGreatest());
          this.mLowerTrim.remove(this.mLowerTrim.getGreatest());
          this.mLowerTrim.put(addedTime);
        } else {
          // Added time belongs to middle trim
          // Move greatest elements to right
          this.mUpperTrim.put(this.mMiddleTrim.getGreatest());
          this.mMiddleTrim.remove(this.mMiddleTrim.getGreatest());
          this.mMiddleTrim.put(addedTime);
        }
      }

      // Ejected time belongs to middle trim
      else {
        // Remove the ejected time
        this.mMiddleTrim.remove(ejectedTime);

        if (addedTime >= this.mUpperTrim.getLeast()) {
          // Added time belongs to upper trim
          // Move least elements to left
          this.mMiddleTrim.put(this.mUpperTrim.getLeast());
          this.mUpperTrim.remove(this.mUpperTrim.getLeast());
          this.mUpperTrim.put(addedTime);
        } else if (addedTime <= this.mLowerTrim.getGreatest()) {
          // Added time belongs to lower trim
          // Move greatest elements to right
          this.mMiddleTrim.put(this.mLowerTrim.getGreatest());
          this.mLowerTrim.remove(this.mLowerTrim.getGreatest());
          this.mLowerTrim.put(addedTime);
        } else {
          // Added time belongs to middle trim
          this.mMiddleTrim.put(addedTime);
        }
      }
    } else if (this.mNumSolves > this.mN) {
      // If the bound is 0, mLowerTrim and mUpperTrim will be null
      // All operations will be done on this.mMiddleTrim
      this.mMiddleTrim.remove(ejectedTime);
      this.mMiddleTrim.put(addedTime);
    }
  }

  /**
   * Updates the sum of all times currently stored and the sum of all times ever added. Any
   * {@link #DNF} results are ignored. If all recorded times have been DNFs, the sums will set
   * to {@link #UNKNOWN}.
   *
   * @param addedTime
   *     The newly added time. May be {@code DNF}. Must already be stored.
   * @param ejectedTime
   *     An old time that was ejected to make room for the newly added time. May be {@code DNF}.
   *     Use {@code UNKNOWN} if no old time was ejected.
   */
  private updateSums(addedTime: number, ejectedTime: number): void {
    if (addedTime != DNF_VALUE) {
      this.mCurrentSum =
        addedTime + (this.mCurrentSum == UNKNOWN ? 0 : this.mCurrentSum);
      this.mAllTimeSum =
        addedTime + (this.mAllTimeSum == UNKNOWN ? 0 : this.mAllTimeSum);
    }
    if (ejectedTime != DNF_VALUE && ejectedTime != UNKNOWN) {
      this.mCurrentSum -= ejectedTime;
    }
  }

  /**
   * The Welford algorithm for variance is one of the most well-known and used online methods of
   * calculating the variance of a given sample data. I won't pretend to fully understand it
   * myself, but there are a lot of references online for it.
   */
  private updateVariance(addedTime: number) {
    const totalValidSolves = this.mNumSolves - this.mNumAllTimeDNFs;
    if (addedTime != DNF_VALUE) {
      this.mVarianceDelta = addedTime - this.mMean;
      this.mMean += this.mVarianceDelta / totalValidSolves;
      this.mVarianceDelta2 = addedTime - this.mMean;
      this.mVarianceM2 += this.mVarianceDelta * this.mVarianceDelta2;
    }
    if (totalValidSolves > 2) {
      this.mVariance = this.mVarianceM2 / (totalValidSolves - 1);
    }
  }

  /**
   * Updates the average value of the most recently added times. See {@link #getCurrentAverage()}
   * for details. The sum, best and worst values and other fields must be updated by first calling
   * {@link #updateSums(long, long)} and {@link #updateCurrentBestAndWorstTimes(long, long)} and
   * their dependent methods before calling this method.
   */
  protected updateCurrentAverage() {
    if (this.mNumSolves < this.mN) {
      // Not enough times added to calculate the average.
      this.mCurrentAverage = UNKNOWN;
    } else if (this.mNumCurrentDNFs == this.mN) {
      // Enough times have been added, but all of the currently stored ones are DNFs.
      this.mCurrentAverage = DNF_VALUE;
    } else if (!this.mDisqualifyDNFs && this.mNumCurrentDNFs == this.mN - 1) {
      // More than one DNF is not an automatic disqualification, but there is only one
      // non-DNF time present. Just use that time as the average.
      this.mCurrentAverage = this.mCurrentBestTime;
    } else if (this.mN >= AverageCalculator.MIN_N_TO_ALLOW_ONE_DNF) {
      if (
        this.mDisqualifyDNFs &&
        this.mNumCurrentDNFs > this.mNumAcceptableDNFs
      ) {
        // Disqualify the average: the number of current DNFs is above the acceptable threshold
        this.mCurrentAverage = DNF_VALUE;
      } else {
        // If the number of DNF is lower than the number of acceptable DNFs (= trim size)
        // Calculate a rounded arithmetic mean. "mMiddleTrim.getSum" is the sum of all
        // times except the upper and lower trims including DNFs.
        this.mCurrentAverage =
          this.mMiddleTrim.getSum() / (this.mN - this.mTrimSize * 2);
        this.mCurrentAverage = ((this.mCurrentAverage + 5) / 10) * 10; // rounding last digit
      }
    } else {
      // mN < MIN_N_TO_ALLOW_ONE_DNF
      // NOTE: "mN" could be as low as 1, but will not be zero (see the constructor).
      if (this.mDisqualifyDNFs && this.mNumCurrentDNFs > 0) {
        // Disqualify the average as *no* DNF (not even one) is allowed for small "n".
        this.mCurrentAverage = DNF_VALUE;
      } else {
        // There is no DNF, or there are DNFs, but that will not cause automatic
        // disqualification. There is at least one non-DNF time present. Calculate the
        // rounded arithmetic mean.
        this.mCurrentAverage =
          this.mCurrentSum / (this.mN - this.mNumCurrentDNFs);
        this.mCurrentAverage = ((this.mCurrentAverage + 5) / 10) * 10; // rounding last digit
      }
    }
  }

  /**
   * Updates the all-time best and worst times after a new time is added. The current best and
   * worst times must be updated by {@link #updateCurrentBestAndWorstTimes(long, long)} before
   * calling this method.
   */
  protected updateAllTimeBestAndWorstTimes() {
    if (this.mAllTimeBestTime == UNKNOWN) {
      this.mAllTimeBestTime = this.mCurrentBestTime; // May still be UNKNOWN.
    } else if (this.mCurrentBestTime != UNKNOWN) {
      // "this.mCurrentBestTime" is never set to "DNF".
      this.mAllTimeBestTime = Math.min(
        this.mAllTimeBestTime,
        this.mCurrentBestTime,
      );
    }

    if (this.mAllTimeWorstTime == UNKNOWN) {
      this.mAllTimeWorstTime = this.mCurrentWorstTime; // May still be UNKNOWN.
    } else if (this.mCurrentWorstTime != UNKNOWN) {
      this.mAllTimeWorstTime = Math.max(
        this.mAllTimeWorstTime,
        this.mCurrentWorstTime,
      );
    }
  }

  /**
   * Updates the all-time best average after a new time is added. The current average must be
   * updated by {@link #updateCurrentAverage()} before calling this method.
   */
  protected updateAllTimeBestAverage() {
    if (
      this.mAllTimeBestAverage == UNKNOWN ||
      this.mAllTimeBestAverage == DNF_VALUE
    ) {
      // "mCurrentAverage" may still be UNKNOWN or DNF, but cannot change back to UNKNOWN once
      // set to a different value, as UNKNOWN is cleared once "mN" solves have been added.
      // Therefore, we never set "this.mAllTimeBestAverage" to a value worse than it already has.
      this.mAllTimeBestAverage = this.mCurrentAverage;
    } else if (this.mCurrentAverage != DNF_VALUE) {
      if (this.mCurrentAverage < this.mAllTimeBestAverage) {
        this.mIsAllTimeBestAverageUpdated = true;
      } else {
        this.mIsAllTimeBestAverageUpdated = false;
      }
      this.mAllTimeBestAverage = Math.min(
        this.mAllTimeBestAverage,
        this.mCurrentAverage,
      );
    }
  }

  /**
   * <p>
   * Gets the current value of the average. This is calculated from the most recently added
   * times. The number of times considered is given by {@link #getN()} ("n").
   * </p>
   * <p>
   * Where the value of "n" is less than 5, the average is the arithmetic mean of the currently
   * stored values, not a truncated mean. If any currently recorded solve is a {@link #DNF},
   * the average is disqualified as a DNF unless configured so that DNFs do not automatically
   * disqualify averages (by passing {@code false} as the value of the {@code disqualifyDNFs}
   * parameter to {@link #AverageCalculator(int, int)}). If DNFs are allowed, then the
   * average is the average time of all non-DNF solves, but will still be a DNF average if all
   * solves are DNFs.
   * </p>
   * <p>
   * Where the value of "n" is 5 or greater, the average is the truncated arithmetic mean of the
   * currently stored values. The single best and single worst solve times are discarded and the
   * average is calculated from the remaining times. If one DNF is present, it is taken as the
   * worst solve time and discarded. If more than one DNF is present, the average is disqualified
   * as a DNF unless configured so that DNFs do not automatically disqualify averages. If more
   * DNFs are allowed, one will be taken as the worst solve time and the other DNFs will be
   * ignored. If only a single non-DNF time remains, it will not be discarded as the best time
   * and will be returned as the average time.
   * </p>
   *
   * @return
   *     The current (truncated( arithmetic mean of the most recently added values. If fewer
   *     times have been added that the number required, the result will be {@link #UNKNOWN}.
   *     If too many DNF solves are included in the recently-added times, the result is
   *     {@code DNF}. The returned integer value of the average is truncated (rounded down).
   */
  public getCurrentAverage() {
    return this.mCurrentAverage;
  }

  /**
   * Gets the best value of the average. This is calculated across all added times. The number of
   * times considered is given by {@link #getN()}. The average for each consecutive sequence of
   * that number of times (including DNFs) is calculated as each new time is added and the best
   * average of all of those sequences is returned. See {@link #getCurrentAverage()} for more
   * details.
   *
   * @return
   *     The best truncated arithmetic mean across all added values. If fewer times have been
   *     added that the number required, the result will be {@link #UNKNOWN}. If too many DNF
   *     solves are included in <i>all</i> sequences of times, the result is {@link #DNF}.
   */
  public getBestAverage() {
    return this.mAllTimeBestAverage;
  }

  /**
   * Gets the best average is updated or not
   * @return
   *      true : The best average is updated
   */
  public getIsBestAverageUpdated() {
    return this.mIsAllTimeBestAverageUpdated;
  }

  /**
   * Gets the best time of all those added to this calculator.
   *
   * @return
   *     The best time ever added to this calculator. The result will be {@link #UNKNOWN} if no
   *     times have been added, or if all added times were {@link #DNF}s.
   */
  public getBestTime() {
    return this.mAllTimeBestTime;
  }

  /**
   * Gets the worst time (not a DNF) of all those added to this calculator.
   *
   * @return
   *     The worst time ever added to this calculator. The result will be {@link #UNKNOWN} if no
   *     times have been added, or if all added times were {@link #DNF}s.
   */
  public getWorstTime() {
    return this.mAllTimeWorstTime;
  }

  /**
   * Gets recent(all) times of AverageCalculator
   * Times are sorted from newer one to older one.
   * DNF is converted to TIME_DNF (used in PuzzleUtils)
   *
   * @return
   *     The array of times
   */
  public getRecentTimes(): number[] {
    const times: number[] = [this.mN];
    let idx = 0;

    for (let i = this.mNext - 1; i >= 0; i--) {
      if (this.mTimes[i] != DNF_VALUE) {
        times[idx] = this.mTimes[i];
      } else {
        times[idx] = DNF_VALUE;
      }
      idx++;
    }

    for (let i = this.mN - 1; i >= this.mNext; i--) {
      if (this.mTimes[i] != DNF_VALUE) {
        times[idx] = this.mTimes[i];
      } else {
        times[idx] = DNF_VALUE;
      }
      idx++;
    }

    return times;
  }

  /**
   * Gets the total number of solve times (including DNFs) that were added to this calculator.
   * This may be greater than the number (given by {@link #getN}) that are included in the
   * calculation of the average. Subtract the value from {@link #getNumDNFSolves()} to get the
   * total number of non-DNF solves.
   *
   * @return The number of solve times that were added to this calculator.
   */
  public getNumSolves(): number {
    return this.mNumSolves;
  }

  /**
   * Gets the total number of DNF solves that were added to this calculator.
   *
   * @return The number of DNF solves that were added to this calculator.
   */
  public getNumDNFSolves(): number {
    return this.mNumAllTimeDNFs;
  }

  /**
   * Gets the total time of all non-DNF solves that were added to this calculator.
   *
   * @return
   *     The total time of all non-DNF solves that were added to this calculator. The result
   *     will be {@link #UNKNOWN} if no times have been added, or if all added times were
   *     {@link #DNF}s.
   */
  public getTotalTime(): number {
    return this.mAllTimeSum;
  }

  /**
   * Gets the current Sample Standard Deviation of all non-DNF solves that were added to this
   * calculator
   *
   * @return
   *      The Sample Standard Deviation of all non-DNF solves that were added to this calculator
   *      Will be {@link #UNKNOWN} if no times have been added, or if all added solve times
   *      were {@link #DNF}s.
   */
  public getStandardDeviation(): number {
    return this.mVariance != UNKNOWN ? Math.sqrt(this.mVariance) : UNKNOWN;
  }

  /**
   * Gets the simple arithmetic mean time of all non-DNF solves that were added to this
   * calculator. The returned millisecond value is truncated to a whole milliseconds value, not
   * rounded.
   *
   * @return
   *     The mean time of all non-DNF solves that were added to this calculator. The result
   *     will be {@link #UNKNOWN} if no times have been added, or if all added times were
   *     {@link #DNF}s.
   */
  public getMeanTime() {
    return this.mMean;
  }

  /**
   * Captures the details of the average-of-N calculation including the most recently added time.
   *
   * @return The details for the average-of-N calculation.
   */
  public getAverageOfN() {
    return new AverageCalculator.AverageOfN(this);
  }

  /**
   * Translates a time value that may be {@link #UNKNOWN} or {@link #DNF} into a time value
   * that is compatible with methods such as the {@code PuzzleUtils.convertTimeToString*}
   * methods.
   *
   * @param time The time value to be translated.
   *
   * @return
   *     The translated time value; {@code UNKNOWN} is translated to zero and {@code DNF} is
   *     translated to {@link PuzzleUtils#TIME_DNF}.
   */
  public static tr(time: number) {
    if (time == UNKNOWN) {
      return UNKNOWN;
    }
    if (time == DNF_VALUE) {
      return DNF_VALUE;
    }
    return time;
  }

  /**
   * A summary of the average of the mostly recently added times. All times are provided in an
   * array and the calculated average, best time and worst time are identified, if appropriate.
   */
  public static AverageOfN = class {
    /**
     * The array of values that contributed to the calculation of the average-of-N. If too few
     * values have been recorded (less than "N"), the array will be {@code null}. The times
     * will be ordered with the oldest recorded time first.
     */
    private mTimes: number[] | null;

    /**
     * The total sum of the upper-trim of the calculated times. May be {@link #DNF} if there are too
     * many DNF solves, or {@link #UNKNOWN} if the are too few times (less than "N").
     */
    private mUpperTrimSum: number;

    /**
     * The total sum of the middle-trim of the calculated times. May be {@link #DNF} if there are too
     * many DNF solves, or {@link #UNKNOWN} if the are too few times (less than "N").
     */
    private mMiddleTrimSum: number;

    /**
     * The total sum of the lower-trim of the calculated times. May be {@link #DNF} if there are too
     * many DNF solves, or {@link #UNKNOWN} if the are too few times (less than "N").
     */
    private mLowerTrimSum: number;

    /**
     * The index within {@link #mTimes} of the best time. The index will be -1 if that array is
     * {@code null}, or if the average calculation for the value of "N" does not eliminate the
     * best time, or if all of the times are DNFs, or if DNFs do not cause disqualification,
     * but there is only one non-DNF time recorded.
     */
    private mBestTimeIndex: number;

    /**
     * The index within {@link #mTimes} of the worst time. The index will be -1 if that array is
     * {@code null}, or if the average calculation for the value of "N" does not eliminate the
     * best time, or if all of the times are DNFs. The worst time may be a DNF.
     */
    private mWorstTimeIndex: number;

    /**
     * The average-of-N value calculated for the times. May be {@link #DNF} if there are too
     * many DNF solves, or {@link #UNKNOWN} if the are too few times (less than "N").
     */
    private mAverage: number;

    /**
     * Creates a new record of the most recent "average-of-N" recorded by an average calculator.
     *
     * @param ac The average calculator from which to capture the information.
     */
    constructor(ac: AverageCalculator) {
      const n = ac.getN();

      this.mAverage = ac.getCurrentAverage();
      this.mUpperTrimSum = ac.mUpperTrim.getSum();
      this.mMiddleTrimSum = ac.mMiddleTrim.getSum();
      this.mLowerTrimSum = ac.mLowerTrim.getSum();

      if (this.mAverage != UNKNOWN && ac.getNumSolves() >= n) {
        this.mTimes = new Array(n);

        // The oldest time recorded in "ac.mTimes" is not necessarily the first one, as
        // that array operates as a circular queue. "ac.mNext" marks one index past the
        // last added time. However, the array should be full, so this should also be the
        // index of the first (oldest) time. If "ac.mNext" equals "n", then we wrap around
        // to start at index zero.
        const oldestIndex = ac.mNext == n ? 0 : ac.mNext;

        for (let i = 0; i < n - oldestIndex; i++) {
          this.mTimes[i] = ac.mTimes[oldestIndex + i];
        }

        // Second copy: ac.mTimes[0...oldestIndex-1] -> this.mTimes[n-oldestIndex...n-1]
        for (let i = 0; i < oldestIndex; i++) {
          this.mTimes[n - oldestIndex + i] = ac.mTimes[i];
        }

        // "-1" is the convention for an unknown *index*, so "UNKNOWN" is not used.
        let bestIdx = -1;
        let worstIdx = -1;

        // IF the threshold value of "N" for the calculation of a truncated mean is not
        // reached, no best or worst times will be identified for elimination.
        //
        // IF all times are DNFs, no best or worst times will be identified for elimination.
        //
        // IF only one time is not a DNF, no best time will be identified for elimination.
        //
        // IF DNFs are present, a DNF will be identified as the worst time instead of
        // "mCurrentWorstTime", as "mCurrentWorstTime" is never set to DNF.
        if (
          n >= AverageCalculator.MIN_N_TO_ALLOW_ONE_DNF &&
          n > ac.mNumCurrentDNFs
        ) {
          // At least 1 non-DNF.
          // Do not identify the only non-DNF time as the best time.
          const bestTime =
            n - ac.mNumCurrentDNFs > 1 ? ac.mCurrentBestTime : UNKNOWN;
          // Identify a DNF as the worst time if DNFs are present.
          const worstTime =
            ac.mNumCurrentDNFs == 0 ? ac.mCurrentWorstTime : DNF_VALUE;

          for (let i = 0; i < n && (bestIdx == -1 || worstIdx == -1); i++) {
            // Use if...else... here to ensure that the best and worst times are not
            // recorded at the same index (e.g., if all times are DNFs or all equal).
            if (bestIdx == -1 && this.mTimes[i] == bestTime) {
              bestIdx = i;
            } else if (worstIdx == -1 && this.mTimes[i] == worstTime) {
              worstIdx = i;
            }
          }
        }

        this.mBestTimeIndex = bestIdx;
        this.mWorstTimeIndex = worstIdx;
      } else {
        this.mTimes = null;
        this.mBestTimeIndex = -1;
        this.mWorstTimeIndex = -1;
      }
    }

    /**
     * Gets the array of values that contributed to the calculation of the average-of-N. If
     * too few values have been recorded (less than "N"), the array will be {@code null}. The
     * times will be ordered with the oldest recorded time first and may include {@link #DNF}
     * values. The best and worst times can be identified with {@link #getBestTimeIndex()} and
     * {@link #getWorstTimeIndex()}.
     *
     * @return
     *     The array of times used to calculate the average. May be {@code null}.
     */
    public getTimes() {
      return this.mTimes;
    }

    /**
     * Gets the calculated average-of-N value. The calculation follows the normal rules for
     * the value of "N" that are applied by the average calculator from which this object was
     * captured.
     *
     * @return
     *     The average-of-N value. May be {@link #DNF} if the average was disqualified, or
     *     {@link #UNKNOWN} if too few times have been recorded (i.e., less than "N").
     */
    public getAverage() {
      return this.mAverage;
    }

    /**
     * Gets the index within the array returned by {@link #getTimes()} of the best time
     * eliminated for the average-of-N calculation. If there were insufficient times, or if the
     * value of "N" is lower than the threshold where best times are eliminated, or if there
     * are less than two non-DNF times, the result will be -1. When DNFs do not disqualify the
     * average and there is only one non-DNF time, that time is not identified as the "best"
     * time, so it is not eliminated; instead that single time becomes the average time.
     *
     * @return The index of the best time value, or -1 if it is not known.
     */
    public getBestTimeIndex() {
      return this.mBestTimeIndex;
    }

    /**
     * Gets the index within the array returned by {@link #getTimes()} of the worst time
     * eliminated for the average-of-N calculation. If there were insufficient times, or if the
     * value of "N" is lower than the threshold where worst times are eliminated, or if all of
     * the times are DNF times, the result will be -1. If DNFs are present and at least one
     * time is not a DNF, the first DNF will be marked as the worst time.
     *
     * @return The index of the worst time value, or -1 if it is not known.
     */
    public getWorstTimeIndex() {
      return this.mWorstTimeIndex;
    }

    /**
     * Gets the calculated upper trim sum. That is, the sum of all times in sorted order
     * from the set trim boundary to the end of the mSortedList array
     *
     * @return
     *     The trim value. May be {@link #UNKNOWN} if too few times have been recorded (i.e., less than "N").
     */
    public getmUpperTrimSum() {
      return this.mUpperTrimSum;
    }

    /**
     * Gets the calculated middle trim sum. That is, the sum of all times minus
     * {@code mUpperTrimSum} and {@code mLowerTrimSum}
     * @return
     *     The trim value. May be {@link #UNKNOWN} if too few times have been recorded (i.e., less than "N").
     */
    public getmMiddleTrimSum() {
      return this.mMiddleTrimSum;
    }

    /**
     * Gets the calculated lower trim sum. That is, the sum of all times in sorted order
     * from beginning mSortedList array until the set trim boundary
     *
     * @return
     *     The trim value. May be {@link #UNKNOWN} if too few times have been recorded (i.e., less than "N").
     */
    public getmLowerTrimSum() {
      return this.mLowerTrimSum;
    }
  };
}
