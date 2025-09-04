import { useSettings } from "@/hooks/useSettings";
import { SortDirection, SortField, ValidPuzzleCode } from "@/types/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";

interface HistoryToolBarProps {
  currentPuzzleCategory: ValidPuzzleCode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onDeleteSolves: () => void;
  // Optional additional props
  totalSolves?: number;
  selectedSolves?: number[];
  onSelectionModeToggle?: () => void;
  isSelectionMode?: boolean;
}

export default function HistoryToolBar({
  sortField,
  sortDirection,
  onSortChange,
  onDeleteSolves,
  totalSolves = 0,
  selectedSolves = [],
  onSelectionModeToggle,
  isSelectionMode = false,
}: HistoryToolBarProps) {
  const { colors } = useSettings();

  const handleSortPress = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      onSortChange(field, newDirection);
    } else {
      // New field, default to ascending
      onSortChange(field, "asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return "unfold-more"; // Default sort icon
    }
    return sortDirection === "asc"
      ? "keyboard-arrow-up"
      : "keyboard-arrow-down";
  };

  const getSortIconColor = (field: SortField) => {
    return sortField === field ? colors.colors.primary : colors.colors.text;
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200">
      {/* Left side - Sort controls */}
      <View className="flex-row items-center space-x-4">
        {/* Date Sort */}
        <Pressable
          onPress={() => handleSortPress("date")}
          className="flex-row items-center space-x-1 px-2 py-1 rounded"
        >
          <Text className="text-sm font-medium">Date</Text>
          <MaterialIcons
            name={getSortIcon("date")}
            size={18}
            color={getSortIconColor("date")}
          />
        </Pressable>
        {/* Time Sort */}
        <Pressable
          onPress={() => handleSortPress("time")}
          className="flex-row items-center space-x-1 px-2 py-1 rounded"
        >
          <Text className="text-sm font-medium">Time</Text>
          <MaterialIcons
            name={getSortIcon("time")}
            size={18}
            color={getSortIconColor("time")}
          />
        </Pressable>
      </View>

      {/* Center - Info display */}
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-600">
          {totalSolves} solve{totalSolves !== 1 ? "s" : ""}
          {isSelectionMode && selectedSolves.length > 0 && (
            <Text>, {selectedSolves.length} selected</Text>
          )}
        </Text>
      </View>

      {/* Right side - Action buttons */}
      <View className="flex-row items-center space-x-3">
        {/* Selection Mode Toggle */}
        {onSelectionModeToggle && (
          <Pressable
            onPress={onSelectionModeToggle}
            className="p-1 rounded"
            style={{
              backgroundColor: isSelectionMode
                ? colors.colors.primary + "20"
                : "transparent",
            }}
          >
            <MaterialIcons
              name={isSelectionMode ? "check-circle" : "radio-button-unchecked"}
              size={20}
              color={
                isSelectionMode ? colors.colors.primary : colors.colors.text
              }
            />
          </Pressable>
        )}

        {/* Export/Share */}
        <Pressable className="p-1">
          <MaterialIcons name="share" size={20} color={colors.colors.text} />
        </Pressable>

        {/* Filter */}
        <Pressable className="p-1">
          <MaterialIcons
            name="filter-list"
            size={20}
            color={colors.colors.text}
          />
        </Pressable>

        {/* Delete All */}
        <Pressable onPress={onDeleteSolves} className="p-1">
          <MaterialIcons name="delete" size={20} color={colors.colors.text} />
        </Pressable>

        {/* More options */}
        <Pressable className="p-1">
          <MaterialIcons
            name="more-vert"
            size={20}
            color={colors.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}
