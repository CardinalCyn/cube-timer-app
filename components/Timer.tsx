import { defaultOtherStats } from "@/constants/constants";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { TimerStats } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ErrorDisplay from "./ErrorDisplay";
import TimerDisplay from "./TimerDisplay";
import TimerSolveDisplay from "./TimerSolvesDisplay";

export default function Timer() {
  const { colors } = useSettings();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [timerSolvesData, setTimerSolvesData] =
    useState<TimerStats>(defaultOtherStats);

  const { cubingContextClass } = useCubing();
  useEffect(() => {
    setTimerSolvesData(cubingContextClass.getTimerStats());
  }, [cubingContextClass]);
  useEffect(() => {
    if (isRunning) {
      setElapsedTime(0);
      startTimeRef.current = performance.now(); // more precise
      intervalRef.current = setInterval(() => {
        setElapsedTime(performance.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    async function addSolve() {
      try {
        if (!elapsedTime || isRunning) return;
        await cubingContextClass.addSolve({
          solveTime: elapsedTime,
          scramble: "",
          date: new Date(),
          penaltyState: "noPenalty",
          session: 0,
        });
        setTimerSolvesData(cubingContextClass.getTimerStats());
        setErrorMessage("");
      } catch (err) {
        console.error(err);
        setErrorMessage("There was an issue in adding the solve");
      }
    }
    addSolve();
  }, [elapsedTime, cubingContextClass, isRunning]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ErrorDisplay errorMessage={errorMessage} />
      <Pressable
        style={styles.pressableContainer}
        onPress={() => setIsRunning((prev) => !prev)}
      >
        <View style={styles.timerContainer}>
          <TimerDisplay elapsedTime={elapsedTime} />
        </View>
        <TimerSolveDisplay timerSolvesData={timerSolvesData} />
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
