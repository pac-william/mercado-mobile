import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { getOrderStatusColor, getOrderStatusText } from "../../utils/orderStatus";
import { SPACING, BORDER_RADIUS, FONT_SIZE } from "../../constants/styles";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useCustomTheme();
  const statusColor = getOrderStatusColor(status, theme.colors);
  const statusText = getOrderStatusText(status);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${statusColor}20`,
          borderColor: statusColor,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, { color: statusColor }]}>
        {statusText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xsPlus,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: SPACING.xs + 2,
    height: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
});

