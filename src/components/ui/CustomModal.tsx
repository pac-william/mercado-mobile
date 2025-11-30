import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';

const { width } = Dimensions.get('window');

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  primaryButton?: {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'danger' | 'success';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
  showCloseButton?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  primaryButton,
  secondaryButton,
  showCloseButton = true,
}) => {
  const { colors } = useCustomTheme();

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.successIcon,
          backgroundColor: colors.successBackground,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: colors.warningIcon,
          backgroundColor: colors.warningBackground,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: colors.error,
          backgroundColor: colors.errorBackground,
        };
      default:
        return {
          icon: 'information-circle' as const,
          color: colors.infoIcon,
          backgroundColor: colors.infoBackground,
        };
    }
  };

  const { icon, color, backgroundColor } = getIconAndColor();

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'danger':
        return { backgroundColor: colors.buttonDanger };
      case 'success':
        return { backgroundColor: colors.buttonSuccess };
      default:
        return { backgroundColor: colors.buttonPrimary };
    }
  };

  const getButtonTextStyle = () => {
    return { color: colors.white };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalSurface, shadowColor: colors.modalShadow }]}>
          {/* Header com ícone */}
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons name={icon} size={ICON_SIZES.xxxl + ICON_SIZES.sm} color={color} />
          </View>

          {/* Conteúdo */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              {secondaryButton && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.surfaceLight, borderColor: colors.outlineLight }]}
                  onPress={secondaryButton.onPress}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.onSurface }]}>
                    {secondaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}

              {primaryButton && (
                <TouchableOpacity
                  style={[styles.button, getButtonStyle(primaryButton.style), { shadowColor: colors.modalShadow }]}
                  onPress={primaryButton.onPress}
                >
                  <Text style={[styles.buttonText, getButtonTextStyle()]}>
                    {primaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Botão de fechar */}
          {showCloseButton && (
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]} onPress={onClose}>
              <Ionicons name="close" size={ICON_SIZES.xl} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xlBase,
  },
  modalContainer: {
    borderRadius: BORDER_RADIUS.xxl,
    width: width * 0.9,
    maxWidth: SPACING.xxxl * 10,
    shadowOffset: { width: 0, height: SPACING.smPlus },
    shadowOpacity: 0.25,
    shadowRadius: SPACING.xlBase,
    elevation: SPACING.smPlus,
    position: 'relative',
  },
  iconContainer: {
    width: SPACING.xxxl * 2,
    height: SPACING.xxxl * 2,
    borderRadius: SPACING.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -SPACING.xxxl,
    marginBottom: SPACING.xlBase,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl + SPACING.micro,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.displaySm,
  },
  message: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    lineHeight: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  buttonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomModal;