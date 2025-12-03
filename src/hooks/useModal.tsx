import { useCallback, useState } from 'react';

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

  const showModal = useCallback((config: Omit<ModalState, 'visible'>) => {
    setModalState({
      ...config,
      visible: true,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'success',
      primaryButton,
      secondaryButton,
    });
  }, [showModal]);

  const showError = useCallback((title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'error',
      primaryButton,
      secondaryButton,
    });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'warning',
      primaryButton,
      secondaryButton,
    });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string, primaryButton?: ModalState['primaryButton'], secondaryButton?: ModalState['secondaryButton']) => {
    showModal({
      title,
      message,
      type: 'info',
      primaryButton,
      secondaryButton,
    });
  }, [showModal]);

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
