import "../global.css";

import ErrorBoundary from "@/components/ErrorBoundary";
import SystemBarWrapper from "@/components/SystemBarWrapper";
import { CubingProvider } from "@/providers/CubingContext";
import { SettingsProvider } from "@/providers/SettingsContext";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SettingsProvider>
          <CubingProvider>
            <SystemBarWrapper />
            <PortalHost />
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
    </ErrorBoundary>
  );
}
