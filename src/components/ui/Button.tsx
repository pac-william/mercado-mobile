import React from "react";
import { TouchableOpacity, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "ghost";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: {
    name: keyof typeof Ionicons.glyphMap;
    position?: "left" | "right";
  };
  badge?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  badge = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: variant === "outline" || variant === "ghost" ? 1 : 0,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingVertical: SPACING.xs + 2,
        paddingHorizontal: SPACING.md,
        minHeight: 32,
      },
      medium: {
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.lg,
        minHeight: 44,
      },
      large: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        minHeight: 52,
      },
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
        ...SHADOWS.small,
      },
      secondary: {
        backgroundColor: colors.secondary,
        ...SHADOWS.small,
      },
      outline: {
        backgroundColor: "transparent",
        borderColor: colors.outline,
      },
      text: {
        backgroundColor: "transparent",
      },
      ghost: {
        backgroundColor: colors.surfaceVariant,
        borderColor: colors.outline,
      },
    };

    const disabledStyle: ViewStyle = disabled || loading
      ? {
          opacity: 0.5,
        }
      : {};

    const widthStyle: ViewStyle = fullWidth ? { width: "100%" } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...widthStyle,
      ...style,
    };
  };

  const getTextColor = (): string => {
    if (disabled || loading) {
      return variant === "primary" || variant === "secondary"
        ? colors.onPrimary
        : colors.onSurfaceVariant;
    }

    switch (variant) {
      case "primary":
        return colors.onPrimary;
      case "secondary":
        return colors.onSecondary;
      case "outline":
      case "text":
      case "ghost":
        return colors.primary;
      default:
        return colors.onSurface;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case "small":
        return ICON_SIZES.sm;
      case "medium":
        return ICON_SIZES.md;
      case "large":
        return ICON_SIZES.lg;
      default:
        return ICON_SIZES.md;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case "small":
        return FONT_SIZE.sm;
      case "medium":
        return FONT_SIZE.md;
      case "large":
        return FONT_SIZE.lg;
      default:
        return FONT_SIZE.md;
    }
  };

  const iconSize = getIconSize();
  const fontSize = getFontSize();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && icon.position !== "right" && (
            <Ionicons
              name={icon.name}
              size={iconSize}
              color={textColor}
              style={{ marginRight: SPACING.xs }}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize,
                fontWeight: "600",
                color: textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && icon.position === "right" && (
            <Ionicons
              name={icon.name}
              size={iconSize}
              color={textColor}
              style={{ marginLeft: SPACING.xs }}
            />
          )}
          {badge && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.error,
                  marginLeft: SPACING.xs,
                },
              ]}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
  badge: {
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
});

