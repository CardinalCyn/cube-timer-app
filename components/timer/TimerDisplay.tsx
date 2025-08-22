import { DNF_VALUE } from "@/constants/constants";
import { convertCubingTime } from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { PenaltyState } from "@/types/types";
import { StyleSheet, View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";
type TimerProps = {
  elapsedTime: number;
  penaltyState: PenaltyState;
};

export default function TimerDisplay({
  elapsedTime,
  penaltyState,
}: TimerProps) {
  const { colors } = useSettings();
  return (
    <View style={styles.container}>
      <TextCustomFont style={[styles.text, { color: colors.text }]}>
        {elapsedTime === DNF_VALUE || penaltyState === "DNF"
          ? "DNF"
          : convertCubingTime(elapsedTime, ".", true, true)}
      </TextCustomFont>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  text: { fontSize: 40 },
});
