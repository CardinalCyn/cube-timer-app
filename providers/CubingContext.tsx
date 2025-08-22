import Loading from "@/components/Loading";
import { STORAGE_KEYS } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { CubingContextClass } from "@/structures.tsx/cubingContextClass";
import { ScrambleGenerator } from "@/structures.tsx/scrambleGenerator";
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
  scrambleGenerator: ScrambleGenerator | null;
};

export const CubingContext = createContext<CubingContextProps>({
  cubingContextClass: null,
  scrambleGenerator: null,
});

export function CubingProvider({ children }: { children: ReactNode }) {
  const { trimPercentage } = useSettings();
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error("Failed to load app data:", error);
        // Set defaults on any error
        setCurrentSessionIndex(0);
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
      );
      return newCubing;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [currentSessionIndex, trimPercentage]);

  const scrambleGenerator = useMemo(() => {
    try {
      const newScrambleGen = new ScrambleGenerator();
      return newScrambleGen;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  if (isLoading) {
    return <Loading />; // Your app-wide loading component
  }

  const contextValue: CubingContextProps = {
    cubingContextClass,
    scrambleGenerator,
  };

  return (
    <CubingContext.Provider value={contextValue}>
      {children}
    </CubingContext.Provider>
  );
}
