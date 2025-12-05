import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../layout/header";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SPACING, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  subtitle?: string;
  iconSize?: number;
  showHeader?: boolean;
}

export default function EmptyState({
  icon,
  title,
  message,
  subtitle,
  iconSize = SPACING.xxxl * 2,
  showHeader = true,
}: EmptyStateProps) {
  const theme = useCustomTheme();

  const content = (
    <View style={showHeader ? styles.emptyContainer : styles.emptyContainerInline}>
      <Ionicons 
        name={icon} 
        size={iconSize} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl * 2 + SPACING.xlBase,
  },
  emptyContainerInline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl * 2 + SPACING.xlBase,
    minHeight: SPACING.xxxl * 6,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "600",
    marginTop: SPACING.xl,
    textAlign: "center",
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    marginTop: SPACING.md,
    textAlign: "center",
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.sm,
    textAlign: "center",
    opacity: 0.7,
  },
});

