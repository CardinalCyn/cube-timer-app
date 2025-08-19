import Loading from "@/components/Loading";
import {
  defaultPracticePuzzleCategory,
  defaultTimerPuzzleCategory,
  STORAGE_KEYS,
  subset3x3Data,
  WCAScrData,
} from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { CubingContextClass } from "@/structures.tsx/cubingContextClass";
import { Subset3x3ScrambleCategory, WCAScrambleCategory } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
type CubingContextProps = {
  cubingContextClass: CubingContextClass | null;
  currentTimerPuzzleCategory: WCAScrambleCategory;
  setCurrentTimerPuzzleCategory: (puzzleCategory: WCAScrambleCategory) => void;
  currentPracticePuzzleCategory: Subset3x3ScrambleCategory;
  setCurrentPracticePuzzleCategory: (
    puzzleCategory: Subset3x3ScrambleCategory,
  ) => void;
};

export const CubingContext = createContext<CubingContextProps>({
  cubingContextClass: null,
  currentTimerPuzzleCategory: defaultTimerPuzzleCategory,
  setCurrentTimerPuzzleCategory: () => {},
  currentPracticePuzzleCategory: defaultPracticePuzzleCategory,
  setCurrentPracticePuzzleCategory: () => {},
});

export function CubingProvider({ children }: { children: ReactNode }) {
  const { trimPercentage } = useSettings();
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const [currentTimerPuzzleCategory, setCurrentTimerPuzzleCategory] =
    useState<WCAScrambleCategory>(defaultTimerPuzzleCategory);
  const [currentPracticePuzzleCategory, setCurrentPracticePuzzleCategory] =
    useState<Subset3x3ScrambleCategory>(defaultPracticePuzzleCategory);

  useEffect(() => {
    async function loadAppData() {
      try {
        // Load current session data
        const savedCurrentSession = Number(
          await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION),
        );
        if (!isNaN(savedCurrentSession)) {
          setCurrentSessionIndex(savedCurrentSession);
        } else {
          setCurrentSessionIndex(0);
        }

        // Load timer puzzle category
        const savedTimerScrambleCode = await AsyncStorage.getItem(
          STORAGE_KEYS.TIMER_CUBING_CATEGORY,
        );

        if (savedTimerScrambleCode === null) {
          setCurrentTimerPuzzleCategory(defaultTimerPuzzleCategory);
        } else {
          const foundTimerCategory = WCAScrData.find(
            (cat) => cat.scrambleCode === savedTimerScrambleCode,
          );
          setCurrentTimerPuzzleCategory(
            foundTimerCategory || defaultTimerPuzzleCategory,
          );
        }

        // Load practice puzzle category
        const savedPracticeScrambleCode = await AsyncStorage.getItem(
          STORAGE_KEYS.PRACTICE_CUBING_CATEGORY,
        );

        if (savedPracticeScrambleCode === null) {
          setCurrentPracticePuzzleCategory(defaultPracticePuzzleCategory);
        } else {
          const foundPracticeCategory = subset3x3Data.find(
            (cat) => cat.scrambleCode === savedPracticeScrambleCode,
          );
          setCurrentPracticePuzzleCategory(
            foundPracticeCategory || defaultPracticePuzzleCategory,
          );
        }
      } catch (error) {
        console.error("Failed to load app data:", error);
        // Set defaults on any error
        setCurrentSessionIndex(0);
        setCurrentTimerPuzzleCategory(defaultTimerPuzzleCategory);
        setCurrentPracticePuzzleCategory(defaultPracticePuzzleCategory);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppData();
  }, []);

  const cubingContextClass = useMemo(() => {
    if (currentSessionIndex === null) return null;
    try {
      const newCubing = new CubingContextClass(
        currentSessionIndex,
        trimPercentage,
        currentTimerPuzzleCategory.scrambleCode,
        currentPracticePuzzleCategory.scrambleCode,
      );
      return newCubing;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [currentSessionIndex, trimPercentage]);

  if (isLoading) {
    return <Loading />; // Your app-wide loading component
  }

  const contextValue: CubingContextProps = {
    cubingContextClass,
    currentTimerPuzzleCategory,
    setCurrentTimerPuzzleCategory,
    currentPracticePuzzleCategory,
    setCurrentPracticePuzzleCategory,
  };

  return (
    <CubingContext.Provider value={contextValue}>
      {children}
    </CubingContext.Provider>
  );
}
