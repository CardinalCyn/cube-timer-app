import { allScreens } from "@/constants/constants";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
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
  );
}
