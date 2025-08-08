import { AverageCalculator } from "@/structures.tsx/averageCalculator";

const DNF = AverageCalculator.DNF;
const UNKNOWN = AverageCalculator.UNKNOWN;

describe("AverageCalculator", () => {
  describe("Constructor Tests", () => {
    test("should create calculator with n=1", () => {
      const ac = new AverageCalculator(1, 10);

      expect(ac.getN()).toBe(1);
      expect(ac.getNumSolves()).toBe(0);
      expect(ac.getNumDNFSolves()).toBe(0);

      expect(ac.getCurrentAverage()).toBe(UNKNOWN);
      expect(ac.getBestAverage()).toBe(UNKNOWN);

      expect(ac.getBestTime()).toBe(UNKNOWN);
      expect(ac.getWorstTime()).toBe(UNKNOWN);
      expect(ac.getTotalTime()).toBe(UNKNOWN);
      expect(ac.getMeanTime()).toBe(UNKNOWN);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);
    });

    test("should create calculator with n=3", () => {
      const ac = new AverageCalculator(3, 0);

      expect(ac.getN()).toBe(3);
      expect(ac.getNumSolves()).toBe(0);
      expect(ac.getNumDNFSolves()).toBe(0);

      expect(ac.getCurrentAverage()).toBe(UNKNOWN);
      expect(ac.getBestAverage()).toBe(UNKNOWN);

      expect(ac.getBestTime()).toBe(UNKNOWN);
      expect(ac.getWorstTime()).toBe(UNKNOWN);
      expect(ac.getTotalTime()).toBe(UNKNOWN);
      expect(ac.getMeanTime()).toBe(UNKNOWN);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);
    });

    test("should create calculator with n=5", () => {
      const ac = new AverageCalculator(5, 20);

      expect(ac.getN()).toBe(5);
      expect(ac.getNumSolves()).toBe(0);
      expect(ac.getNumDNFSolves()).toBe(0);

      expect(ac.getCurrentAverage()).toBe(UNKNOWN);
      expect(ac.getBestAverage()).toBe(UNKNOWN);

      expect(ac.getBestTime()).toBe(UNKNOWN);
      expect(ac.getWorstTime()).toBe(UNKNOWN);
      expect(ac.getTotalTime()).toBe(UNKNOWN);
      expect(ac.getMeanTime()).toBe(UNKNOWN);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);
    });

    test("should throw error for invalid n values", () => {
      expect(() => new AverageCalculator(0, 0)).toThrow();
      expect(() => new AverageCalculator(-1, 0)).toThrow();
    });
  });

  describe("Add Time Tests", () => {
    test("should add times correctly", () => {
      const ac = new AverageCalculator(5, 20);

      ac.addTime(DNF);
      expect(ac.getNumSolves()).toBe(1);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getBestTime()).toBe(UNKNOWN);
      expect(ac.getWorstTime()).toBe(UNKNOWN);
      expect(ac.getTotalTime()).toBe(UNKNOWN);
      expect(ac.getMeanTime()).toBe(UNKNOWN);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);

      ac.addTime(500);
      expect(ac.getNumSolves()).toBe(2);
      expect(ac.getBestTime()).toBe(500);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(500);
      expect(ac.getMeanTime()).toBe(500);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);

      ac.addTime(300);
      expect(ac.getNumSolves()).toBe(3);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(800);
      expect(ac.getMeanTime()).toBe(400);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);

      ac.addTime(1000);
      expect(ac.getNumSolves()).toBe(4);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(1000);
      expect(ac.getTotalTime()).toBe(1800);
      expect(ac.getMeanTime()).toBe(600);
      expect(ac.getStandardDeviation()).toBe(360);

      ac.addTime(DNF);
      expect(ac.getNumSolves()).toBe(5);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(1000);
      expect(ac.getTotalTime()).toBe(1800);
      expect(ac.getMeanTime()).toBe(600);
      expect(ac.getStandardDeviation()).toBe(360);
    });

    test("should add multiple times", () => {
      const ac = new AverageCalculator(5, 20);

      ac.addTimes();
      expect(ac.getNumSolves()).toBe(0);

      ac.addTimes(DNF, 500, 300, DNF);
      expect(ac.getNumSolves()).toBe(4);
      expect(ac.getNumDNFSolves()).toBe(2);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(800);
      expect(ac.getMeanTime()).toBe(400);
      expect(ac.getStandardDeviation()).toBe(UNKNOWN);
    });
  });

  describe("Average of One Tests", () => {
    test("should calculate average of one with DNF disqualification", () => {
      const ac = new AverageCalculator(1, 0);

      ac.addTime(500);
      expect(ac.getNumSolves()).toBe(1);
      expect(ac.getNumDNFSolves()).toBe(0);
      expect(ac.getCurrentAverage()).toBe(500);
      expect(ac.getBestAverage()).toBe(500);
      expect(ac.getBestTime()).toBe(500);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(500);
      expect(ac.getMeanTime()).toBe(500);

      ac.addTime(300);
      expect(ac.getNumSolves()).toBe(2);
      expect(ac.getNumDNFSolves()).toBe(0);
      expect(ac.getCurrentAverage()).toBe(300);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(800);
      expect(ac.getMeanTime()).toBe(400);

      ac.addTime(DNF);
      expect(ac.getNumSolves()).toBe(3);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(DNF);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(800);
      expect(ac.getMeanTime()).toBe(400);

      ac.addTime(1000);
      expect(ac.getNumSolves()).toBe(4);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(1000);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(300);
      expect(ac.getWorstTime()).toBe(1000);
      expect(ac.getTotalTime()).toBe(1800);
      expect(ac.getMeanTime()).toBe(600);
    });
  });

  describe("Average of Three Tests", () => {
    test("should calculate average of three with DNF disqualification", () => {
      const ac = new AverageCalculator(3, 0);

      ac.addTimes(500, 250, 150);
      expect(ac.getNumSolves()).toBe(3);
      expect(ac.getNumDNFSolves()).toBe(0);
      expect(ac.getCurrentAverage()).toBe(300);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(900);
      expect(ac.getMeanTime()).toBe(300);
      expect(ac.getStandardDeviation()).toBe(180);

      ac.addTimes(DNF, 800);
      expect(ac.getNumSolves()).toBe(5);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(DNF);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(800);
      expect(ac.getTotalTime()).toBe(1700);
      expect(ac.getMeanTime()).toBe(425);
      expect(ac.getStandardDeviation()).toBe(290);

      ac.addTimes(100);
      expect(ac.getNumSolves()).toBe(6);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(DNF);
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(100);
      expect(ac.getWorstTime()).toBe(800);
      expect(ac.getTotalTime()).toBe(1800);
      expect(ac.getMeanTime()).toBe(360);
      expect(ac.getStandardDeviation()).toBe(290);

      ac.addTimes(900);
      expect(ac.getNumSolves()).toBe(7);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(600); // Last three were 800, 100, 900
      expect(ac.getBestAverage()).toBe(300);
      expect(ac.getBestTime()).toBe(100);
      expect(ac.getWorstTime()).toBe(900);
      expect(ac.getTotalTime()).toBe(2700);
      expect(ac.getMeanTime()).toBe(450);
      expect(ac.getStandardDeviation()).toBe(340);

      ac.addTimes(DNF);
      expect(ac.getNumSolves()).toBe(8);
      expect(ac.getNumDNFSolves()).toBe(2);
      expect(ac.getCurrentAverage()).toBe(DNF); // Last three were 100, 900, DNF
      expect(ac.getBestAverage()).toBe(300);

      // Set a new record for the average time
      ac.addTimes(90, 210, 300);
      expect(ac.getNumSolves()).toBe(11);
      expect(ac.getNumDNFSolves()).toBe(2);
      expect(ac.getCurrentAverage()).toBe(200);
      expect(ac.getBestAverage()).toBe(200);
      expect(ac.getBestTime()).toBe(90);
      expect(ac.getWorstTime()).toBe(900);
      expect(ac.getTotalTime()).toBe(3300);
      expect(ac.getMeanTime()).toBe(366); // 3300 / 9 non-DNF solves. 366.6666... is truncated.
      expect(ac.getStandardDeviation()).toBe(301);
    });
  });

  describe("Average of Five Tests", () => {
    test("should calculate average of five with DNF disqualification", () => {
      const ac = new AverageCalculator(5, 20);

      ac.addTimes(500, 250, 150, 400, 200);
      expect(ac.getNumSolves()).toBe(5);
      expect(ac.getNumDNFSolves()).toBe(0);
      expect(ac.getCurrentAverage()).toBe(283); // (250+400+200) / 3. Exclude 150, 500.
      expect(ac.getBestAverage()).toBe(283);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(500);
      expect(ac.getTotalTime()).toBe(1500);
      expect(ac.getMeanTime()).toBe(300);

      // One DNF should be tolerated and treated as the worst time when calculating the average.
      ac.addTimes(DNF, 800); // Current: 150, 400, 200, DNF, 800
      expect(ac.getNumSolves()).toBe(7);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(466); // (400+200+800) / 3. Exclude 150, DNF.
      expect(ac.getBestAverage()).toBe(283);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(800);
      expect(ac.getTotalTime()).toBe(2300);
      expect(ac.getMeanTime()).toBe(383); // 2300 / 6 non-DNF solves.

      ac.addTimes(300); // Current: 400, 200, DNF, 800, 300
      expect(ac.getNumSolves()).toBe(8);
      expect(ac.getNumDNFSolves()).toBe(1);
      expect(ac.getCurrentAverage()).toBe(500); // (400+800+300) / 3. Exclude 200, DNF.
      expect(ac.getBestAverage()).toBe(283);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(800);
      expect(ac.getTotalTime()).toBe(2600);
      expect(ac.getMeanTime()).toBe(371); // 2600 / 7 non-DNF solves.

      // Second DNF in "current" 5 times. Result should be disqualified.
      ac.addTimes(DNF); // Current: 200, DNF, 800, 300, DNF
      expect(ac.getNumSolves()).toBe(9);
      expect(ac.getNumDNFSolves()).toBe(2);
      expect(ac.getCurrentAverage()).toBe(DNF); // More than one DNF.
      expect(ac.getBestAverage()).toBe(283);
      expect(ac.getBestTime()).toBe(150);
      expect(ac.getWorstTime()).toBe(800);
      expect(ac.getTotalTime()).toBe(2600);
      expect(ac.getMeanTime()).toBe(371); // 2600 / 7 non-DNF solves.

      // Test the reset method
      ac.reset();
      expect(ac.getN()).toBe(5); // Should not be changed by a reset.
      expect(ac.getNumSolves()).toBe(0);
      expect(ac.getNumDNFSolves()).toBe(0);
      expect(ac.getCurrentAverage()).toBe(UNKNOWN);
      expect(ac.getBestAverage()).toBe(UNKNOWN);
      expect(ac.getBestTime()).toBe(UNKNOWN);
      expect(ac.getWorstTime()).toBe(UNKNOWN);
      expect(ac.getTotalTime()).toBe(UNKNOWN);
      expect(ac.getMeanTime()).toBe(UNKNOWN);
    });
  });

  describe("AverageOfN Details Tests", () => {
    test("should handle AverageOfN details for three with DNF disqualification", () => {
      const ac = new AverageCalculator(3, 0);

      // Add less than the minimum required number of times
      ac.addTimes(500, 250);
      let aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toBeNull();
      expect(aoN.getAverage()).toBe(UNKNOWN);
      expect(aoN.getBestTimeIndex()).toBe(-1);
      expect(aoN.getWorstTimeIndex()).toBe(-1);

      // Complete the first three times
      ac.addTime(150);
      aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([500, 250, 150]);
      expect(aoN.getAverage()).toBe(300);
      expect(aoN.getBestTimeIndex()).toBe(-1); // No elimination of best time for N=3.
      expect(aoN.getWorstTimeIndex()).toBe(-1); // No elimination of worst time for N=3.

      // 1 DNF disqualifies the result
      ac.addTime(DNF);
      aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([250, 150, DNF]);
      expect(aoN.getAverage()).toBe(DNF);
      expect(aoN.getBestTimeIndex()).toBe(-1);
      expect(aoN.getWorstTimeIndex()).toBe(-1);

      // No DNFs and the result is valid again
      ac.addTimes(100, 200, 600);
      aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([100, 200, 600]);
      expect(aoN.getAverage()).toBe(300);
      expect(aoN.getBestTimeIndex()).toBe(-1);
      expect(aoN.getWorstTimeIndex()).toBe(-1);
    });

    test("should handle AverageOfN details for five with DNF disqualification", () => {
      const ac = new AverageCalculator(5, 20);

      // Add less than the minimum required number of times
      ac.addTimes(500, 150, 250, 600);
      let aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toBeNull();
      expect(aoN.getAverage()).toBe(UNKNOWN);
      expect(aoN.getBestTimeIndex()).toBe(-1);
      expect(aoN.getWorstTimeIndex()).toBe(-1);

      // Complete the first five times
      ac.addTime(350);
      aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([500, 150, 250, 600, 350]);
      expect(aoN.getAverage()).toBe(366); // Mean of 500+250+350. 150 and 600 are eliminated.
      expect(aoN.getBestTimeIndex()).toBe(1); // 150
      expect(aoN.getWorstTimeIndex()).toBe(3); // 600

      // 1 DNF does not disqualify the result. DNF becomes the "worst" time.
      ac.addTime(DNF);
      aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([150, 250, 600, 350, DNF]);
      expect(aoN.getAverage()).toBe(400); // Mean of 250+600+350. 150 and DNF are eliminated.
      expect(aoN.getBestTimeIndex()).toBe(0); // 150
      expect(aoN.getWorstTimeIndex()).toBe(4); // DNF
    });
  });

  describe("Large Average Tests", () => {
    test("should handle large average calculations", () => {
      const ac = new AverageCalculator(50, 5);

      ac.addTimes(
        89950,
        95540,
        95990,
        72580,
        74560,
        92800,
        92420,
        83900,
        98010,
        89740,
        95070,
        82480,
        99060,
        81910,
        88290,
        72620,
        115280,
        96510,
        79570,
        79860,
        65980,
        79430,
        96970,
        89840,
        85730,
        74930,
        77310,
        91310,
        91990,
        97730,
        74350,
        66290,
        64820,
        78960,
        73680,
        86090,
        95390,
        75620,
        86390,
        79930,
        89150,
        88090,
        86570,
        73630,
        99780,
        91050,
        88750,
        89740,
        84670,
        92950,
        86830,
        78630,
        81930,
        86170,
        79480,
        87630,
        79190,
        90680,
        77230,
        80220,
        77070,
        79360,
        83350,
        100290,
        103240,
        80990,
        84190,
        75990,
        86490,
        77310,
        87960,
        72250,
        84340,
        82670,
        92400,
        97220,
        85430,
        87780,
        85710,
        94650,
        94970,
        80740,
        89290,
        75110,
        95410,
        111380,
        96660,
        74710,
        73920,
        90590,
        95820,
        103260,
        92030,
        87790,
        95400,
        99080,
        80910,
        90120,
        74520,
        89840,
        96060,
        74730,
        66320,
        88930,
        73740,
        84870,
        95960,
        105230,
        80370,
        80960,
        77450,
        103350,
        86730,
        106070,
        85510,
        72120,
        106750,
        84940,
        120410,
        97030,
        83840,
        94900,
        108510,
        87870,
        71520,
        82570,
        88600,
        101390,
        86790,
        84490,
        93170,
        93940,
        102440,
        99150,
        81370,
        85580,
        87860,
        94980,
        98780,
        81850,
        82610,
        78670,
        84810,
        89350,
        119210,
        76550,
        89270,
        98520,
        72340,
        99700,
        83060,
        70070,
        120210,
        78450,
        74580,
        84860,
        88730,
        84120,
        100840,
        98040,
        88520,
        106250,
        95910,
        90040,
        92360,
        83390,
        88580,
        81240,
        70700,
        103160,
        94160,
        107270,
        82590,
        79360,
        101450,
        92420,
        114950,
        83970,
        95780,
        102550,
        98690,
        73930,
        74890,
        85190,
        83980,
        72290,
        102640,
        77430,
        104500,
        130680,
        93820,
        89570,
        102470,
        93500,
        90470,
        113360,
        93550,
        99450,
        155980,
        121440,
        138660,
        113600,
        86400,
        96320,
        101420,
        106970,
        116600,
        109140,
        120990,
        144260,
        84500,
        92430,
        115610,
        104720,
        116010,
        170760,
        106910,
        118350,
        115150,
        123530,
        94250,
        116800,
        83410,
        90030,
        119140,
        86440,
        171490,
        176300,
        99300,
        113650,
        123400,
        123400,
        110880,
        124790,
        127890,
        125120,
        109420,
        119890,
        157070,
        108740,
        144950,
        130470,
        127060,
        103270,
        102450,
        124820,
        92750,
        99990,
        104990,
        123780,
        128360,
        95250,
        112700,
        99530,
        98620,
        116720,
        150670,
        107740,
        101990,
        144910,
        118340,
        134440,
        112190,
        103280,
        121440,
        114720,
        134100,
        106880,
        113970,
        113160,
        104740,
        73880,
        95690,
        85970,
        100150,
        102480,
        96730,
        67030,
        84900,
        86000,
        71500,
        88150,
        99320,
        92850,
        79970,
        103730,
        104490,
        77180,
        106040,
        115300,
        142720,
        88490,
        77750,
        89450,
        77590,
        170660,
        80350,
        88340,
        88030,
        102580,
        97660,
        88600,
        73960,
        84560,
        84880,
        84840,
        74140,
        98020,
        81770,
        95600,
      );

      const aoN = ac.getAverageOfN();
      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(ac.getBestAverage()).toBe(83675);

      // Test DNF threshold
      ac.addTimes(DNF, DNF, DNF); // 3 DNFs should still allow valid average
      expect(ac.getNumDNFSolves()).toBe(3);
      expect(ac.getCurrentAverage()).toBe(102410);

      ac.addTime(DNF); // 4 DNFs might disqualify depending on threshold
      expect(ac.getNumDNFSolves()).toBe(4);
      expect(ac.getCurrentAverage()).toBe(DNF);
    });
  });

  // describe("Tree Swap Tests", () => {
  //   test("should handle all possible tree swap operations", () => {
  //     const ac = new AverageCalculator(12, 20);

  //     ac.addTimes(
  //       10000,
  //       20000,
  //       30000,
  //       40000,
  //       50000,
  //       60000,
  //       70000,
  //       80000,
  //       90000,
  //       100000,
  //       110000,
  //       120000,
  //     );
  //     let aoN = ac.getAverageOfN();
  //     expect(aoN.getAverage()).toBe(65000);

  //     // Eject lower, add lower
  //     ac.addTime(10000);
  //     aoN = ac.getAverageOfN();
  //     expect(aoN.getAverage()).toBe(65000);

  //     // Eject lower, add middle
  //     ac.addTime(60000);
  //     aoN = ac.getAverageOfN();
  //     expect(aoN.getAverage()).toBe(68333);

  //     // Eject lower, add top
  //     ac.addTime(120000);
  //     aoN = ac.getAverageOfN();
  //     expect(aoN.getAverage()).toBe(76666);
  //   });
  // });

  describe("Edge Cases", () => {
    test("should handle overflow scenarios", () => {
      const ac = new AverageCalculator(5, 5);

      // Generate large numbers that might cause overflow
      const largeTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        largeTimes.push(Math.floor(Math.random() * 5) + 299995);
      }

      ac.addTimes(...largeTimes);
      expect(ac.getBestAverage()).toBeGreaterThanOrEqual(250000);

      ac.addTimes(8, 10, 4, 5, 6, 3);
      expect(ac.getBestAverage()).toBeGreaterThan(0);
    });

    test("should handle identical times", () => {
      const ac = new AverageCalculator(5, 20);

      // Where all times are the same, the best and worst eliminations must not be at the same index
      ac.addTimes(100, 100, 100, 100, 100);
      const aoN = ac.getAverageOfN();

      expect(aoN.getTimes()).toHaveLength(ac.getN());
      expect(aoN.getTimes()).toEqual([100, 100, 100, 100, 100]);
      expect(aoN.getAverage()).toBe(100);
      expect(aoN.getBestTimeIndex()).toBe(0); // First time is "best"
      expect(aoN.getWorstTimeIndex()).toBe(1); // Next time is "worst"
    });
  });
});
