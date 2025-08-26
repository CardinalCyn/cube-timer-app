import { useCubing } from "@/hooks/useCubing";
import { NavbarType, PenaltyState, SolveData } from "@/types/types";
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import SelectPenaltyStateModal from "./SelectPenaltyStateModal";
import SolveDetailDialog from "./SolveDetailDialog";

type HistoryProps = { navbarType: NavbarType };
export default function History({ navbarType }: HistoryProps) {
  const numColumns = 3;
  const [selectedSolve, setSelectedSolve] = useState<SolveData | null>(null);
  const [solveDetailModalVisible, setSolveDetailModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [solveData, setSolveData] = useState<SolveData[]>([]); // Store in state
  const [
    isSelectPenaltyStateModalVisible,
    setIsSelectPenaltyStateModalVisible,
  ] = useState(false);

  const { cubingContextClass } = useCubing();

  // Use useEffect to load data on mount and when navbarType changes
  useEffect(() => {
    refreshSolveData();
  }, [navbarType, cubingContextClass]);

  function handleCloseModal() {
    setSolveDetailModalVisible(false);
    setSelectedSolve(null);
    setIsSelectPenaltyStateModalVisible(false);
  }

  async function handleDeletion(solveId: number) {
    const removeSolveData = await cubingContextClass.removeSolve(
      solveId,
      navbarType,
    );
    if (removeSolveData.status === "error")
      setErrorMessage(removeSolveData.message);
    else setErrorMessage("");
    handleCloseModal();
    refreshSolveData(); // Refresh after deletion
  }

  function refreshSolveData() {
    const getSolvesBySessionIdResult = cubingContextClass.getSolvesBySessionId(
      false,
      0,
      navbarType,
    );
    if (getSolvesBySessionIdResult.status === "error") {
      setErrorMessage(getSolvesBySessionIdResult.message);
      setSolveData([]); // Clear data on error
    } else {
      setSolveData(getSolvesBySessionIdResult.solveData); // Update state
    }
  }

  function openPenaltyStateModal(solve: SolveData) {
    setSelectedSolve(solve); // Set the selected solve
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
    setSolveDetailModalVisible(false);
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

  return (
    <View className="flex-1">
      <ErrorDisplay errorMessage={errorMessage} />

      <FlashList
        data={solveData}
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
