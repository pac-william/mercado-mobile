import { DependencyList, useMemo } from "react";
import { StyleSheet } from "react-native";
import type { CustomMD3Theme } from "../types/theme";
import { useCustomTheme } from "./useCustomTheme";

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: CustomMD3Theme) => T,
  deps: DependencyList = []
) {
  const theme = useCustomTheme();
  const styles = useMemo(() => StyleSheet.create(factory(theme)), [theme, ...deps]);
  return { styles, theme };
}
