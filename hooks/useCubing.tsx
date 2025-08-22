import { CubingContext } from "@/providers/CubingContext";
import { useContext } from "react";

export function useCubing() {
  const context = useContext(CubingContext);

  if (!context) {
    throw new Error("useCubing must be used within a CubingProvider");
  }

  const { cubingContextClass, scrambleGenerator } = context;

  if (!cubingContextClass) {
    throw new Error(
      "CubingContextClass is not initialized. Make sure useCubing is used within a CubingProvider",
    );
  }

  if (!scrambleGenerator) {
    throw new Error(
      "Scramble generator is not initialized. Make sure useCubing is used within a CubingProvider",
    );
  }

  return {
    cubingContextClass,
    scrambleGenerator,
  };
}
