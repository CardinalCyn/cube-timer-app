// app/(drawer)/timer/_layout.tsx
import { allTabs } from "@/constants/constants";
import { useTheme } from "@/hooks/useTheme";
import { Tabs } from "expo-router";

export default function PracticeLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {allTabs.map((tabData) => {
        return (
          <Tabs.Screen
            key={tabData.name}
            name={tabData.name}
            options={tabData.options}
          />
        );
      })}
    </Tabs>
  );
}
