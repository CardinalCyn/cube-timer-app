import { useSettings } from "@/hooks/useSettings";
import { Text as RNText, TextProps } from "react-native";

export function TextCustomFont(props: TextProps) {
  const { colors } = useSettings();

  return (
    <RNText
      {...props}
      style={[{ fontFamily: "monospace", color: colors.text }, props.style]}
    />
  );
}
