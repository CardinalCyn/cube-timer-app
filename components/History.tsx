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
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import ErrorDisplay from "./ErrorDisplay";

export default function History() {
  const { colors } = useSettings();
  const [selectedSolve, setSelectedSolve] = useState<SolveData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [solveData, setSolveData] = useState<(SolveData | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const numColumns = 3;

  const { cubingContextClass } = useCubing();

  useFocusEffect(
    useCallback(() => {
      async function setCubingData() {
        const cubingCurrentSessionData =
          await cubingContextClass.getSolvesBySessionId(false, 0);
        if (cubingCurrentSessionData.status === "error") {
          setErrorMessage(cubingCurrentSessionData.message);
          return;
        }
        setErrorMessage("");
        const data: (SolveData | null)[] = cubingCurrentSessionData.solveData;
        while (data.length % numColumns) {
          data.push(null);
        }
        setSolveData(data);
      }
      setCubingData();
    }, [cubingContextClass]),
  );

  const handleSolvePress = (solve: SolveData) => {
    setSelectedSolve(solve);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSolve(null);
  };

  const renderSolveItem = ({ item: solve }: { item: SolveData | null }) => {
    if (solve === null) return <View style={styles.pressableContainer} />;
    return (
      <Pressable
        style={[styles.pressableContainer, { backgroundColor: colors.card }]}
        onPress={() => handleSolvePress(solve)}
      >
        <TextCustomFont style={[styles.solveTime]}>
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
          <TextCustomFont style={[styles.date]}>
            {new Date(solve.date).toLocaleDateString()}
          </TextCustomFont>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container]}>
      {errorMessage && <ErrorDisplay errorMessage={errorMessage} />}
      <FlatList
        data={solveData}
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
