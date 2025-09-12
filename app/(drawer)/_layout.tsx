import { allScreens } from "@/constants/constants";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";

export default function DrawerLayout() {
  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}
