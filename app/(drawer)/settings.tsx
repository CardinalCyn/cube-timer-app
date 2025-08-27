import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SafeSwitch } from "@/components/ui/safeswitch";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useSettings } from "@/hooks/useSettings";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const {
    toggleTheme,
    theme,
    inspectionEnabled,
    toggleInspectionEnabled,
    inspectionTime,
    setValidInspectionTime,
    trimPercentage,
    setValidTrimPercentage,
    displayStats,
    toggleDisplayStats,
    displayTimeDuringSolve,
    toggleDisplayTimeDuringSolve,
    colors,
  } = useSettings();

  type Row = {
    title: string;
    disabled: boolean;
  } & (
    | { toggleType: "switch"; val: boolean; func: () => void }
    | { toggleType: "slider"; val: number; func: (value: number) => void }
  );

  const settings: {
    subsectionTitle: string;
    rows: Row[];
  }[] = [
    {
      subsectionTitle: "App appearance",
      rows: [
        {
          title: "Dark mode",
          toggleType: "switch",
          val: theme === "dark",
          func: toggleTheme,
          disabled: false,
        },
      ],
    },
    {
      subsectionTitle: "Inspection behavior",
      rows: [
        {
          title: "Inspection",
          toggleType: "switch",
          val: inspectionEnabled,
          func: toggleInspectionEnabled,
          disabled: false,
        },
        {
          title: "Inspection time",
          toggleType: "slider",
          val: inspectionTime,
          func: (inspectionTime: number) =>
            setValidInspectionTime(inspectionTime),
          disabled: !inspectionEnabled,
        },
      ],
    },
    {
      subsectionTitle: "Timer behavior",
      rows: [
        {
          title: "Display time during solve",
          toggleType: "switch",
          val: displayTimeDuringSolve,
          func: toggleDisplayTimeDuringSolve,
          disabled: false,
        },
      ],
    },
    {
      subsectionTitle: "Statistics",
      rows: [
        {
          title: "Trim percentage",
          toggleType: "slider",
          val: trimPercentage,
          func: (trimPercentage: number) =>
            setValidTrimPercentage(trimPercentage),
          disabled: false,
        },
        {
          title: "Display stats",
          toggleType: "switch",
          val: displayStats,
          func: toggleDisplayStats,
          disabled: false,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border/10">
        <Text className="text-2xl font-semibold text-foreground text-center">
          Settings
        </Text>
      </View>

      <View className="flex-1 px-6 py-4">
        {settings.map((settingSection) => (
          <View key={settingSection.subsectionTitle} className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {settingSection.subsectionTitle}
            </Text>

            <View className="bg-card rounded-lg border border-border">
              {settingSection.rows.map((row, rowIndex) => (
                <View key={row.title}>
                  <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="flex-1">
                      <Label className="text-base font-medium text-card-foreground">
                        {row.title}
                      </Label>
                    </View>
                    <View className="ml-4">
                      {row.toggleType === "switch" ? (
                        <SafeSwitch
                          checked={row.val}
                          onCheckedChange={row.func}
                          disabled={row.disabled}
                        />
                      ) : (
                        <Input
                          keyboardType="numeric"
                          value={row.val.toString()}
                          onChangeText={(text) => row.func(Number(text))}
                        />
                      )}
                    </View>
                  </View>

                  {rowIndex < settingSection.rows.length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
