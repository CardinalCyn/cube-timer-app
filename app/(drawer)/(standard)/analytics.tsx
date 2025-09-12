import SolveTimeChart from "@/components/chart/SolveTimeChart";
import { View } from "react-native";

export default function StandardAnalytics() {
  return (
    <View style={{ flex: 1 }}>
      <SolveTimeChart navbarType="timer" />
    </View>
  );
}
