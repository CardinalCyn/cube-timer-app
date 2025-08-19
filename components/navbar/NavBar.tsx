import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import { NavbarType } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";
import NavBarPuzzleSelectModal from "./NavBarPuzzleSelectModal";

export default function NavBar({ navbarType }: { navbarType: NavbarType }) {
  const { colors } = useSettings();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { currentTimerPuzzleCategory, currentPracticePuzzleCategory } =
    useCubing();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.leftSection}>
        <Pressable
          style={[styles.drawerButton]}
          onPress={() => navigation.toggleDrawer()}
        >
          <MaterialIcons name="menu" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Pressable
        style={styles.centerSection}
        onPress={() => setModalVisible(true)}
      >
        <TextCustomFont style={[styles.title, { color: colors.text }]}>
          {navbarType === "timer"
            ? currentTimerPuzzleCategory.title
            : currentPracticePuzzleCategory.title}
        </TextCustomFont>
        <MaterialIcons name="arrow-drop-down" size={24} color={colors.text} />
      </Pressable>
      <NavBarPuzzleSelectModal
        visible={modalVisible}
        onClose={handleCloseModal}
        navbarType={navbarType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    flexDirection: "row",
  },
  drawerButton: {
    padding: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
