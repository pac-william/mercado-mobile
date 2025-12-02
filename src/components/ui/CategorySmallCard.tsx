import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from "../../constants/styles";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useResponsive } from "../../hooks/useResponsive";

interface Props {
  name: string;
  image: string;
  subtitle?: string;
  onPress?: () => void;
}

const CategorySmallCard: React.FC<Props> = ({ name, image, onPress, subtitle }) => {
  const paperTheme = useCustomTheme();
  const { getWidth } = useResponsive();
  const cardWidth = (getWidth(50) - SPACING.xxl);

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: paperTheme.colors.surface,
          borderWidth: 1,
          borderColor: paperTheme.colors.outline,
          shadowColor: paperTheme.colors.modalShadow,
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: paperTheme.colors.onSurface }]}>
          {name}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: SPACING.xxxl * 2 + SPACING.xlBase,
    margin: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  image: {
    width: SPACING.xxxl + SPACING.xlBase,
    height: SPACING.xxxl + SPACING.xlBase,
    resizeMode: "contain",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1, 
  },
  text: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});

export default CategorySmallCard;