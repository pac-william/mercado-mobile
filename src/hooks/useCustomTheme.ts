import { useTheme as usePaperTheme } from "react-native-paper";
import type { CustomMD3Theme } from "../types/theme";

export function useCustomTheme(): CustomMD3Theme {
  return usePaperTheme<CustomMD3Theme>();
}

