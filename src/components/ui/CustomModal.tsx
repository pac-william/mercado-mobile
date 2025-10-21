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
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#F44336',
          backgroundColor: '#FFEBEE',
        };
      default:
        return {
          icon: 'information-circle',
          color: '#2196F3',
          backgroundColor: '#E3F2FD',
        };
    }
  };

  const { icon, color, backgroundColor } = getIconAndColor();

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'danger':
        return styles.dangerButton;
      case 'success':
        return styles.successButton;
      default:
        return styles.primaryButton;
    }
  };

  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'danger':
        return styles.dangerButtonText;
      case 'success':
        return styles.successButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header com ícone */}
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons name={icon} size={48} color={color} />
          </View>

          {/* Conteúdo */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              {secondaryButton && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={secondaryButton.onPress}
                >
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}

              {primaryButton && (
                <TouchableOpacity
                  style={[styles.button, getButtonStyle(primaryButton.style)]}
                  onPress={primaryButton.onPress}
                >
                  <Text style={[styles.buttonText, getButtonTextStyle(primaryButton.style)]}>
                    {primaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Botão de fechar */}
          {showCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
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
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: 'white',
  },
  dangerButtonText: {
    color: 'white',
  },
  successButtonText: {
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomModal;