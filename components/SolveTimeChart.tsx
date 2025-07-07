import { SampleSolveData } from "@/types/types";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function SolveTimeChart({
  solveData,
}: {
  solveData: SampleSolveData[];
}) {
  // Filter out DNF and prepare data for chart
  const processChartData = (data: SampleSolveData[]) => {
    const validSolves = data.filter(
      (solve) =>
        solve.solveTime !== "DNF" && typeof solve.solveTime === "number",
    );
    //ascending sort
    const sortedSolves = validSolves.sort((a, b) => {
      return a.date < b.date ? 1 : -1;
    });

    const labelInterval = Math.ceil(sortedSolves.length / 10);
    const labels = sortedSolves.map((_, index) =>
      index % labelInterval === labelInterval - 1 ? `${index + 1}` : "",
    );

    return {
      labels: [...labels],
      datasets: [
        {
          data: [
            ...sortedSolves.map((solve) => (solve.solveTime as number) / 1000),
          ], // Convert to seconds
          color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`, // Blue line
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = processChartData(solveData);

  return (
    <View>
      {/* Chart */}
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 60} // from react-native
        height={220}
        yAxisSuffix="s"
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      {/* Chart Labels */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
          Solve Progression
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Solve Number (X) vs Time in Seconds (Y)
        </Text>
      </View>
    </View>
  );
}
