import { parseStat } from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { TimerStats } from "@/types/types";
import { StyleSheet, View } from "react-native";
import { TextCustomFont } from "./TextCustomFont";

export default function TimerStatsDisplay({
  timerSolvesData,
}: {
  timerSolvesData: TimerStats;
}) {
  const { colors } = useSettings();

  const dataKeys = Object.keys(timerSolvesData);
  const leftColumnKeys = dataKeys.slice(0, Math.ceil(dataKeys.length / 2));
  const rightColumnKeys = dataKeys.slice(Math.ceil(dataKeys.length / 2));

  const renderColumn = (keys: string[]) => (
    <View>
      {keys.map((key) => (
        <TextCustomFont key={key} style={[styles.text, { color: colors.text }]}>
          {timerSolvesData[key as keyof typeof timerSolvesData].title +
            ": " +
            parseStat(
              timerSolvesData[key as keyof typeof timerSolvesData].value,
              key,
            )}
        </TextCustomFont>
      ))}
    </View>
  );

  return (
    <View style={[styles.container]}>
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
    fontSize: 14,
  },
});
