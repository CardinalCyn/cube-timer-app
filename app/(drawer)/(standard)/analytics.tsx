import SolveTimeChart from "@/components/SolveTimeChart";
import { sampleAnalyticsData } from "@/constants/constants";
import { Dimensions, View } from "react-native";

export default function StandardAnalytics() {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  return (
    <View style={{ flex: 1 }}>
      <SolveTimeChart
        solveData={sampleAnalyticsData}
        width={windowWidth - 50}
        height={windowHeight / 3}
      />
    </View>
  );
}
