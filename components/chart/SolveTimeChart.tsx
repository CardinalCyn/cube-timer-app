import { DNF_VALUE } from "@/constants/constants";
import { convertCubingTime, hslToHex } from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { ChartDataPoint } from "@/structures.tsx/statistics";
import { ChartSeries, NavbarType } from "@/types/types";
import { useFont } from "@shopify/react-native-skia";
import { useFocusEffect } from "expo-router";
import React, { ReactNode, useCallback, useState } from "react";
import { View } from "react-native";
import { CartesianChart, Line, PointsArray, Scatter } from "victory-native";
import SolveChartLegend from "./SolveChartLegend";
import SolveChartStats from "./SolveChartStats";

type SolveTimeChartProps = {
  navbarType: NavbarType;
};

export default function SolveTimeChart({ navbarType }: SolveTimeChartProps) {
  let { colors } = useSettings();

  const chartSeries: ChartSeries[] = [
    {
      title: "Time",
      property: "solveTime",
      color: hslToHex(colors.colors.chart1),
      connectMissingData: true,
      graphDisplay: "line",
    },
    {
      title: "Ao5",
      property: "ao5",
      color: hslToHex(colors.colors.chart2),
      connectMissingData: true,
      graphDisplay: "line",
    },
    {
      title: "Ao12",
      property: "ao12",
      color: hslToHex(colors.colors.chart3),
      connectMissingData: true,
      graphDisplay: "line",
    },
    {
      title: "Personal Best",
      property: "personalBest",
      color: hslToHex(colors.colors.chart4),
      connectMissingData: true,
      graphDisplay: "both",
    },
  ];
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"));
  const [chartData, setChartData] = useState<
    (ChartDataPoint & { index: number })[]
  >([]);
  const { cubingContextClass } = useCubing();

  useFocusEffect(
    useCallback(() => {
      const val = cubingContextClass
        .getGlobalChartData(navbarType)
        .map((point, index) => {
          return {
            solveId: point.solveId,
            solveTime: point.solveTime,
            ao5: point.ao5,
            ao12: point.ao12,
            index,
            personalBest: point.personalBest,
          };
        });

      setChartData(val);
    }, [navbarType, cubingContextClass]),
  );

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
  const yMax = Math.max(...chartData.map((point) => point.solveTime || 0));

  function renderSeries(
    pointsArray: PointsArray,
    series: ChartSeries,
  ): ReactNode {
    if (!pointsArray) return null;
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
    <View style={{ height: 600 }}>
      <CartesianChart
        data={chartData}
        xKey={"index"}
        yKeys={["solveTime", "ao5", "ao12", "personalBest"]}
        domain={{ x: [0, xMax], y: [0, yMax] }}
        xAxis={{
          font,
          labelColor: hslToHex(colors.colors.text),
          lineColor: hslToHex(colors.colors.text),
        }}
        yAxis={[
          {
            font,
            labelColor: hslToHex(colors.colors.text),
            lineColor: hslToHex(colors.colors.text),
            formatYLabel: (val) => {
              if (val === undefined || val === null) return "";
              return convertCubingTime(val, ":", false, false);
            },
          },
        ]}
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
      <SolveChartStats
        statisticsData={cubingContextClass.getStatsData(navbarType)}
      />
    </View>
  );
}
