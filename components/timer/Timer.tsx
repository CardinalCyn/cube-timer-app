import { calculatePenaltySolveTime } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import {
  NavbarType,
  PenaltyState,
  SolveData,
  ValidPuzzleCode,
} from "@/types/types";
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
  const [scramble, setScramble] = useState("");
  const [isGeneratingScramble, setIsGeneratingScramble] = useState(false);
  const [isScrambleGeneratorReady, setIsScrambleGeneratorReady] =
    useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSolve, setLastSolve] = useState<SolveData | null>(null);
  const [currentPenaltyState, setCurrentPenaltyState] =
    useState<PenaltyState>("noPenalty");

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const scrambleGenerationRef = useRef<string | null>(null);

  const showControls = !isRunning && (lastSolve?.id || -1) !== -1;
  const showUndoOnly = showControls && currentPenaltyState !== "noPenalty";

  // Wait for scramble generator to be ready
  useEffect(() => {
    async function waitForGenerator() {
      if (scrambleGenerator) {
        await scrambleGenerator.waitForInitialization();
        setIsScrambleGeneratorReady(true);
      }
    }
    waitForGenerator();
  }, [scrambleGenerator]);

  // Generate initial scramble only after generator is ready
  useEffect(() => {
    if (isScrambleGeneratorReady && !scramble) {
      generateInitialScramble();
    }
  }, [isScrambleGeneratorReady]);

  const generateInitialScramble = () => {
    if (!scrambleGenerator?.isReady) {
      setErrorMessage("Scramble generator not ready");
      return;
    }

    setIsGeneratingScramble(true);
    try {
      const newScramble = scrambleGenerator.getNextScramble(
        currentPuzzleCategory,
      );
      setScramble(newScramble);
      setErrorMessage(""); // Clear any previous errors
    } catch (error) {
      setErrorMessage("Failed to generate scramble");
    } finally {
      setIsGeneratingScramble(false);
    }
  };

  const generateNewScramble = async (puzzleCategory: ValidPuzzleCode) => {
    if (!scrambleGenerator?.isReady) {
      setErrorMessage("Scramble generator not ready");
      return;
    }

    const generationId = Math.random().toString();
    scrambleGenerationRef.current = generationId;

    setIsGeneratingScramble(true);

    try {
      const newScramble = scrambleGenerator.getNextScramble(puzzleCategory);

      if (scrambleGenerationRef.current === generationId) {
        setScramble(newScramble);
        setErrorMessage(""); // Clear any previous errors
      }
    } catch (error) {
      if (scrambleGenerationRef.current === generationId) {
        setErrorMessage("Failed to generate scramble");
      }
    } finally {
      if (scrambleGenerationRef.current === generationId) {
        setIsGeneratingScramble(false);
      }
    }
  };

  function toggleTimer() {
    // Don't allow starting timer if scramble isn't ready
    if (!scramble || isGeneratingScramble) {
      setErrorMessage("Please wait for scramble to load");
      return;
    }

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
        // Generate new scramble asynchronously after solve is added
        generateNewScramble(currentPuzzleCategory);
      }
    }
  }

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

    // Only generate new scramble if generator is ready
    if (isScrambleGeneratorReady) {
      generateNewScramble(currentPuzzleCategory);
    }
  }, [currentPuzzleCategory, isScrambleGeneratorReady]);

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
        // Reset to initial state after deleting
        setElapsedTime(0);
        setIsRunning(false);
        setLastSolve(null);
        setCurrentPenaltyState("noPenalty");
        // Generate new scramble after deletion
        generateNewScramble(currentPuzzleCategory);
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

  // Show loading state while generator initializes
  if (!isScrambleGeneratorReady) {
    return (
      <View style={styles.container}>
        <View style={styles.timerContainer}>
          <ScrambleDisplay scramble="Initializing..." />
          <TimerDisplay elapsedTime={0} penaltyState="noPenalty" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ErrorDisplay errorMessage={errorMessage} />
      <ScrambleDisplay
        scramble={isGeneratingScramble ? "Generating scramble..." : scramble}
      />
      <Pressable
        style={styles.pressableContainer}
        onPress={toggleTimer}
        disabled={isGeneratingScramble || !scramble}
      >
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
              <MaterialIcons
                name="delete"
                size={24}
                color={colors.text}
                onPress={() => deleteSolve()}
                style={styles.iconButton}
              />
              <MaterialIcons
                name="cancel"
                size={24}
                color={colors.text}
                onPress={() => updatePenaltyState("DNF")}
                style={styles.iconButton}
              />
              <MaterialIcons
                name="flag"
                size={24}
                color={colors.text}
                onPress={() => updatePenaltyState("+2")}
                style={styles.iconButton}
              />
            </View>
          ) : (
            <View style={styles.placeholderContainer} />
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
