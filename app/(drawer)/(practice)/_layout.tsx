// app/(drawer)/timer/_layout.tsx
import { allTabs } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { Tabs } from "expo-router";

export default function PracticeLayout() {
  const { colors } = useSettings();
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
