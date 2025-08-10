import { CubingContext } from "@/providers/CubingContext";
import { useContext } from "react";

export function useCubing() {
  const { cubingContextClass } = useContext(CubingContext);

  if (!cubingContextClass) {
    throw new Error(
      "CubingContextClass is not initialized. Make sure useCubing is used within a CubingProvider",
    );
  }

  return { cubingContextClass };
}
