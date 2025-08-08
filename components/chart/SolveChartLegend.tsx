import { useTheme } from "@/hooks/useTheme";
import { ChartSeries } from "@/types/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";

interface SolveChartLegendProps {
  chartSeries: ChartSeries[];
}

export default function SolveChartLegend({
  chartSeries,
}: SolveChartLegendProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.legendContainer, { backgroundColor: colors.background }]}
    >
      {chartSeries.map((series) => (
        <View key={series.property} style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: series.color }]}
          ></View>
          <TextCustomFont style={[styles.legendText]}>
            {series.title}
          </TextCustomFont>
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
