import { calculatePenaltySolveTime, generateScramble } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { NavbarType, PenaltyState, SolveData } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import ScrambleDisplay from "./ScrambleDisplay";
import TimerDisplay from "./TimerDisplay";
import TimerStatsDisplay from "./TimerStatsDisplay";

type TimerProps = {
  navbarType: NavbarType;
};

// Updated Timer component with proper initialization handling
export default function Timer({ navbarType }: TimerProps) {
  const { colors } = useSettings();
  const { cubingContextClass, scrambleGenerator } = useCubing();

  const currentPuzzleTypes = cubingContextClass.getCurrentPuzzleTypes();
  const currentPuzzleCategory =
    navbarType === "timer"
      ? currentPuzzleTypes.currentTimerPuzzleType
      : currentPuzzleTypes.currentPracticePuzzleType;

  const [errorMessage, setErrorMessage] = useState("");
  const [scramble, setScramble] = useState(
    scrambleGenerator.getScrambleByPuzzleCode(currentPuzzleCategory),
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSolve, setLastSolve] = useState<SolveData | null>(null);
  const [currentPenaltyState, setCurrentPenaltyState] =
    useState<PenaltyState>("noPenalty");

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const showControls = !isRunning && (lastSolve?.id || -1) !== -1;
  const showUndoOnly = showControls && currentPenaltyState !== "noPenalty";

  function toggleTimer() {
    if (isRunning) stopTimer();
    else startTimer();
  }
  // Starts timer from beginning
  function startTimer() {
    setIsRunning(true);
    setLastSolve(null);
    setCurrentPenaltyState("noPenalty");
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Date.now() - startTimeRef.current);
      }
    }, 10);
  }
  // Stops timer, adds solve
  async function stopTimer() {
    setIsRunning(false);

    // Clear the interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only add solve if we have a valid time
    if (elapsedTime > 0) {
      const solveId = await addSolve();
      if (solveId !== -1) {
        setLastSolve({
          scramble,
          solveTime: elapsedTime,
          date: new Date(),
          penaltyState: currentPenaltyState,
          session: 0,
          puzzleScrambleCode: currentPuzzleCategory,
          id: solveId,
        });
      }
    }

    setScramble(generateScramble(currentPuzzleCategory));
  }

  async function addSolve(): Promise<number> {
    try {
      const addSolveResults = await cubingContextClass.addSolve(
        {
          scramble,
          solveTime: elapsedTime,
          date: new Date(),
          penaltyState: currentPenaltyState,
          session: 0,
          puzzleScrambleCode: currentPuzzleCategory,
        },
        navbarType,
      );

      if (addSolveResults.status === "error") {
        setErrorMessage(addSolveResults.message);
        return -1;
      } else {
        setErrorMessage("");
        return addSolveResults.solveId;
      }
    } catch (error) {
      setErrorMessage("Failed to add solve");
      return -1;
    }
  }

  async function deleteSolve(): Promise<void> {
    if (!lastSolve) {
      setErrorMessage("No solve to delete");
      return;
    }

    try {
      const removeSolveResult = await cubingContextClass.removeSolve(
        lastSolve.id,
        navbarType,
      );

      if (removeSolveResult.status === "error") {
        setErrorMessage(removeSolveResult.message);
      } else {
        setErrorMessage("");
        setElapsedTime(0);
        setIsRunning(false);
        setLastSolve(null);
        setCurrentPenaltyState("noPenalty");
      }
    } catch (error) {
      setErrorMessage("Failed to delete solve");
    }
  }

  function updatePenaltyState(penaltyState: PenaltyState) {
    if (!lastSolve) {
      setErrorMessage("No solve to update penalty for");
      return;
    }

    //previous conditions in case setting the penalty state does not work
    const prevPenaltyState = currentPenaltyState;
    const prevTime = elapsedTime;
    try {
      setCurrentPenaltyState(penaltyState);
      const newTime = calculatePenaltySolveTime(
        lastSolve.solveTime,
        penaltyState,
      );
      setElapsedTime(newTime);

      const updatePenaltyStateResults = cubingContextClass.changePenaltyState(
        lastSolve.id,
        penaltyState,
      );
      if (updatePenaltyStateResults.status === "error") {
        // Revert on error
        setCurrentPenaltyState(lastSolve.penaltyState);
        setElapsedTime(newTime);
        setErrorMessage(updatePenaltyStateResults.message);
        return;
      }
      setLastSolve({ ...lastSolve, penaltyState: penaltyState });
      setErrorMessage("");
    } catch (error) {
      // Revert on error
      setCurrentPenaltyState(prevPenaltyState);
      setElapsedTime(prevTime);
      setErrorMessage("Failed to update penalty state");
    }
  }

  return (
    <View className="flex-1">
      <ErrorDisplay errorMessage={errorMessage} />
      <ScrambleDisplay scramble={scramble} />
      <Pressable className="flex-1" onPress={toggleTimer} disabled={!scramble}>
        <View className="flex-1 justify-items-center items-center">
          <TimerDisplay
            elapsedTime={elapsedTime}
            penaltyState={currentPenaltyState}
          />

          {showUndoOnly ? (
            <MaterialIcons
              name="undo"
              size={24}
              color={colors.colors.primary}
              onPress={() => updatePenaltyState("noPenalty")}
              className="p-10"
            />
          ) : showControls ? (
            <View className=" flex-row justify-items-center items-center mt-20 gap-20">
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
      <TimerStatsDisplay navbarType={navbarType} />
    </View>
  );
}
