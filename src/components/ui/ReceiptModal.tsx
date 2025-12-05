import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Receipt } from '../../types/suggestion';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView 
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.surface }
        ]}
        edges={['top', 'bottom']}
      >
        <View style={[
          styles.header,
          { borderBottomColor: paperTheme.colors.outline }
        ]}>
          <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
            {mode === 'recipe' ? 'Receita' : 'Modo de Preparo'}
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={ICON_SIZES.xl}
              color={paperTheme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, SPACING.xxxl) }
          ]}
          showsVerticalScrollIndicator={true}
          indicatorStyle={paperTheme.dark ? 'white' : 'default'}
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
                      <Ionicons 
                        name="time-outline" 
                        size={ICON_SIZES.sm + SPACING.micro} 
                        color={paperTheme.colors.primary} 
                      />
                      <Text style={[styles.badgeText, { color: paperTheme.colors.primary }]}>
                        {receipt.prepTime} min
                      </Text>
                    </View>
                  )}
                  {receipt.servings > 0 && (
                    <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                      <Ionicons 
                        name="people-outline" 
                        size={ICON_SIZES.sm + SPACING.micro} 
                        color={paperTheme.colors.primary} 
                      />
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
                    <Ionicons 
                      name="list-outline" 
                      size={ICON_SIZES.lg} 
                      color={paperTheme.colors.primary} 
                    />
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
                    <Ionicons 
                      name="restaurant-outline" 
                      size={ICON_SIZES.lg} 
                      color={paperTheme.colors.primary} 
                    />
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xlBase,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    lineHeight: SPACING.xlBase * 1.2,
    marginBottom: SPACING.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    marginTop: SPACING.md,
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
    lineHeight: SPACING.xlBase * 1.2,
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
    lineHeight: SPACING.xlBase * 1.2,
    flex: 1,
  },
});
