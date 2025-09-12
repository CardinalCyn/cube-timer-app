import { statKeys } from "@/constants/constants";
import { parseStat } from "@/constants/utils";
import { StatisticsStatsData, StatKey, StatVal } from "@/types/types";
import { useState } from "react";
import { View } from "react-native";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Text } from "../ui/text";

type SolveChartStatsProps = {
  statisticsData: StatisticsStatsData;
};

export default function SolveChartStats({
  statisticsData,
}: SolveChartStatsProps) {
  const [statSelected, setStatSelected] = useState<StatKey>("improvementStats");

  const changeTab = (val: string) => {
    if (statKeys.includes(val as StatKey)) {
      setStatSelected(val as StatKey);
    }
  };

  return (
    <View className="p-4">
      {/* Tab Selector */}
      <Tabs value={statSelected} onValueChange={changeTab} className="mx-auto">
        <TabsList>
          {Object.keys(statisticsData).map((statType) => {
            const key = statType as keyof typeof statisticsData;
            return (
              <TabsTrigger value={key} key={key}>
                <Text>{statisticsData[key].header}</Text>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <Separator className="my-2" />

      {/* Stats Table */}
      <View className="mt-2">
        {/* Headers */}
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-semibold">Statistic</Text>
          <Text className="flex-1 text-center font-semibold">Global</Text>
          <Text className="flex-1 text-right font-semibold">Session</Text>
        </View>

        <Separator className="my-1" />

        {/* Data Rows */}
        {Object.keys(statisticsData[statSelected].global).map((key, idx) => {
          const global = statisticsData[statSelected].global as Record<
            string,
            StatVal
          >;
          const currentSession = statisticsData[statSelected]
            .currentSession as Record<string, StatVal>;

          return (
            <View
              key={key}
              className={`flex-row justify-between items-center px-2 py-2 rounded-lg`}
            >
              <Text className="flex-1">{key}</Text>
              <Text className="flex-1 text-center">
                {parseStat(global[key as keyof typeof global].value, key)}
              </Text>
              <Text className="flex-1 text-right">
                {parseStat(
                  currentSession[key as keyof typeof currentSession].value,
                  key,
                )}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
