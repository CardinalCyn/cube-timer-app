import SolveDetailModal from "@/components/SolveDetailModal";
import { TextCustomFont } from "@/components/TextCustomFont";
import { sampleSolveData } from "@/constants/constants";
import { formatTime } from "@/constants/utils";
import { useTheme } from "@/hooks/useTheme";
import { SampleSolveData } from "@/types/types";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export default function StandardHistory() {
  const { colors } = useTheme();
  const [selectedSolve, setSelectedSolve] = useState<SampleSolveData | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const numColumns = 3;
  const placeHolderedData: (SampleSolveData | null)[] = [...sampleSolveData];
  while (placeHolderedData.length % numColumns) placeHolderedData.push(null);

  const handleSolvePress = (solve: SampleSolveData) => {
    setSelectedSolve(solve);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSolve(null);
  };

  const renderSolveItem = ({ item }: { item: SampleSolveData | null }) => {
    if (item === null) return <View style={styles.pressableContainer} />;
    return (
      <Pressable
        style={[styles.pressableContainer, { backgroundColor: colors.card }]}
        onPress={() => handleSolvePress(item)}
      >
        <TextCustomFont style={[styles.solveTime]}>
          {item.solveTime === "DNF"
            ? item.solveTime
            : formatTime(item.solveTime, ".", false)}
        </TextCustomFont>
        {item.date && (
          <TextCustomFont style={[styles.date]}>
            {new Date(item.date).toLocaleDateString()}
          </TextCustomFont>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={placeHolderedData}
        renderItem={renderSolveItem}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <SolveDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        solveData={selectedSolve}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pressableContainer: {
    flex: 1,
    borderRadius: 12,
    elevation: 3,
    minHeight: 150,
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 8,
  },
  solveTime: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.5,
  },
});
