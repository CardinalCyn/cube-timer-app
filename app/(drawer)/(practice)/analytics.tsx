import SolveTimeChart from "@/components/chart/SolveTimeChart";
import {
  chartSeries,
  currentSessionIndex,
  sampleSolveData,
  trimPercentage,
} from "@/constants/constants";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function PracticeAnalytics() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SolveTimeChart
        solveData={sampleSolveData}
        chartSeries={chartSeries}
        currentSession={currentSessionIndex}
        trimPercentage={trimPercentage}
      />
    </View>
  );
}
