import { useState } from 'react';

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  primaryButton?: {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'danger' | 'success';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = (config: Omit<ModalState, 'visible'>) => {
    setModalState({
      ...config,
      visible: true,
    });
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const showSuccess = (title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'success',
      primaryButton,
      secondaryButton,
    });
  };

  const showError = (title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'error',
      primaryButton,
      secondaryButton,
    });
  };

  const showWarning = (title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'warning',
      primaryButton,
      secondaryButton,
    });
  };

  const showInfo = (title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'info',
      primaryButton,
      secondaryButton,
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
