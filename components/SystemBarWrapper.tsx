import { useSettings } from "@/hooks/useSettings";
import { SystemBars } from "react-native-edge-to-edge";

export default function SystemBarWrapper() {
  const { theme } = useSettings();

  return (
    <SystemBars style={theme === "dark" ? "light" : "dark"} hidden={false} />
  );
}
