import { useCubing } from "@/hooks/useCubing";
import {
  NavbarType,
  PenaltyState,
  SolveData,
  SortDirection,
  SortField,
} from "@/types/types";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import HistoryToolBar from "./HistoryToolBar";
import SelectPenaltyStateModal from "./SelectPenaltyStateModal";
import SolveDetailDialog from "./SolveDetailDialog";

type HistoryProps = { navbarType: NavbarType };
export default function History({ navbarType }: HistoryProps) {
  const numColumns = 3;
  const [selectedSolve, setSelectedSolve] = useState<SolveData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [solveData, setSolveData] = useState<SolveData[]>([]); // Store in state
  const [
    isSelectPenaltyStateModalVisible,
    setIsSelectPenaltyStateModalVisible,
  ] = useState(false);

  const { cubingContextClass } = useCubing();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function onSortChange(
    newSortField: SortField,
    newSortDirection: SortDirection,
  ) {
    setSortField(newSortField);
    setSortDirection(newSortDirection);
  }

  const currentPuzzleTypes = cubingContextClass.getCurrentPuzzleTypes();
  const currentPuzzleCategory =
    navbarType === "timer"
      ? currentPuzzleTypes.currentTimerPuzzleType
      : currentPuzzleTypes.currentPracticePuzzleType;

  useFocusEffect(
    useCallback(() => {
      refreshSolveData();
    }, [navbarType, cubingContextClass]),
  );

  function handleCloseModal() {
    setSelectedSolve(null);
    setIsSelectPenaltyStateModalVisible(false);
  }

  async function handleDeletion(solveId: number) {
    const removeSolveData = await cubingContextClass.removeSolve(
      solveId,
      currentPuzzleCategory,
    );
    if (removeSolveData.status === "error")
      setErrorMessage(removeSolveData.message);
    else setErrorMessage("");
    handleCloseModal();
    refreshSolveData(); // Refresh after deletion
  }

  function refreshSolveData() {
    try {
      const getSolvesBySessionIdResult =
        cubingContextClass.getSolvesBySessionId(
          false,
          0,
          currentPuzzleCategory,
        );
      if (getSolvesBySessionIdResult.status === "error") {
        setErrorMessage(getSolvesBySessionIdResult.message);
        setSolveData([]);
      } else {
        setSolveData(getSolvesBySessionIdResult.solveData); // Update state
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "There was an issue with retrieving the solve data",
      );
    }
  }

  function openPenaltyStateModal(solve: SolveData) {
    setSelectedSolve(solve);
    setIsSelectPenaltyStateModalVisible(true);
  }

  async function handleSelectPenaltyState(
    solveId: number,
    penaltyState: PenaltyState,
  ) {
    const changePenaltyStateData = await cubingContextClass.changePenaltyState(
      solveId,
      penaltyState,
    );
    if (changePenaltyStateData.status === "error")
      setErrorMessage(changePenaltyStateData.message);
    else setErrorMessage("");
    setIsSelectPenaltyStateModalVisible(false);
    refreshSolveData(); // Refresh after penalty change
  }

  const renderSolveItem = ({ item }: { item: SolveData }) => (
    <View className={`flex-${numColumns} mx-1 mb-2`}>
      <SolveDetailDialog
        solve={item}
        handleDeletion={handleDeletion}
        openPenaltyStateModal={() => openPenaltyStateModal(item)}
      />
    </View>
  );

  const sortedSolveData = useMemo(() => {
    return [...solveData].sort((a, b) => {
      let comparison = 0;

      if (sortField === "time") {
        // Handle DNF values specially
        if (a.penaltyState === "DNF" && b.penaltyState === "DNF") {
          // Both DNF - sort by date as secondary criteria
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (a.penaltyState === "DNF") {
          comparison = 1; // DNF goes to end
        } else if (b.penaltyState === "DNF") {
          comparison = -1; // DNF goes to end
        } else {
          // Both are valid times
          comparison = a.solveTime - b.solveTime;
        }
      } else if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      // Apply sort direction (but DNFs always go to end for time sorting)
      if (
        sortField === "time" &&
        (a.penaltyState === "DNF" || b.penaltyState === "DNF")
      ) {
        return comparison; // Don't reverse DNF ordering
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [solveData, sortField, sortDirection]);

  function onDeleteSolves() {
    cubingContextClass.removeSolves(0, currentPuzzleCategory);
    setSolveData([]);
  }

  return (
    <View className="flex-1">
      <HistoryToolBar
        currentPuzzleCategory={currentPuzzleCategory}
        onSortChange={onSortChange}
        sortDirection={sortDirection}
        sortField={sortField}
        onDeleteSolves={onDeleteSolves}
        totalSolves={solveData.length}
      />
      <ErrorDisplay errorMessage={errorMessage} />
      <FlashList
        data={sortedSolveData}
        renderItem={renderSolveItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}
      />

      {isSelectPenaltyStateModalVisible && selectedSolve && (
        <SelectPenaltyStateModal
          solveId={selectedSolve.id}
          handleSelectPenaltyState={handleSelectPenaltyState}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}
