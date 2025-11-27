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
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { formatCurrency } from '../../utils/format';
import Button from './Button';

interface PaymentPixModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

export default function PaymentPixModal({
  visible,
  onClose,
  onConfirm,
  total,
}: PaymentPixModalProps) {
  const paperTheme = useCustomTheme();
  const [showQRCode, setShowQRCode] = useState(true);

  const pixCode = '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5925MERCADO MOBILE LTDA6009SAO PAULO62070503***6304ABCD';

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
                    Pagamento via PIX
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
                  showsVerticalScrollIndicator={true}
                  indicatorStyle={paperTheme.dark ? 'white' : 'default'}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.contentContainer}>
                    <View style={styles.toggleContainer}>
                      <TouchableOpacity
                        onPress={() => setShowQRCode(true)}
                        style={[
                          styles.toggleButton,
                          {
                            backgroundColor: showQRCode
                              ? paperTheme.colors.primaryContainer
                              : paperTheme.colors.surfaceVariant,
                            borderColor: showQRCode
                              ? paperTheme.colors.primary
                              : paperTheme.colors.outline,
                          }
                        ]}
                      >
                        <Ionicons
                          name="qr-code"
                          size={ICON_SIZES.lg}
                          color={showQRCode ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
                        />
                        <Text style={[
                          styles.toggleText,
                          { color: paperTheme.colors.onSurface },
                          showQRCode && { color: paperTheme.colors.primary, fontWeight: '600' }
                        ]}>
                          QR Code
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowQRCode(false)}
                        style={[
                          styles.toggleButton,
                          {
                            backgroundColor: !showQRCode
                              ? paperTheme.colors.primaryContainer
                              : paperTheme.colors.surfaceVariant,
                            borderColor: !showQRCode
                              ? paperTheme.colors.primary
                              : paperTheme.colors.outline,
                          }
                        ]}
                      >
                        <Ionicons
                          name="copy"
                          size={ICON_SIZES.lg}
                          color={!showQRCode ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
                        />
                        <Text style={[
                          styles.toggleText,
                          { color: paperTheme.colors.onSurface },
                          !showQRCode && { color: paperTheme.colors.primary, fontWeight: '600' }
                        ]}>
                          Código
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {showQRCode ? (
                      <View style={[styles.qrCodeContainer, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                        <View style={[styles.qrCodePlaceholder, { backgroundColor: paperTheme.colors.surface }]}>
                          <Ionicons name="qr-code-outline" size={SPACING.jumbo * 2} color={paperTheme.colors.onSurfaceVariant} />
                          <Text style={[styles.qrCodeText, { color: paperTheme.colors.onSurfaceVariant }]}>
                            QR Code PIX
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.codeContainer}>
                        <Text style={[styles.codeLabel, { color: paperTheme.colors.onSurface }]}>
                          Código PIX
                        </Text>
                        <View style={[styles.codeBox, { backgroundColor: paperTheme.colors.surfaceVariant, borderColor: paperTheme.colors.outline }]}>
                          <Text style={[styles.codeText, { color: paperTheme.colors.onSurface }]}>
                            {pixCode}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={onConfirm}
                          style={[styles.copyButton, { backgroundColor: paperTheme.colors.primary }]}
                        >
                          <Ionicons name="copy" size={ICON_SIZES.md} color={paperTheme.colors.onPrimary} />
                          <Text style={[styles.copyButtonText, { color: paperTheme.colors.onPrimary }]}>
                            Copiar Código
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={[styles.infoBox, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                      <Ionicons name="information-circle" size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
                      <Text style={[styles.infoText, { color: paperTheme.colors.onPrimaryContainer }]}>
                        Após realizar o pagamento, confirme o pedido abaixo. O pagamento será verificado automaticamente.
                      </Text>
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
                    title="Confirmar Pagamento"
                    onPress={onConfirm}
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
  contentContainer: {
    paddingBottom: SPACING.xlBase,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  toggleText: {
    fontSize: FONT_SIZE.md,
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: SPACING.xlBase,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  qrCodePlaceholder: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  qrCodeText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
  },
  codeContainer: {
    marginBottom: SPACING.lg,
  },
  codeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  codeText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  copyButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
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

