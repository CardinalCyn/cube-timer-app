//logic for stopping, starting a timer

import { DNF_VALUE, penaltySolveTime } from "@/constants/constants";
import { calculatePenaltySolveTime, generateScramble } from "@/constants/utils";
import { PenaltyState, SolveData, ValidPuzzleCode } from "@/types/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCubing } from "./useCubing";
import { useSettings } from "./useSettings";

type UseTimerProps = {
  currentPuzzleCategory: ValidPuzzleCode;
};

export default function useTimer({ currentPuzzleCategory }: UseTimerProps) {
  const { cubingContextClass } = useCubing();
  const { inspectionTime, inspectionEnabled } = useSettings();

  const [isInspecting, setIsInspecting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSolve, setLastSolve] = useState<SolveData | null>(null);
  const [currentPenaltyState, setCurrentPenaltyState] =
    useState<PenaltyState>("noPenalty");
  const [runningInspectionTime, setRunningInspectionTime] = useState(0);
  const [runningSolveTime, setRunningSolveTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [scramble, setScramble] = useState(() =>
    generateScramble(currentPuzzleCategory),
  );

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const addSolveWithActualTime = useCallback(
    async (actualTime: number, penaltyState: PenaltyState): Promise<number> => {
      try {
        const solveToAdd: Omit<SolveData, "id"> = {
          scramble,
          solveTime: actualTime,
          date: new Date(),
          penaltyState: penaltyState,
          session: 0,
          puzzleScrambleCode: currentPuzzleCategory,
        };

        const addSolveResults = await cubingContextClass.addSolve(
          solveToAdd,
          currentPuzzleCategory,
        );

        if (addSolveResults.status === "error") {
          setErrorMessage(addSolveResults.message);
          return -1;
        } else {
          setErrorMessage("");
          return addSolveResults.solveId;
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to add solve");
        return -1;
      }
    },
    [scramble, currentPuzzleCategory, cubingContextClass],
  );

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setLastSolve(null);
    setRunningSolveTime(0);
    setIsInspecting(false);
    if (!inspectionEnabled) setCurrentPenaltyState("noPenalty");

    clearTimer();
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setRunningSolveTime(Date.now() - startTimeRef.current);
      }
    }, 10);
  }, [inspectionEnabled, clearTimer]);

  const stopTimer = useCallback(
    async (penaltyState?: PenaltyState) => {
      setIsRunning(false);
      setIsInspecting(false);

      // Calculate actual elapsed time at the moment we stop
      const actualElapsedTime = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : runningSolveTime;

      clearTimer();

      const finalPenaltyState = penaltyState || currentPenaltyState;

      if (actualElapsedTime > 0 || finalPenaltyState === "DNF") {
        const solveId = await addSolveWithActualTime(
          actualElapsedTime,
          finalPenaltyState,
        );
        if (solveId !== -1) {
          setLastSolve({
            scramble,
            solveTime: actualElapsedTime, // Use actual time, not state
            date: new Date(),
            penaltyState: finalPenaltyState,
            session: 0,
            puzzleScrambleCode: currentPuzzleCategory,
            id: solveId,
          });
        }
      }

      // Generate new scramble
      setScramble(generateScramble(currentPuzzleCategory));

      // Set final display time
      if (finalPenaltyState === "DNF") {
        setRunningSolveTime(DNF_VALUE);
      } else {
        const finalDisplayTime = calculatePenaltySolveTime(
          actualElapsedTime,
          finalPenaltyState,
        );
        setRunningSolveTime(finalDisplayTime);
      }
    },
    [
      runningSolveTime,
      currentPenaltyState,
      clearTimer,
      addSolveWithActualTime,
      scramble,
      currentPuzzleCategory,
    ],
  );

  const startInspecting = useCallback(() => {
    setIsInspecting(true);
    setIsRunning(true);
    setLastSolve(null);
    setCurrentPenaltyState("noPenalty");
    setRunningInspectionTime(inspectionTime);

    clearTimer();
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const difference = Date.now() - startTimeRef.current;

        if (difference <= inspectionTime) {
          // Normal inspection countdown
          setRunningInspectionTime(inspectionTime - difference);
        } else {
          if (difference > inspectionTime + penaltySolveTime) {
            // DNF case - clear timer immediately and add DNF solve
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setCurrentPenaltyState("DNF");
            setRunningSolveTime(DNF_VALUE);

            // Add DNF solve with 0 time (inspection timeout)
            addSolveWithActualTime(0, "DNF").then((solveId) => {
              if (solveId !== -1) {
                setLastSolve({
                  scramble,
                  solveTime: 0,
                  date: new Date(),
                  penaltyState: "DNF",
                  session: 0,
                  puzzleScrambleCode: currentPuzzleCategory,
                  id: solveId,
                });
              }
              setIsRunning(false);
              setIsInspecting(false);
              setScramble(generateScramble(currentPuzzleCategory));
            });
          } else {
            // +2 case
            setRunningInspectionTime(inspectionTime - difference);
            setCurrentPenaltyState("+2");
          }
        }
      }
    }, 10);
  }, [
    inspectionTime,
    clearTimer,
    addSolveWithActualTime,
    scramble,
    currentPuzzleCategory,
  ]);

  const toggleTimer = useCallback(() => {
    if (isRunning && !isInspecting) {
      stopTimer();
    } else {
      if (!inspectionEnabled || isInspecting) {
        startTimer();
      } else {
        startInspecting();
      }
    }
  }, [
    isRunning,
    isInspecting,
    inspectionEnabled,
    stopTimer,
    startTimer,
    startInspecting,
  ]);

  const deleteSolve = useCallback(async (): Promise<void> => {
    if (!lastSolve) {
      setErrorMessage("No solve to delete");
      return;
    }

    try {
      const removeSolveResult = await cubingContextClass.removeSolve(
        lastSolve.id,
        currentPuzzleCategory,
      );

      if (removeSolveResult.status === "error") {
        setErrorMessage(removeSolveResult.message);
      } else {
        setErrorMessage("");
        setRunningSolveTime(0);
        setIsRunning(false);
        setLastSolve(null);
        setCurrentPenaltyState("noPenalty");
      }
    } catch (error) {
      setErrorMessage("Failed to delete solve");
    }
  }, [lastSolve, cubingContextClass, currentPuzzleCategory]);

  const updatePenaltyState = useCallback(
    (penaltyState: PenaltyState) => {
      if (!lastSolve) {
        setErrorMessage("No solve to update penalty for");
        return;
      }

      const prevPenaltyState = currentPenaltyState;
      const prevTime = runningSolveTime;

      try {
        setCurrentPenaltyState(penaltyState);
        const newTime = calculatePenaltySolveTime(
          lastSolve.solveTime,
          penaltyState,
        );
        setRunningSolveTime(newTime);

        const updatePenaltyStateResults = cubingContextClass.changePenaltyState(
          lastSolve.id,
          penaltyState,
        );

        if (updatePenaltyStateResults.status === "error") {
          // Revert on error
          setCurrentPenaltyState(lastSolve.penaltyState);
          setRunningSolveTime(prevTime);
          setErrorMessage(updatePenaltyStateResults.message);
          return;
        }

        setLastSolve({ ...lastSolve, penaltyState: penaltyState });
        setErrorMessage("");
      } catch (error) {
        // Revert on error
        setCurrentPenaltyState(prevPenaltyState);
        setRunningSolveTime(prevTime);
        setErrorMessage("Failed to update penalty state");
      }
    },
    [lastSolve, currentPenaltyState, runningSolveTime, cubingContextClass],
  );

  return {
    currentPenaltyState,
    isRunning,
    lastSolve,
    errorMessage,
    scramble,
    runningSolveTime,
    isInspecting,
    runningInspectionTime,
    toggleTimer,
    updatePenaltyState,
    deleteSolve,
    setErrorMessage,
  };
}
