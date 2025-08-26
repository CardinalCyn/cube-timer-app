import { allScreens } from "@/constants/constants";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerShown: false,
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
