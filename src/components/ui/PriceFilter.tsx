import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, Platform } from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
  onInputFocus?: () => void;
}

export default function PriceFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onInputFocus,
}: PriceFilterProps) {
  const paperTheme = useCustomTheme();
  const [minPriceText, setMinPriceText] = useState(minPrice?.toString() || '');
  const [maxPriceText, setMaxPriceText] = useState(maxPrice?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const minInputRef = useRef<TextInput>(null);
  const maxInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setMinPriceText(minPrice?.toString() || '');
    setMaxPriceText(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  const handleMinPriceChange = (text: string) => {
    setMinPriceText(text);
    setError(null);

    if (text.trim() === '') {
      onMinPriceChange(undefined);
      return;
    }

    const numericValue = parseFloat(text.replace(',', '.'));
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Preço mínimo inválido');
      onMinPriceChange(undefined);
      return;
    }

    if (maxPrice !== undefined && numericValue > maxPrice) {
      setError('Preço mínimo não pode ser maior que o máximo');
      onMinPriceChange(undefined);
      return;
    }

    onMinPriceChange(numericValue);
  };

  const handleMaxPriceChange = (text: string) => {
    setMaxPriceText(text);
    setError(null);

    if (text.trim() === '') {
      onMaxPriceChange(undefined);
      return;
    }

    const numericValue = parseFloat(text.replace(',', '.'));
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Preço máximo inválido');
      onMaxPriceChange(undefined);
      return;
    }

    if (minPrice !== undefined && numericValue < minPrice) {
      setError('Preço máximo não pode ser menor que o mínimo');
      onMaxPriceChange(undefined);
      return;
    }

    onMaxPriceChange(numericValue);
  };

  const handleInputFocus = () => {
    if (onInputFocus && Platform.OS === 'android') {
      onInputFocus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
        Faixa de Preço
      </Text>

      <View style={styles.inputsContainer}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Mínimo
          </Text>
          <TextInput
            ref={minInputRef}
            style={[
              styles.input,
              {
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: error ? paperTheme.colors.error : paperTheme.colors.outline,
              },
            ]}
            value={minPriceText}
            onChangeText={handleMinPriceChange}
            onFocus={handleInputFocus}
            placeholder="R$ 0,00"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Máximo
          </Text>
          <TextInput
            ref={maxInputRef}
            style={[
              styles.input,
              {
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: error ? paperTheme.colors.error : paperTheme.colors.outline,
              },
            ]}
            value={maxPriceText}
            onChangeText={handleMaxPriceChange}
            onFocus={handleInputFocus}
            placeholder="R$ 0,00"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.smPlus,
    fontSize: FONT_SIZE.lg,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});

