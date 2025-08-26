import { View } from "react-native";
import { Text } from "../ui/text";

type ScrambleDisplayProps = {
  scramble: string;
};
export default function ScrambleDisplay({ scramble }: ScrambleDisplayProps) {
  return (
    <View>
      <Text>{scramble}</Text>
    </View>
  );
}
