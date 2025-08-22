import SystemBarWrapper from "@/components/SystemBarWrapper";
import { CubingProvider } from "@/providers/CubingContext";
import { SettingsProvider } from "@/providers/SettingsContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CubingProvider>
          <SystemBarWrapper />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </CubingProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
