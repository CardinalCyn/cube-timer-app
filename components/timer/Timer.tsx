import { calculatePenaltySolveTime, generateScramble } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { NavbarType, PenaltyState, SolveData } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import ScrambleDisplay from "./ScrambleDisplay";
import TimerDisplay from "./TimerDisplay";
import TimerStatsDisplay from "./TimerStatsDisplay";

type TimerProps = {
  navbarType: NavbarType;
};

export default function Timer({ navbarType }: TimerProps) {
  const { colors } = useSettings();
  const {
    cubingContextClass,
    currentPracticePuzzleCategory,
    currentTimerPuzzleCategory,
  } = useCubing();

  // Get current puzzle category
  const currentPuzzleCategory =
    navbarType === "timer"
      ? currentTimerPuzzleCategory.scrambleCode
      : currentPracticePuzzleCategory.scrambleCode;

  const [errorMessage, setErrorMessage] = useState("");
  const [scramble, setScramble] = useState(
    generateScramble(currentPuzzleCategory),
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSolve, setLastSolve] = useState<SolveData | null>(null);
  const [currentPenaltyState, setCurrentPenaltyState] =
    useState<PenaltyState>("noPenalty");

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  function toggleTimer() {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
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
        setScramble(generateScramble(currentPuzzleCategory));
      }
    }
  }

  // Clean up interval on unmount and category changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset when puzzle category changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsedTime(0);
    setLastSolve(null);
    setCurrentPenaltyState("noPenalty");
    setScramble(generateScramble(currentPuzzleCategory));
  }, [currentPuzzleCategory]);

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
        console.log("added solve" + addSolveResults.solveId);
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
        // Reset to initial state after deleting
        setElapsedTime(0);
        setIsRunning(false);
        setLastSolve(null);
        setCurrentPenaltyState("noPenalty");
        setScramble(generateScramble(currentPuzzleCategory));
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

  // Determine what controls to show
  const showControls = !isRunning && (lastSolve?.id || -1) !== -1;
  const showUndoOnly = showControls && currentPenaltyState !== "noPenalty";

  return (
    <View style={styles.container}>
      <ErrorDisplay errorMessage={errorMessage} />
      <ScrambleDisplay scramble={scramble} />
      <Pressable style={styles.pressableContainer} onPress={toggleTimer}>
        <View style={styles.timerContainer}>
          <TimerDisplay
            elapsedTime={elapsedTime}
            penaltyState={currentPenaltyState}
          />

          {showUndoOnly ? (
            <MaterialIcons
              name="undo"
              size={24}
              color={colors.text}
              onPress={() => updatePenaltyState("noPenalty")}
              style={styles.iconButton}
            />
          ) : showControls ? (
            <View style={styles.solveButtonContainer}>
              {/* Delete solve */}
              <MaterialIcons
                name="delete"
                size={24}
                color={colors.text}
                onPress={() => deleteSolve()}
                style={styles.iconButton}
              />
              {/* DNF penalty */}
              <MaterialIcons
                name="cancel"
                size={24}
                color={colors.text}
                onPress={() => updatePenaltyState("DNF")}
                style={styles.iconButton}
              />
              {/* +2 penalty */}
              <MaterialIcons
                name="flag"
                size={24}
                color={colors.text}
                onPress={() => updatePenaltyState("+2")}
                style={styles.iconButton}
              />
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              {/* Empty space when no controls should be shown */}
            </View>
          )}
        </View>
      </Pressable>
      <TimerStatsDisplay navbarType={navbarType} />
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
  solveButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },
  iconButton: {
    padding: 10,
  },
  placeholderContainer: {
    height: 44, // Same height as button container
    marginTop: 20,
  },
});
