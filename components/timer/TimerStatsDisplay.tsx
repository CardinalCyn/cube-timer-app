import { parseStat } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { NavbarType } from "@/types/types";
import { StyleSheet, View } from "react-native";
import { Text } from "../ui/text";

type TimerStatsDisplayProps = {
  navbarType: NavbarType;
};
export default function TimerStatsDisplay({
  navbarType,
}: TimerStatsDisplayProps) {
  const { colors } = useSettings();
  const { cubingContextClass } = useCubing();
  const timerSolvesData = cubingContextClass.getTimerStats(navbarType);
  const dataKeys = Object.keys(timerSolvesData);
  const leftColumnKeys = dataKeys.slice(0, Math.ceil(dataKeys.length / 2));
  const rightColumnKeys = dataKeys.slice(Math.ceil(dataKeys.length / 2));

  const renderColumn = (keys: string[]) => (
    <View>
      {keys.map((key) => (
        <Text key={key} style={[styles.text, { color: colors.colors.text }]}>
          {timerSolvesData[key as keyof typeof timerSolvesData].title +
            ": " +
            parseStat(
              timerSolvesData[key as keyof typeof timerSolvesData].value,
              key,
            )}
        </Text>
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
