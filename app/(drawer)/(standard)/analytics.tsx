import SolveTimeChart from "@/components/chart/SolveTimeChart";
import { chartSeries } from "@/constants/constants";
import { View } from "react-native";

export default function StandardAnalytics() {
  return (
    <View style={{ flex: 1 }}>
      <SolveTimeChart chartSeries={chartSeries} navbarType="timer" />
    </View>
  );
}
