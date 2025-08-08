import { convertCubingTime } from "@/constants/utils";
import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View } from "react-native";
import { TextCustomFont } from "./TextCustomFont";
type TimerProps = {
  elapsedTime: number;
};

export default function Timer({ elapsedTime }: TimerProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <TextCustomFont style={[styles.text, { color: colors.text }]}>
        {convertCubingTime(elapsedTime, ".", true, true)}
      </TextCustomFont>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  text: { fontSize: 40 },
});
