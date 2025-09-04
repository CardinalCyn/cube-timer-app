import SolveTimeChart from "@/components/chart/SolveTimeChart";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function StandardAnalytics() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        showsVerticalScrollIndicator={true}
      >
        <SolveTimeChart navbarType="timer" />
      </ScrollView>
    </View>
  );
}
