import { TextCustomFont } from "@/components/TextCustomFont";
import { useSettings } from "@/hooks/useSettings";
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
export default function PracticePage() {
  const { toggleTheme, colors } = useSettings();
  return (
    <View style={[styles.container]}>
      <TextCustomFont>Settings</TextCustomFont>
      <View style={{ flexDirection: "row" }}>
        <Pressable onPress={toggleTheme}>
          <TextCustomFont>Toggle darkmode</TextCustomFont>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
