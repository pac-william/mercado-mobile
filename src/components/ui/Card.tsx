import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/styles";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  const theme = useCustomTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.modalShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.large,
  },
});

