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
import { useTheme } from 'react-native-paper';

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
  const { colors } = useTheme();

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
            <Ionicons name={icon} size={48} color={color} />
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
                  <Text style={{ color: colors.onSurface }}>
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
              <Ionicons name="close" size={24} color={colors.textSecondary} />
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
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 6,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomModal;