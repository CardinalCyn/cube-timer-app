import { DNF_VALUE } from "@/constants/constants";
import {
  calculatePenaltySolveTime,
  convertCubingTime,
} from "@/constants/utils";
import { useSettings } from "@/hooks/useSettings";
import { SolveData } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Text } from "../ui/text";

type SolveDetailDialogProps = {
  solve: SolveData;
  handleDeletion: (solveId: number) => void;
  openPenaltyStateModal: () => void;
};
export default function SolveDetailDialog({
  solve,
  handleDeletion,
  openPenaltyStateModal,
}: SolveDetailDialogProps) {
  const { colors } = useSettings();
  const formattedSolveTime =
    solve.solveTime === DNF_VALUE || solve.penaltyState === "DNF"
      ? "DNF"
      : convertCubingTime(
          calculatePenaltySolveTime(solve.solveTime, solve.penaltyState),
          ".",
          false,
          true,
        );
  return (
    <Dialog key={solve.id}>
      <DialogTrigger asChild className="bg-primary-foreground">
        <Button className="relative h-14 p-3">
          <Text className="absolute top-2 left-3 text-xs text-foreground">
            {new Date(solve.date).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
            })}
          </Text>
          <View className="flex-1 justify-center items-center">
            <Text className="text-foreground text-lg font-medium">
              {formattedSolveTime}
            </Text>
          </View>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex-row justify-between mt-5">
          <DialogTitle>{formattedSolveTime}</DialogTitle>
          <Text>{new Date(solve.date).toLocaleDateString()}</Text>
        </DialogHeader>
        <View>
          <Text>{solve.scramble}</Text>
        </View>
        <DialogFooter className="flex-row">
          <Pressable
            onPress={() => {
              handleDeletion(solve.id);
            }}
          >
            <MaterialIcons name="delete" size={20} color={colors.colors.text} />
          </Pressable>
          <Pressable
            onPress={() => {
              openPenaltyStateModal();
            }}
          >
            <MaterialIcons name="flag" size={20} color={colors.colors.text} />
          </Pressable>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
