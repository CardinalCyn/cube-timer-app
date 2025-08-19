import { View } from "react-native";
import { TextCustomFont } from "../TextCustomFont";

type ScrambleDisplayProps = {
  scramble: string;
};
export default function ScrambleDisplay({ scramble }: ScrambleDisplayProps) {
  return (
    <View>
      <TextCustomFont>{scramble}</TextCustomFont>
    </View>
  );
}
