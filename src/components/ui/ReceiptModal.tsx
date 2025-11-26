import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Receipt } from '../../types/suggestion';

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
  const paperTheme = useTheme();

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
                  {mode === 'recipe' ? 'Receita' : 'Modo de Preparo'}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={paperTheme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
                indicatorStyle={paperTheme.dark ? 'white' : 'default'}
              >
                <View style={styles.contentContainer}>
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
                              <Ionicons name="time-outline" size={14} color={paperTheme.colors.primary} />
                              <Text style={[styles.badgeText, { color: paperTheme.colors.primary }]}>
                                {receipt.prepTime} min
                              </Text>
                            </View>
                          )}
                          {receipt.servings > 0 && (
                            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                              <Ionicons name="people-outline" size={14} color={paperTheme.colors.primary} />
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
                            <Ionicons name="list-outline" size={20} color={paperTheme.colors.primary} />
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
                            <Ionicons name="restaurant-outline" size={20} color={paperTheme.colors.primary} />
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
                </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ingredientQuantity: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  ingredientName: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

