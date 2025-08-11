import { View } from "react-native";
import { TextCustomFont } from "./TextCustomFont";

type NavBarProps = {
  pathname: string;
};

export default function NavBar({ pathname }: NavBarProps) {
  return (
    <View>
      <TextCustomFont>{pathname}</TextCustomFont>
    </View>
  );
}
