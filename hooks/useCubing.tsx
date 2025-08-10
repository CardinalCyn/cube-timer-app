import { CubingContext } from "@/providers/CubingContext";
import { useContext } from "react";

export function useCubing() {
  const context = useContext(CubingContext);

  if (!context) {
    throw new Error("useCubing must be used within a CubingProvider");
  }

  const { cubingContextClass } = context;

  return {
    cubingContextClass,
  };
}
