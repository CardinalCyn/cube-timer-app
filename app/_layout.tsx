import { CubingProvider } from "@/providers/CubingContext";
import { SettingsProvider } from "@/providers/SettingsContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <CubingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </CubingProvider>
    </SettingsProvider>
  );
}
