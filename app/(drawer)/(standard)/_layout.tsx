// app/(drawer)/timer/_layout.tsx
import NavBar from "@/components/NavBar";
import { allTabs } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StandardLayout() {
  const { colors } = useSettings();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavBar pathname="asdfadfa" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            height: 50,
          },
          sceneStyle: { backgroundColor: colors.background },
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
    </SafeAreaView>
  );
}
