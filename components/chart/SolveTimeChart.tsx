import { DNF_VALUE } from "@/constants/constants";
import { convertCubingTime } from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { Statistics } from "@/structures.tsx/statistics";
import { ChartSeries, SolveData } from "@/types/types";
import { useFont } from "@shopify/react-native-skia";
import React, { ReactNode } from "react";
import { View } from "react-native";
import { CartesianChart, Line, PointsArray, Scatter } from "victory-native";
import SolveChartLegend from "./SolveChartLegend";
import SolveChartStats from "./SolveChartStats";

export default function SolveTimeChart({
  solveData,
  chartSeries,
  trimPercentage,
  currentSession,
}: {
  solveData: SolveData[];
  chartSeries: ChartSeries[];
  trimPercentage: number;
  currentSession: number;
}) {
  const { colors } = useSettings();
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"));

  const statistics = new Statistics(trimPercentage, currentSession);
  solveData.forEach((solve) => statistics.addSolve(solve));

  const chartData = statistics.getGlobalChartData().map((point, index) => {
    return {
      solveId: point.solveId,
      time: point.solveTime,
      ao5: point.ao5,
      ao12: point.ao12,
      index,
      personalBest: point.personalBest,
    };
  });

  for (let i = 0; i < chartData.length; i++) {
    const point = chartData[i];
    for (const key in point) {
      const val = point[key as keyof typeof point];
      if (val === DNF_VALUE || (typeof val === "number" && val < 0))
        delete point[key as keyof typeof point];
    }

    point["index"] = i + 1;
  }

  const xMax = chartData.length;
  const yMax = Math.max(...chartData.map((point) => point.time || 0));

  function renderSeries(
    pointsArray: PointsArray,
    series: ChartSeries,
  ): ReactNode {
    if (series.graphDisplay === "line") {
      return pointsArray.length > 1 ? (
        <Line
          key={series.property}
          color={series.color}
          strokeWidth={3}
          connectMissingData={series.connectMissingData}
          points={pointsArray}
        />
      ) : (
        <Scatter
          key={series.property}
          color={series.color}
          strokeWidth={3}
          points={pointsArray}
        />
      );
    }

    return (
      <View key={series.property}>
        <Scatter points={pointsArray} color={series.color} radius={5} />
        <Line
          points={pointsArray}
          color={series.color}
          strokeWidth={3}
          connectMissingData={series.connectMissingData}
        />
      </View>
    );
  }
  return (
    <View style={{ height: 600, backgroundColor: colors.background }}>
      <CartesianChart
        data={chartData}
        xKey={"index"}
        yKeys={["time", "ao5", "ao12", "personalBest"]}
        domain={{ x: [0, xMax], y: [0, yMax] }}
        xAxis={{
          font,
          labelColor: colors.text,
          lineColor: colors.text,
        }}
        yAxis={[
          {
            font,
            labelColor: colors.text,
            lineColor: colors.text,
            formatYLabel: (val) => {
              if (val === undefined || val === null) return "";
              return convertCubingTime(val, ":", false, false);
            },
          },
        ]}
        axisOptions={{ font, labelColor: colors.text, lineColor: "white" }}
      >
        {({ points }) => (
          <View>
            {chartSeries.map((series) =>
              renderSeries(
                points[series.property as keyof typeof points],
                series,
              ),
            )}
          </View>
        )}
      </CartesianChart>
      <SolveChartLegend chartSeries={chartSeries} />
      <SolveChartStats statisticsData={statistics.getStatsData()} />
    </View>
  );
}
