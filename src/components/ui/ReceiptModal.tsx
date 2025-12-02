import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Receipt } from '../../types/suggestion';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { useResponsive } from '../../hooks/useResponsive';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  receipt: Receipt;
  mode: 'recipe' | 'instructions';
}

export default function ReceiptModal({
  visible,
  onClose,
  receipt,
  mode,
}: ReceiptModalProps) {
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const { getHeight, height } = useResponsive();
  const maxModalHeight = getHeight(90) - insets.bottom;

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
            <View
              style={[
                styles.modalContent,
                { 
                  backgroundColor: paperTheme.colors.surface,
                  maxHeight: maxModalHeight,
                  height: maxModalHeight,
                },
              ]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: paperTheme.colors.outline }]}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {mode === 'recipe' ? 'Receita' : 'Modo de Preparo'}
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
                contentContainerStyle={[
                  styles.contentContainer,
                  { paddingBottom: Math.max(insets.bottom + SPACING.md, SPACING.xl) }
                ]}
                showsVerticalScrollIndicator={true}
                indicatorStyle={paperTheme.dark ? 'white' : 'default'}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={Platform.OS === 'android'}
                bounces={Platform.OS === 'ios'}
                scrollEnabled={true}
                alwaysBounceVertical={false}
              >
                  {mode === 'recipe' ? (
                    <>
                      <View style={styles.headerSection}>
                        <Text style={[styles.recipeName, { color: paperTheme.colors.onSurface }]}>
                          {receipt.name}
                        </Text>
                        {receipt.description && (
                          <Text style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}>
                            {receipt.description}
                          </Text>
                        )}
                        <View style={styles.badgesContainer}>
                          {receipt.prepTime > 0 && (
                            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                              <Ionicons name="time-outline" size={ICON_SIZES.sm + SPACING.micro} color={paperTheme.colors.primary} />
                              <Text style={[styles.badgeText, { color: paperTheme.colors.primary }]}>
                                {receipt.prepTime} min
                              </Text>
                            </View>
                          )}
                          {receipt.servings > 0 && (
                            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                              <Ionicons name="people-outline" size={ICON_SIZES.sm + SPACING.micro} color={paperTheme.colors.primary} />
                              <Text style={[styles.badgeText, { color: paperTheme.colors.primary }]}>
                                {receipt.servings} {receipt.servings === 1 ? 'porção' : 'porções'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {receipt.ingredients && receipt.ingredients.length > 0 && (
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <Ionicons name="list-outline" size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
                              Ingredientes
                            </Text>
                          </View>
                          <View style={styles.ingredientsList}>
                            {receipt.ingredients.map((ingredient, index) => (
                              <View key={index} style={styles.ingredientItem}>
                                <Text style={[styles.ingredientQuantity, { color: paperTheme.colors.primary }]}>
                                  {ingredient.quantity}
                                </Text>
                                <Text style={[styles.ingredientName, { color: paperTheme.colors.onSurface }]}>
                                  {ingredient.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <View style={styles.headerSection}>
                        <Text style={[styles.recipeName, { color: paperTheme.colors.onSurface }]}>
                          {receipt.name}
                        </Text>
                        {receipt.description && (
                          <Text style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}>
                            {receipt.description}
                          </Text>
                        )}
                      </View>

                      {receipt.instructions && receipt.instructions.length > 0 && (
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <Ionicons name="restaurant-outline" size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
                              Modo de Preparo
                            </Text>
                          </View>
                          <View style={styles.instructionsList}>
                            {receipt.instructions.map((instruction, index) => (
                              <View key={index} style={styles.instructionItem}>
                                <View style={[styles.stepNumber, { backgroundColor: paperTheme.colors.primary }]}>
                                  <Text style={[styles.stepNumberText, { color: paperTheme.colors.onPrimary }]}>
                                    {index + 1}
                                  </Text>
                                </View>
                                <Text style={[styles.instructionText, { color: paperTheme.colors.onSurface }]}>
                                  {instruction}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  )}
              </ScrollView>
            </View>
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
    flexDirection: 'column',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xlBase,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    minHeight: 0,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xlBase,
    paddingTop: SPACING.xlBase,
  },
  headerSection: {
    marginBottom: SPACING.xl,
  },
  recipeName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.md,
    lineHeight: SPACING.xlBase,
    marginBottom: SPACING.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xsPlus,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.xsPlus,
  },
  badgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: '600',
  },
  ingredientsList: {
    gap: SPACING.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  ingredientQuantity: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    minWidth: SPACING.xxxl * 2,
  },
  ingredientName: {
    fontSize: FONT_SIZE.md,
    flex: 1,
    lineHeight: SPACING.xlBase,
  },
  instructionsList: {
    gap: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  stepNumber: {
    width: ICON_SIZES.xlPlus,
    height: ICON_SIZES.xlPlus,
    borderRadius: BORDER_RADIUS.lgPlus,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: FONT_SIZE.md,
    lineHeight: SPACING.xlBase,
    flex: 1,
  },
});

