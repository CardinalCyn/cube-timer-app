import { parseStat } from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { StatisticsStatsData, StatVal } from "@/types/types";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";

type SolveChartStatsProps = {
  statisticsData: StatisticsStatsData;
};

export default function SolveChartStats({
  statisticsData,
}: SolveChartStatsProps) {
  const { colors } = useSettings();
  const [statSelected, setStatSelected] =
    useState<keyof StatisticsStatsData>("improvementStats");

  return (
    <View style={[styles.statsContainer]}>
      {/* Tab Selector */}
      <View style={styles.buttonContainer}>
        {Object.keys(statisticsData).map((statType, index) => {
          const key = statType as keyof typeof statisticsData;
          const isSelected = statSelected === key;
          const isFirst = index === 0;
          const isLast = index === Object.keys(statisticsData).length - 1;

          return (
            <Pressable
              key={key}
              onPress={() => setStatSelected(key)}
              style={[
                styles.pressable,
                {
                  backgroundColor: isSelected ? colors.card : colors.background,
                  borderTopLeftRadius: isFirst ? 8 : 0,
                  borderBottomLeftRadius: isFirst ? 8 : 0,
                  borderTopRightRadius: isLast ? 8 : 0,
                  borderBottomRightRadius: isLast ? 8 : 0,
                },
              ]}
            >
              <TextCustomFont style={[styles.tabText, { color: colors.text }]}>
                {statisticsData[key].header}
              </TextCustomFont>
            </Pressable>
          );
        })}
      </View>

      {/* Stats Table */}
      <View
        style={[
          styles.statsBox,
          {
            borderColor: colors.border,
          },
        ]}
      >
        {/* Headers */}
        <View style={styles.headerRow}>
          <View style={[styles.statsCol, styles.labelCol]}>
            <TextCustomFont style={[styles.headerText, { color: colors.text }]}>
              Statistic
            </TextCustomFont>
          </View>
          <View style={[styles.statsCol, styles.dataCol]}>
            <TextCustomFont style={[styles.headerText, { color: colors.text }]}>
              Global
            </TextCustomFont>
          </View>
          <View style={[styles.statsCol, styles.dataCol]}>
            <TextCustomFont style={[styles.headerText, { color: colors.text }]}>
              Session
            </TextCustomFont>
          </View>
        </View>

        {/* Data Rows */}
        <View style={styles.dataContainer}>
          {Object.keys(statisticsData[statSelected].global).map(
            (key, index) => {
              const global = statisticsData[statSelected].global as Record<
                string,
                StatVal
              >;
              const currentSession = statisticsData[statSelected]
                .currentSession as Record<string, StatVal>;
              const isEven = index % 2 === 0;

              return (
                <View
                  key={key}
                  style={[
                    styles.dataRow,
                    { backgroundColor: isEven ? "transparent" : colors.card },
                  ]}
                >
                  <View style={[styles.statsCol, styles.labelCol]}>
                    <TextCustomFont
                      style={[styles.labelText, { color: colors.text }]}
                    >
                      {key}
                    </TextCustomFont>
                  </View>
                  <View style={[styles.statsCol, styles.dataCol]}>
                    <TextCustomFont
                      style={[styles.dataText, { color: colors.text }]}
                    >
                      {parseStat(global[key as keyof typeof global].value, key)}
                    </TextCustomFont>
                  </View>
                  <View style={[styles.statsCol, styles.dataCol]}>
                    <TextCustomFont
                      style={[styles.dataText, { color: colors.text }]}
                    >
                      {parseStat(
                        currentSession[key as keyof typeof currentSession]
                          .value,
                        key,
                      )}
                    </TextCustomFont>
                  </View>
                </View>
              );
            },
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statsBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E5E7",
  },
  dataContainer: {
    paddingVertical: 4,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: "center",
  },
  statsCol: {
    justifyContent: "center",
  },
  labelCol: {
    flex: 2,
    paddingRight: 12,
  },
  dataCol: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  dataText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    fontVariant: ["tabular-nums"], // Ensures consistent number spacing
  },
});
