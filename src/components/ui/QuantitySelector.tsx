import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { formatCurrency } from '../../utils/format';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
  showLabel?: boolean;
  showSubtotal?: boolean;
  subtotal?: number;
  centered?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  minQuantity = 1,
  showLabel = true,
  showSubtotal = false,
  subtotal,
  centered = false,
  fullWidth = false,
  compact = false,
}: QuantitySelectorProps) {
  const paperTheme = useCustomTheme();
  const isMinQuantity = quantity <= minQuantity;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          onPress={onDecrease}
          disabled={isMinQuantity}
          style={[
            styles.compactButton,
            { backgroundColor: isMinQuantity ? paperTheme.colors.surfaceVariant : paperTheme.colors.primary }
          ]}
        >
          <Ionicons
            name="remove"
            size={ICON_SIZES.md}
            color={isMinQuantity ? paperTheme.colors.onSurfaceVariant : "white"}
          />
        </TouchableOpacity>
        <View style={styles.compactValue}>
          <Text style={[styles.compactValueText, { color: paperTheme.colors.onSurface }]}>
            {quantity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onIncrease}
          style={[styles.compactButton, { backgroundColor: paperTheme.colors.primary }]}
        >
          <Ionicons
            name="add"
            size={ICON_SIZES.md}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, (centered || !fullWidth) && styles.centered]}>
      {showLabel && (
        <Text style={[styles.label, { color: paperTheme.colors.onSurface }, (centered || !fullWidth) && styles.centeredText]}>
          Quantidade
        </Text>
      )}
      <View style={[styles.controls, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
        <TouchableOpacity
          onPress={onDecrease}
          disabled={isMinQuantity}
          style={[
            styles.button,
            { backgroundColor: isMinQuantity ? paperTheme.colors.surfaceVariant : paperTheme.colors.primary }
          ]}
        >
          <Ionicons
            name="remove"
            size={ICON_SIZES.lg}
            color={isMinQuantity ? paperTheme.colors.onSurfaceVariant : "white"}
          />
        </TouchableOpacity>
        <View style={styles.value}>
          <Text style={[styles.valueText, { color: paperTheme.colors.onSurface }]}>
            {quantity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onIncrease}
          style={[styles.button, { backgroundColor: paperTheme.colors.primary }]}
        >
          <Ionicons
            name="add"
            size={ICON_SIZES.lg}
            color="white"
          />
        </TouchableOpacity>
      </View>
      {showSubtotal && subtotal !== undefined && (
        <Text style={[styles.subtotal, { color: paperTheme.colors.onSurface }, (centered || !fullWidth) && styles.centeredText]}>
          Subtotal: <Text style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>
            {formatCurrency(subtotal)}
          </Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  centered: {
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  centeredText: {
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  button: {
    width: SPACING.xxxl - SPACING.xs,
    height: SPACING.xxxl - SPACING.xs,
    borderRadius: SPACING.lgPlus,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    minWidth: SPACING.xxxl,
    alignItems: 'center',
    marginHorizontal: SPACING.smPlus,
  },
  valueText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  subtotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  compactButton: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactValue: {
    minWidth: SPACING.xxl,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  compactValueText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});

