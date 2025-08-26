import { DNF_VALUE } from "@/constants/constants";
import { convertCubingTime } from "@/constants/utils";
import { PenaltyState } from "@/types/types";
import { View } from "react-native";
import { Text } from "../ui/text";
type TimerProps = {
  elapsedTime: number;
  penaltyState: PenaltyState;
};

export default function TimerDisplay({
  elapsedTime,
  penaltyState,
}: TimerProps) {
  return (
    <View>
      <Text>
        {elapsedTime === DNF_VALUE || penaltyState === "DNF"
          ? "DNF"
          : convertCubingTime(elapsedTime, ".", true, true)}
      </Text>
    </View>
  );
}
