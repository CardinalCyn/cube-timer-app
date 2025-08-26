import { View } from "react-native";
import { Text } from "./ui/text";
type ErrorDisplayProps = {
  errorMessage: string;
};

export default function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  return (
    <View>
      <Text>{errorMessage}</Text>
    </View>
  );
}
