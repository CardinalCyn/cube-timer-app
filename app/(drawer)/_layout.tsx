import { allScreens } from "@/constants/constants";
import { useSettings } from "@/hooks/useSettings";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  const { colors } = useSettings();
  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
          }}
        >
          {allScreens.map((screenData) => {
            return (
              <Drawer.Screen
                key={screenData.name}
                name={screenData.name}
                options={screenData.options}
              />
            );
          })}
        </Drawer>
      </GestureHandlerRootView>
    </View>
  );
}
