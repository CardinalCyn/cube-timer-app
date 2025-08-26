import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Platform, Pressable } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SafeSwitchProps {
  checked: boolean;
  onCheckedChange: () => void;
  className?: string;
  disabled?: boolean;
}

export function SafeSwitch({
  checked,
  onCheckedChange,
  className,
  disabled,
}: SafeSwitchProps) {
  // shared value that animates whenever `checked` changes
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, progress]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, 14]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Pressable
      onPress={onCheckedChange}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        className={cn(
          "flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5 bg-primary",
          Platform.select({
            web: "focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed",
          }),
          className,
        )}
      >
        <Animated.View
          className="size-4 rounded-full bg-background"
          style={thumbAnimatedStyle}
        />
      </Animated.View>
    </Pressable>
  );
}
