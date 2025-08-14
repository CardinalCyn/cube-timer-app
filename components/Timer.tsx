import { useCubing } from "@/hooks/useCubing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ErrorDisplay from "./ErrorDisplay";
import TimerDisplay from "./TimerDisplay";
import TimerStatsDisplay from "./TimerStatsDisplay";

type TimerProps = {
  pageType: "timer" | "practice";
};

export default function Timer({ pageType }: TimerProps) {
  const {
    cubingContextClass,
    currentPracticePuzzleCategory,
    currentTimerPuzzleCategory,
  } = useCubing();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  //timer
  useEffect(() => {
    if (isRunning) {
      setElapsedTime(0);
      startTimeRef.current = performance.now();
      intervalRef.current = setInterval(() => {
        setElapsedTime(performance.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  //addSolve when timer stops
  useEffect(() => {
    if (isRunning || elapsedTime === 0) return;

    const addSolve = async () => {
      try {
        await cubingContextClass.addSolve({
          solveTime: elapsedTime,
          scramble: "asdfdadfa",
          date: new Date(),
          penaltyState: "noPenalty",
          session: 0,
          puzzleScrambleCode:
            pageType === "timer"
              ? currentTimerPuzzleCategory.scrambleCode
              : currentPracticePuzzleCategory.scrambleCode,
        });
        setErrorMessage("");
      } catch (err) {
        console.log("timer error");
        console.error(err);
        setErrorMessage("There was an issue in adding the solve");
      }
    };

    addSolve();
  }, [
    isRunning,
    elapsedTime,
    cubingContextClass,
    pageType,
    currentTimerPuzzleCategory.scrambleCode,
    currentPracticePuzzleCategory.scrambleCode,
  ]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container]}>
      <ErrorDisplay errorMessage={errorMessage} />
      <Pressable style={styles.pressableContainer} onPress={toggleTimer}>
        <View style={styles.timerContainer}>
          <TimerDisplay elapsedTime={elapsedTime} />
        </View>
        <TimerStatsDisplay />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressableContainer: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
