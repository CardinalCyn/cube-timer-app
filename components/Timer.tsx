import { convertCubingTime } from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { StyleSheet, View } from "react-native";
import { TextCustomFont } from "./TextCustomFont";
type TimerProps = {
  elapsedTime: number;
};

export default function Timer({ elapsedTime }: TimerProps) {
  const { colors } = useSettings();
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
