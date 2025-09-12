import NavBar from "@/components/navbar/NavBar";
import { allTabs } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function PracticeLayout() {
  const { colors } = useSettings();
  return (
    <View style={{ flex: 1, backgroundColor: colors.colors.background }}>
      <NavBar navbarType="timer" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.colors.background },
          tabBarStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
            borderTopWidth: 0,
            borderTopColor: "transparent",
          },
          tabBarActiveTintColor: "#007AFF", // Active tab color
          tabBarInactiveTintColor: "#8E8E93", // Inactive tab color
          tabBarShowLabel: true, // Show/hide labels
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
          tabBarIconStyle: {
            marginBottom: -3, // Adjust icon position
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
    </View>
  );
}
