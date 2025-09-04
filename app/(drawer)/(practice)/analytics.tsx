import SolveTimeChart from "@/components/chart/SolveTimeChart";
import { View } from "react-native";

export default function PracticeAnalytics() {
  return (
    <View style={{ flex: 1 }}>
      <SolveTimeChart navbarType="practice" />
    </View>
  );
}
