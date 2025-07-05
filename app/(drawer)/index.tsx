import Timer from "@/components/Timer";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function IndexPage() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<null | number>(null);
  const startTimeRef = useRef(0);

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
    <View style={styles.container}>
      <Text style={styles.title}>Timer</Text>
      <Pressable onPress={() => setIsRunning((prev) => !prev)}>
        <Timer elapsedTime={elapsedTime} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
