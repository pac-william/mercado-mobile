import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import PriceFilter from './PriceFilter';
import CategoryFilter from './CategoryFilter';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { minPrice?: number; maxPrice?: number; categoryIds?: string[] }) => void;
  onClear: () => void;
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    categoryIds?: string[];
  };
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters,
}: FilterModalProps) {
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const [minPrice, setMinPrice] = useState<number | undefined>(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(currentFilters.maxPrice);
  const [categoryIds, setCategoryIds] = useState<string[]>(currentFilters.categoryIds || []);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    setMinPrice(currentFilters.minPrice);
    setMaxPrice(currentFilters.maxPrice);
    setCategoryIds(currentFilters.categoryIds || []);
  }, [currentFilters]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [visible]);

  const handleApply = () => {
    onApply({ minPrice, maxPrice, categoryIds: categoryIds.length ? categoryIds : undefined });
    onClose();
  };

  const handleClear = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCategoryIds([]);
    onClear();
    onClose();
  };

  const hasActiveFilters =
    minPrice !== undefined || maxPrice !== undefined || (categoryIds && categoryIds.length > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalOverlay, { backgroundColor: paperTheme.colors.modalOverlay }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={0}
              style={{ flex: 1, justifyContent: 'flex-end' }}
            >
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: paperTheme.colors.surface },
                ]}
              >
                <View style={[styles.modalHeader, { borderBottomColor: paperTheme.colors.outline }]}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Filtros
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons
                      name="close"
                      size={ICON_SIZES.xl}
                      color={paperTheme.colors.onSurface}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={
                    Platform.OS === 'android' && keyboardHeight > 0
                      ? { paddingBottom: keyboardHeight + SPACING.xl }
                      : undefined
                  }
                  showsVerticalScrollIndicator={true}
                  indicatorStyle={paperTheme.dark ? 'white' : 'default'}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  <CategoryFilter
                    selectedCategoryIds={categoryIds}
                    onCategoryChange={setCategoryIds}
                  />
                  <PriceFilter
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                  />
                </ScrollView>

                <View style={[styles.modalFooter, { borderTopColor: paperTheme.colors.outline, paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
                  {hasActiveFilters && (
                    <TouchableOpacity
                      style={[
                        styles.clearButton,
                        { backgroundColor: paperTheme.colors.surfaceVariant },
                      ]}
                      onPress={handleClear}
                    >
                      <Text
                        style={[
                          styles.clearButtonText,
                          { color: paperTheme.colors.onSurfaceVariant },
                        ]}
                      >
                        Limpar
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      { backgroundColor: paperTheme.colors.primary },
                    ]}
                    onPress={handleApply}
                  >
                    <Text
                      style={[
                        styles.applyButtonText,
                        { color: paperTheme.colors.onPrimary },
                      ]}
                    >
                      Aplicar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xlBase,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: SPACING.xlBase,
    paddingTop: SPACING.xlBase,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xlBase,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md + SPACING.micro,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md + SPACING.micro,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});

