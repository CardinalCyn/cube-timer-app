import { TextCustomFont } from "@/components/TextCustomFont";
import {
  calculatePenaltySolveTime,
  convertCubingTime,
} from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { SolveData } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface SolveDetailModalProps {
  visible: boolean;
  onClose: () => void;
  solveData: SolveData | null;
}

export default function SolveDetailModal({
  visible,
  onClose,
  solveData,
}: SolveDetailModalProps) {
  const { colors } = useSettings();

  if (!solveData) return null;

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

  const formattedDate = formatDate(solveData.date);
  const timeDisplay =
    solveData.penaltyState === "DNF"
      ? "DNF"
      : convertCubingTime(
          calculatePenaltySolveTime(solveData),
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
                {solveData.penaltyState === "+2" && solveData.penaltyState}
              </TextCustomFont>
            </View>
            <View style={styles.topRowItem}>
              <TextCustomFont style={[{ color: colors.text }]}>
                {formattedDate}
              </TextCustomFont>
            </View>
          </View>

          {/* Scramble */}
          {solveData.scramble && (
            <View style={styles.scrambleContainer}>
              <MaterialIcons name="cached" size={20} color={colors.text} />
              <TextCustomFont
                style={[styles.scrambleText, { color: colors.text }]}
              >
                {solveData.scramble}
              </TextCustomFont>
            </View>
          )}

          {/* Final Row (Actions) */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => {
                onClose();
              }}
            >
              <MaterialIcons name="delete" size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={() => {
                onClose();
              }}
            >
              <MaterialIcons name="flag" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => {
                onClose();
              }}
            >
              <MaterialIcons name="book" size={20} color="white" />
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
