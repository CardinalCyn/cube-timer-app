import { SampleSolveData } from "@/types/types";
import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { View } from "react-native";
import { CartesianChart, Scatter } from "victory-native";

export default function SolveTimeChart({
  solveData,
  width,
  height,
}: {
  solveData: SampleSolveData[];
  width: number;
  height: number;
}) {
  const A = 3000; // initial value
  const k = 0.02; // decay rate
  const noiseStrength = 10; // adjust randomness amplitude

  const DATA = Array.from({ length: 3000 }, (_, i) => {
    const base = A * Math.exp(-k * i);
    const noise = (Math.random() - 0.5) * noiseStrength;
    const highTmp = Math.max(0, base + noise); // keep values >= 0
    return {
      day: i,
      highTmp,
    };
  });

  const xMax = DATA.length;
  const yMax = Math.max(...DATA.map((point) => point.highTmp));
  const font = useFont(require("../assets/fonts/SpaceMono-Regular.ttf"));

  return (
    <View style={{ width, height, marginHorizontal: "auto" }}>
      <CartesianChart
        data={DATA}
        xKey="day"
        yKeys={["highTmp"]}
        axisOptions={{ font }}
        domain={{ x: [0, xMax], y: [0, yMax + 20] }}
      >
        {({ points }) => (
          //👇 pass a PointsArray to the Scatter component
          <Scatter
            points={points.highTmp}
            radius={10}
            style="fill"
            color="red"
          />
        )}
      </CartesianChart>
    </View>
  );
}
