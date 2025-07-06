import { useTheme } from "@/hooks/useTheme";
import { TimerSolvesData } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";

export default function TimerSolveDisplay({
  timerSolvesData,
}: {
  timerSolvesData: TimerSolvesData;
}) {
  const { colors } = useTheme();

  const dataKeys = Object.keys(timerSolvesData);
  const leftColumnKeys = dataKeys.slice(0, Math.ceil(dataKeys.length / 2));
  const rightColumnKeys = dataKeys.slice(Math.ceil(dataKeys.length / 2));

  const renderColumn = (keys: string[]) => (
    <View>
      {keys.map((key) => (
        <Text key={key} style={[styles.text, { color: colors.text }]}>
          {key[0].toUpperCase() +
            key.slice(1) +
            ": " +
            (timerSolvesData[key as keyof typeof timerSolvesData]
              ? timerSolvesData[key as keyof typeof timerSolvesData]
              : "--")}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderColumn(leftColumnKeys)}
      {renderColumn(rightColumnKeys)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 25,
  },
});
