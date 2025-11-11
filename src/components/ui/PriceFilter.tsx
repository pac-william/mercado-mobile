import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
}

export default function PriceFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceFilterProps) {
  const paperTheme = useTheme();
  const [minPriceText, setMinPriceText] = useState(minPrice?.toString() || '');
  const [maxPriceText, setMaxPriceText] = useState(maxPrice?.toString() || '');
  const [error, setError] = useState<string | null>(null);

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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
});

