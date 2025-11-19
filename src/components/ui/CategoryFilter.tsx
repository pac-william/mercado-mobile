import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getCategories } from '../../services/categoryService';
import { Category } from '../../domain/categoryDomain';

interface CategoryFilterProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
}

export default function CategoryFilter({
  selectedCategoryId,
  onCategoryChange,
}: CategoryFilterProps) {
  const paperTheme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories(1, 100);
      const categoriesData = (response as any).categories || response.category || [];
      setCategories(categoriesData);
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(categoryId);
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
          const isSelected = selectedCategoryId === item.id;
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
                  size={16}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 6,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

