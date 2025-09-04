import { DNF_VALUE } from "@/constants/constants";
import { convertCubingTime } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import useTimer from "@/hooks/useTimer";
import { NavbarType } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import { Text } from "../ui/text";
import ScrambleDisplay from "./ScrambleDisplay";
import TimerStatsDisplay from "./TimerStatsDisplay";

type TimerProps = {
  navbarType: NavbarType;
};

// Updated Timer component with proper initialization handling
export default function Timer({ navbarType }: TimerProps) {
  const { colors, displayStats, displayTimeDuringSolve } = useSettings();

  const { cubingContextClass } = useCubing();

  const currentPuzzleTypes = cubingContextClass.getCurrentPuzzleTypes();
  const currentPuzzleCategory =
    navbarType === "timer"
      ? currentPuzzleTypes.currentTimerPuzzleType
      : currentPuzzleTypes.currentPracticePuzzleType;

  const {
    currentPenaltyState,
    isRunning,
    lastSolve,
    errorMessage,
    scramble,
    isInspecting,
    runningInspectionTime,
    runningSolveTime,
    toggleTimer,
    updatePenaltyState,
    deleteSolve,
  } = useTimer({
    currentPuzzleCategory,
  });

  const showControls = !isRunning && (lastSolve?.id || -1) !== -1;
  const showUndoOnly = showControls && currentPenaltyState !== "noPenalty";

  return (
    <View className="flex-1">
      <ErrorDisplay errorMessage={errorMessage} />
      <ScrambleDisplay scramble={scramble} />
      <Pressable className="flex-1" onPress={toggleTimer} disabled={!scramble}>
        <View className="flex-1 justify-items-center items-center">
          {(!isRunning || displayTimeDuringSolve) && !isInspecting && (
            <Text>
              {runningSolveTime === DNF_VALUE || currentPenaltyState === "DNF"
                ? "DNF"
                : convertCubingTime(runningSolveTime, ".", true, true)}
            </Text>
          )}
          {isInspecting && (
            <Text>
              {runningInspectionTime > 0
                ? Math.ceil(runningInspectionTime / 1000)
                : "+2"}
            </Text>
          )}
          {showUndoOnly ? (
            <View className=" flex-row justify-items-center items-center mt-20 gap-20">
              <MaterialIcons
                name="undo"
                size={24}
                color={colors.colors.primary}
                onPress={() => updatePenaltyState("noPenalty")}
                className="p-10"
              />
            </View>
          ) : showControls ? (
            <View className="flex-row justify-items-center items-center mt-20 gap-20">
              <MaterialIcons
                name="delete"
                size={24}
                color={colors.colors.text}
                onPress={() => deleteSolve()}
                className="p-10"
              />
              <MaterialIcons
                name="cancel"
                size={24}
                color={colors.colors.text}
                onPress={() => updatePenaltyState("DNF")}
                className="p-10"
              />
              <MaterialIcons
                name="flag"
                size={24}
                color={colors.colors.text}
                onPress={() => updatePenaltyState("+2")}
                className="p-10"
              />
            </View>
          ) : (
            <View></View>
          )}
        </View>
      </Pressable>
      {displayStats && !isRunning && (
        <TimerStatsDisplay navbarType={navbarType} />
      )}
    </View>
  );
}
