import { penaltyStates, penaltyStateTitleMap } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { PenaltyState } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../ui/text";

type SelectPenaltyStateModalProps = {
  solveId: number;
  handleSelectPenaltyState: (
    solveId: number,
    penaltyState: PenaltyState,
  ) => void;
  onClose: () => void;
};

export default function SelectPenaltyStateModal({
  solveId,
  handleSelectPenaltyState,
  onClose,
}: SelectPenaltyStateModalProps) {
  const { colors } = useSettings();

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.colors.card },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.colors.text }]}>
              Select Penalty
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={24}
                color={colors.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.optionsContainer}>
            {penaltyStates.map((penaltyState) => (
              <Pressable
                key={penaltyState}
                style={[
                  styles.optionButton,
                  { borderColor: colors.colors.text + "20" },
                ]}
                onPress={() => handleSelectPenaltyState(solveId, penaltyState)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.penaltyDescription,
                        { color: colors.colors.text },
                      ]}
                    >
                      {penaltyStateTitleMap[penaltyState]}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionText: {
    flex: 1,
  },
  penaltyState: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  penaltyDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
