import { View } from "react-native";
import { TextCustomFont } from "./TextCustomFont";

type ErrorDisplayProps = {
  errorMessage: string;
};

export default function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  return (
    <View>
      <TextCustomFont>{errorMessage}</TextCustomFont>
    </View>
  );
}
