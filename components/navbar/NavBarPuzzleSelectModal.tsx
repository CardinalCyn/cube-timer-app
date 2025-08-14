import { WCAScrData } from "@/constants/constants";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { WCAScrambleCategory } from "@/types/types";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";

type NavBarPuzzleSelectModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function NavBarPuzzleSelectModal({
  visible,
  onClose,
}: NavBarPuzzleSelectModalProps) {
  const { colors } = useSettings();
  const {
    setCurrentTimerPuzzleCategory,
    currentTimerPuzzleCategory,
    cubingContextClass,
  } = useCubing();

  function handleSelection(WCAScrPoint: WCAScrambleCategory) {
    setCurrentTimerPuzzleCategory(WCAScrPoint);
    cubingContextClass.changeCurrentTimerPuzzleType(WCAScrPoint.scrambleCode);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={() => onClose()}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Modal Header */}
          <View style={styles.header}>
            <TextCustomFont style={[styles.headerText, { color: colors.text }]}>
              Select Puzzle
            </TextCustomFont>
          </View>

          {/* Puzzle List */}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.puzzleList}>
              {WCAScrData.map((WCAScrPoint, index) => {
                const isSelected =
                  currentTimerPuzzleCategory.scrambleCode ===
                  WCAScrPoint.scrambleCode;
                const isLast = index === WCAScrData.length - 1;

                return (
                  <Pressable
                    key={WCAScrPoint.scrambleCode}
                    style={[
                      styles.puzzleItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "15" // Add transparency to primary color
                          : "transparent",
                        borderBottomColor: colors.border,
                        borderBottomWidth: isLast
                          ? 0
                          : StyleSheet.hairlineWidth,
                      },
                    ]}
                    onPress={() => handleSelection(WCAScrPoint)}
                    android_ripple={{
                      color: colors.primary + "20",
                      borderless: false,
                    }}
                  >
                    <TextCustomFont
                      style={[
                        styles.puzzleText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? "600" : "400",
                        },
                      ]}
                    >
                      {WCAScrPoint.title}
                    </TextCustomFont>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "80%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContainer: {
    maxHeight: 400,
  },
  puzzleList: {
    paddingBottom: 8,
  },
  puzzleItem: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 60,
    justifyContent: "center",
  },
  puzzleText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  scrambleCode: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
});
