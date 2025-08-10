import Loading from "@/components/Loading";
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
  cubingContextClass: CubingContextClass | null;
};

export const CubingContext = createContext<CubingContextProps>({
  cubingContextClass: null,
});

const CURRENT_SESSION_STORAGE_KEY = "@app_current_session";

export function CubingProvider({ children }: { children: ReactNode }) {
  const { trimPercentage } = useSettings();
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

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
        } else {
          setCurrentSessionIndex(0); // Default to 0 if nothing saved
        }
      } catch (error) {
        console.error("Failed to load current session:", error);
        setCurrentSessionIndex(0); // Default to 0 on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentSession();
  }, []);

  const cubingContextClass = useMemo(() => {
    if (currentSessionIndex === null) return null;

    return new CubingContextClass(
      currentSessionIndex,
      trimPercentage,
      currentSessionIndex,
      setCurrentSessionIndex,
    );
  }, [currentSessionIndex, trimPercentage]);

  if (isLoading) {
    return <Loading />; // Your app-wide loading component
  }

  const contextValue: CubingContextProps = {
    cubingContextClass,
  };

  return (
    <CubingContext.Provider value={contextValue}>
      {children}
    </CubingContext.Provider>
  );
}
