import SolveTimeChart from "@/components/SolveTimeChart";
import { sampleAnalyticsData } from "@/constants/constants";
import { View } from "react-native";

export default function StandardAnalytics() {
  return (
    <View style={{ flex: 1 }}>
      <SolveTimeChart solveData={sampleAnalyticsData} />
    </View>
  );
}
