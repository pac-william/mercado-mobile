import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { formatCurrency, formatCardNumber, formatExpiryDate } from '../../utils/format';
import Button from './Button';

interface PaymentCardModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (cardData: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  }) => void;
  total: number;
}

export default function PaymentCardModal({
  visible,
  onClose,
  onConfirm,
  total,
}: PaymentCardModalProps) {
  const paperTheme = useCustomTheme();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleConfirm = () => {
    onConfirm(formData);
  };

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.modalOverlay, { backgroundColor: paperTheme.colors.modalOverlay }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                    Dados do Cartão
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons
                      name="close"
                      size={ICON_SIZES.xl}
                      color={paperTheme.colors.onSurface}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={true}
                  indicatorStyle={paperTheme.dark ? 'white' : 'default'}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.formContainer}>
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
                        Número do Cartão
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: paperTheme.colors.surfaceVariant,
                            borderColor: paperTheme.colors.outline,
                            color: paperTheme.colors.onSurface,
                          }
                        ]}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                        value={formData.cardNumber}
                        onChangeText={(text) => setFormData({ ...formData, cardNumber: formatCardNumber(text) })}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
                        Nome no Cartão
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: paperTheme.colors.surfaceVariant,
                            borderColor: paperTheme.colors.outline,
                            color: paperTheme.colors.onSurface,
                          }
                        ]}
                        placeholder="Nome completo"
                        placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                        value={formData.cardName}
                        onChangeText={(text) => setFormData({ ...formData, cardName: text })}
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.formGroup, styles.halfWidth]}>
                        <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
                          Validade
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: paperTheme.colors.surfaceVariant,
                              borderColor: paperTheme.colors.outline,
                              color: paperTheme.colors.onSurface,
                            }
                          ]}
                          placeholder="MM/AA"
                          placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                          value={formData.expiryDate}
                          onChangeText={(text) => setFormData({ ...formData, expiryDate: formatExpiryDate(text) })}
                          keyboardType="numeric"
                          maxLength={5}
                        />
                      </View>

                      <View style={[styles.formGroup, styles.halfWidth]}>
                        <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>
                          CVV
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: paperTheme.colors.surfaceVariant,
                              borderColor: paperTheme.colors.outline,
                              color: paperTheme.colors.onSurface,
                            }
                          ]}
                          placeholder="000"
                          placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                          value={formData.cvv}
                          onChangeText={(text) => setFormData({ ...formData, cvv: text.replace(/\D/g, '').substring(0, 3) })}
                          keyboardType="numeric"
                          maxLength={3}
                          secureTextEntry
                        />
                      </View>
                    </View>

                    <View style={[styles.totalContainer, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                      <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
                        Total
                      </Text>
                      <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>
                        {formatCurrency(total)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={[styles.modalFooter, { borderTopColor: paperTheme.colors.outline }]}>
                  <Button
                    title="Finalizar Pedido"
                    onPress={handleConfirm}
                    variant="primary"
                    size="large"
                    icon={{
                      name: "checkmark-circle",
                      position: "left",
                    }}
                    fullWidth
                  />
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
    maxHeight: '90%',
    paddingBottom: SPACING.xlBase,
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
  formContainer: {
    paddingBottom: SPACING.xlBase,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
  modalFooter: {
    paddingHorizontal: SPACING.xlBase,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
});

