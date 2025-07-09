import Timer from "@/components/Timer";
import TimerSolveDisplay from "@/components/TimerSolvesDisplay";
import { useTheme } from "@/hooks/useTheme";
import { TimerSolvesData } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function PracticeTimer() {
  const { colors } = useTheme();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const reducedTimerSolvesData: TimerSolvesData = {
    deviation: "0.73",
    mean: "0.73",
    best: "0.34",
    count: "4",
    Ao5: "12.08",
    Ao12: "19.01",
    Ao50: "20.03",
    Ao100: "1200.09",
  };

  useEffect(() => {
    if (isRunning) {
      setElapsedTime(0);
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(
        () => setElapsedTime(Date.now() - startTimeRef.current),
        10,
      );
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        style={styles.pressableContainer}
        onPress={() => setIsRunning((prev) => !prev)}
      >
        <View style={styles.timerContainer}>
          <Timer elapsedTime={elapsedTime} />
        </View>
        <TimerSolveDisplay timerSolvesData={reducedTimerSolvesData} />
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
