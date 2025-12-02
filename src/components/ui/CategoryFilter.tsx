import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getCategories } from '../../services/categoryService';
import { Category } from '../../domain/categoryDomain';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { useLoading } from '../../hooks/useLoading';

interface CategoryFilterProps {
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
}

export default function CategoryFilter({
  selectedCategoryIds,
  onCategoryChange,
}: CategoryFilterProps) {
  const paperTheme = useCustomTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, execute } = useLoading({ initialValue: true });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    execute(async () => {
      try {
        const response = await getCategories(1, 100);
        const categoriesData = (response as any).categories || response.category || [];
        setCategories(categoriesData);
      } catch (error) {
        setCategories([]);
      }
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onCategoryChange(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategoryIds, categoryId]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
          Categoria
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={paperTheme.colors.primary} />
        </View>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
          Categoria
        </Text>
        <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Nenhuma categoria disponível
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
        Categoria
      </Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => {
          const isSelected = selectedCategoryIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? paperTheme.colors.primary
                    : paperTheme.colors.surfaceVariant,
                  borderColor: isSelected
                    ? paperTheme.colors.primary
                    : paperTheme.colors.outline,
                },
              ]}
              onPress={() => handleCategoryPress(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected
                      ? paperTheme.colors.onPrimary
                      : paperTheme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {item.name}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={ICON_SIZES.md}
                  color={paperTheme.colors.onPrimary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
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
  categoriesContainer: {
    gap: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.smPlus,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: SPACING.xsPlus,
  },
  loadingContainer: {
    paddingVertical: SPACING.xlBase,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontStyle: 'italic',
  },
});

