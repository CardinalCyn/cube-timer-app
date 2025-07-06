import { formatTime } from "@/constants/utils";
import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, Text, View } from "react-native";
type TimerProps = {
  elapsedTime: number;
};

export default function Timer({ elapsedTime }: TimerProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text }]}>
        {formatTime(elapsedTime)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  text: { fontSize: 40 },
});
