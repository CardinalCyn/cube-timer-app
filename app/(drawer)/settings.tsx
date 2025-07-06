import { TextCustomFont } from "@/components/TextCustomFont";
import { StyleSheet, View } from "react-native";
export default function PracticePage() {
  return (
    <View style={styles.container}>
      <TextCustomFont>Settings</TextCustomFont>
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
