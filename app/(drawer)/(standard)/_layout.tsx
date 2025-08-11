// app/(drawer)/timer/_layout.tsx
import NavBar from "@/components/NavBar";
import { allTabs } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { Tabs, usePathname } from "expo-router";

export default function StandardLayout() {
  const { colors } = useSettings();
  const pathname = usePathname();

  return (
    <>
      <NavBar pathname={pathname} />
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
    </>
  );
}
