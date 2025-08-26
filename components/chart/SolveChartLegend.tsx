import { ChartSeries } from "@/types/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../ui/text";

interface SolveChartLegendProps {
  chartSeries: ChartSeries[];
}

export default function SolveChartLegend({
  chartSeries,
}: SolveChartLegendProps) {
  return (
    <View style={[styles.legendContainer]}>
      {chartSeries.map((series) => (
        <View key={series.property} style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: series.color }]}
          ></View>
          <Text style={[styles.legendText]}>{series.title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
