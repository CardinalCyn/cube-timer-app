import { StyleSheet, Text, View } from "react-native";

type TimerProps = {
  elapsedTime: number;
};

function formatTime(elapsedTime: number): string {
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const milliseconds = Math.floor((elapsedTime % 1000) / 10);

  const stringifiedHours = String(hours).padStart(2, "0");
  const stringifiedMinutes = String(minutes).padStart(2, "0");
  const stringifiedSeconds = String(seconds).padStart(2, "0");
  const stringifiedMilliseconds = String(milliseconds).padStart(2, "0");

  return hours
    ? `${stringifiedHours}:${stringifiedMinutes}:${stringifiedSeconds}:${stringifiedMilliseconds}`
    : minutes
    ? `${stringifiedMinutes}:${stringifiedSeconds}:${stringifiedMilliseconds}`
    : `${stringifiedSeconds}:${stringifiedMilliseconds}`;
}
export default function Timer({ elapsedTime }: TimerProps) {
  return (
    <View style={styles.container}>
      <Text>{formatTime(elapsedTime)}</Text>
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
});
