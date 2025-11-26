import { AntDesign } from '@expo/vector-icons';
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

interface FilterButtonProps {
  title: string;
  onPress: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterButton({ title, onPress, hasActiveFilters = false }: FilterButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceLight,
          borderColor: colors.outlineLight,
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <AntDesign name="filter" size={ICON_SIZES.lg} color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>
          {title}
        </Text>
        {hasActiveFilters && (
          <View style={[styles.badge, { backgroundColor: colors.error }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.smPlus,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  badge: {
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginLeft: SPACING.sm,
  },
});