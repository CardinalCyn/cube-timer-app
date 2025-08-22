import { TextCustomFont } from "@/components/TextCustomFont";
import { DNF_VALUE } from "@/constants/constants";
import {
  calculatePenaltySolveTime,
  convertCubingTime,
} from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { SolveData } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type SolveDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  solve: SolveData | null;
  handleDeletion: (solveId: number) => void;
  openPenaltyStateModal: () => void;
};

export default function SolveDetailModal({
  visible,
  onClose,
  solve,
  handleDeletion,
  openPenaltyStateModal,
}: SolveDetailModalProps) {
  const { colors } = useSettings();

  if (!solve) return null;

  const formatDate = (date: Date) => {
    return date
      .toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const formattedDate = formatDate(solve.date);
  const timeDisplay =
    solve.solveTime === DNF_VALUE || solve.penaltyState === "DNF"
      ? "DNF"
      : convertCubingTime(
          calculatePenaltySolveTime(solve.solveTime, solve.penaltyState),
          ".",
          false,
          true,
        );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Top Row: Time & Status */}
          <View style={styles.topRow}>
            <View style={styles.topRowItem}>
              <MaterialIcons name="timer" size={20} color={colors.text} />
              <TextCustomFont
                style={[styles.topRowText, { color: colors.text }]}
              >
                {timeDisplay}
              </TextCustomFont>
              <TextCustomFont style={[{ color: "red" }]}>
                {solve.penaltyState === "+2" && solve.penaltyState}
              </TextCustomFont>
            </View>
            <View style={styles.topRowItem}>
              <TextCustomFont style={[{ color: colors.text }]}>
                {formattedDate}
              </TextCustomFont>
            </View>
          </View>

          {/* Scramble */}
          {solve.scramble && (
            <View style={styles.scrambleContainer}>
              <MaterialIcons name="cached" size={20} color={colors.text} />
              <TextCustomFont
                style={[styles.scrambleText, { color: colors.text }]}
              >
                {solve.scramble}
              </TextCustomFont>
            </View>
          )}

          {/* Final Row (Actions) */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => {
                handleDeletion(solve.id);
              }}
            >
              <MaterialIcons name="delete" size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={() => {
                openPenaltyStateModal();
              }}
            >
              <MaterialIcons name="flag" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topRowText: {
    fontSize: 18,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 16,
  },
  scrambleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  scrambleText: {
    fontSize: 14,
    flexShrink: 1,
  },
  buttonContainer: {
    gap: 12,
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
