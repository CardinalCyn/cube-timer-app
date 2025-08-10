import SolveTimeChart from "@/components/chart/SolveTimeChart";
import { chartSeries } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { View } from "react-native";

export default function PracticeAnalytics() {
  const { colors } = useSettings();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SolveTimeChart chartSeries={chartSeries} />
    </View>
  );
}
