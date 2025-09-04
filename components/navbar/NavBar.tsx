import { subset3x3Data, WCAScrData } from "@/constants/constants";
import { useCubing } from "@/hooks/useCubing";
import { useSettings } from "@/hooks/useSettings";
import {
  NavbarType,
  Subset3x3ScrambleCategory,
  ValidPuzzleCode,
  WCAScrambleCategory,
} from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function NavBar({ navbarType }: { navbarType: NavbarType }) {
  const { colors } = useSettings();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { cubingContextClass } = useCubing();
  const currentPuzzleTypes = cubingContextClass.getCurrentPuzzleTypes();
  const currentPuzzleCategory =
    navbarType === "timer"
      ? currentPuzzleTypes.currentTimerPuzzleType
      : currentPuzzleTypes.currentPracticePuzzleType;

  const puzzleTitle =
    [...WCAScrData, ...subset3x3Data].find(
      (ele) => ele.scrambleCode === currentPuzzleCategory,
    )?.title || "3x3x3";

  function selectOnPress(puzzleCode: ValidPuzzleCode) {
    navbarType === "timer"
      ? cubingContextClass.changeCurrentTimerPuzzleType(
          puzzleCode as WCAScrambleCategory["scrambleCode"],
        )
      : cubingContextClass.changeCurrentPracticePuzzleType(
          puzzleCode as Subset3x3ScrambleCategory["scrambleCode"],
        );
  }

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <View className="flex-row items-center justify-between px-16 py-12 elevation-md">
      <View className="flex-1 items-start">
        <Pressable onPress={() => navigation.toggleDrawer()}>
          <MaterialIcons name="menu" size={24} color={colors.colors.text} />
        </Pressable>
      </View>
      <Select
        defaultValue={{ label: puzzleTitle, value: currentPuzzleCategory }}
      >
        <SelectTrigger>
          <SelectValue placeholder={puzzleTitle} />
        </SelectTrigger>
        <SelectContent insets={contentInsets}>
          <SelectGroup>
            {(navbarType === "timer" ? WCAScrData : subset3x3Data).map(
              (scrPoint) => (
                <SelectItem
                  key={scrPoint.scrambleCode}
                  label={scrPoint.title}
                  value={scrPoint.scrambleCode}
                  onPress={() => selectOnPress(scrPoint.scrambleCode)}
                >
                  {scrPoint.title}
                </SelectItem>
              ),
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
