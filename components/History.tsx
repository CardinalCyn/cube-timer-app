import SolveDetailModal from "@/components/SolveDetailModal";
import { TextCustomFont } from "@/components/TextCustomFont";
import { DNF_VALUE } from "@/constants/constants";
import {
  calculatePenaltySolveTime,
  convertCubingTime,
} from "@/constants/utils";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { SolveData } from "@/types/types";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import ErrorDisplay from "./ErrorDisplay";

export default function History() {
  const { colors } = useSettings();
  const [selectedSolve, setSelectedSolve] = useState<SolveData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const numColumns = 3;

  const { cubingContextClass } = useCubing();
  const getSolvesBySessionIdResult = cubingContextClass.getSolvesBySessionId(
    false,
    0,
  );
  let solveData: (SolveData | null)[] = [];
  if (getSolvesBySessionIdResult.status === "error") {
    setErrorMessage(getSolvesBySessionIdResult.message);
  } else {
    solveData = getSolvesBySessionIdResult.solveData;
    while (solveData.length % numColumns) solveData.push(null);
  }

  const handleSolvePress = (solve: SolveData) => {
    setSelectedSolve(solve);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSolve(null);
  };

  const renderSolveItem = ({ item: solve }: { item: SolveData | null }) => {
    if (solve === null) {
      return <View style={styles.pressableContainer} />;
    }

    return (
      <Pressable
        style={[styles.pressableContainer, { backgroundColor: colors.card }]}
        onPress={() => handleSolvePress(solve)}
      >
        <TextCustomFont style={[styles.solveTime, { color: colors.text }]}>
          {solve.solveTime === DNF_VALUE
            ? "DNF"
            : convertCubingTime(
                calculatePenaltySolveTime(solve),
                ".",
                false,
                true,
              )}
        </TextCustomFont>
        {solve.date && (
          <TextCustomFont style={[styles.date, { color: colors.text }]}>
            {new Date(solve.date).toLocaleDateString()}
          </TextCustomFont>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <TextCustomFont style={[styles.emptyText, { color: colors.text }]}>
        No solves yet. Start timing to see your history!
      </TextCustomFont>
    </View>
  );

  return (
    <View style={[styles.container]}>
      {errorMessage ? (
        <ErrorDisplay errorMessage={errorMessage} />
      ) : (
        <FlatList
          data={solveData}
          renderItem={renderSolveItem}
          numColumns={numColumns}
          contentContainerStyle={[
            styles.listContainer,
            solveData.length === 0 && styles.emptyListContainer,
          ]}
          columnWrapperStyle={solveData.length > 0 ? styles.row : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}

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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
  },
});
