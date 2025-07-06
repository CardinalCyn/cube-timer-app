import { useTheme } from "@/hooks/useTheme";
import { Text as RNText, TextProps } from "react-native";

export function TextCustomFont(props: TextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      {...props}
      style={[{ fontFamily: "monospace", color: colors.text }, props.style]}
    />
  );
}
