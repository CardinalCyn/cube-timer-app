import { useSettings } from "@/hooks/useSettings";
import { CubingContextClass } from "@/structures.tsx/cubingContextClass";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type CubingContextProps = {
  cubingContextClass: CubingContextClass | undefined;
};

export const CubingContext = createContext<CubingContextProps>({
  cubingContextClass: undefined,
});

const CURRENT_SESSION_STORAGE_KEY = "@currentsessionindex";

export function CubingProvider({ children }: { children: ReactNode }) {
  const { trimPercentage } = useSettings();
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);

  const cubingContextClass = useMemo(() => {
    return new CubingContextClass(
      currentSessionIndex,
      trimPercentage,
      currentSessionIndex,
      setCurrentSessionIndex,
    );
  }, [currentSessionIndex, trimPercentage]);

  useEffect(() => {
    const loadCurrentSession = async () => {
      try {
        const savedCurrentSession: string | null = await AsyncStorage.getItem(
          CURRENT_SESSION_STORAGE_KEY,
        );

        if (
          savedCurrentSession !== null &&
          !isNaN(Number(savedCurrentSession))
        ) {
          setCurrentSessionIndex(Number(savedCurrentSession));
        }
      } catch (error) {
        console.error("Failed to load current session:", error);
      }
    };

    loadCurrentSession();
  }, []);

  const contextValue: CubingContextProps = { cubingContextClass };

  return (
    <CubingContext.Provider value={contextValue}>
      {children}
    </CubingContext.Provider>
  );
}
