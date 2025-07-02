import { StyleSheet, Text, View } from "react-native";

export default function PracticePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Page</Text>
      <Text style={styles.subtitle}>Lets practice something!</Text>
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
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
