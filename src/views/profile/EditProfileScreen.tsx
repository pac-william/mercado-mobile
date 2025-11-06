import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsStackParamList } from '../../../App';
import CustomModal from '../../components/ui/CustomModal';
import api from '../../services/api';
import { User } from '../../types/user';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const paperTheme = usePaperTheme();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    primaryButton: { text: 'OK', onPress: () => setModalVisible(false) } as { text: string; onPress: () => void },
  });

  const formatDateForInput = (date: string | Date): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (dateString: string): string | undefined => {
    if (!dateString || !dateString.trim()) return undefined;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return undefined;
  };

  const showModal = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    primaryButton?: { text: string; onPress: () => void }
  ) => {
    setModalConfig({
      type,
      title,
      message,
      primaryButton: primaryButton || { text: 'OK', onPress: () => setModalVisible(false) }
    });
    setModalVisible(true);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('userInfo');
        if (userData) {
          const currentUser = JSON.parse(userData) as User;
          setUser(currentUser);
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            birthDate: currentUser.birthDate ? formatDateForInput(currentUser.birthDate) : '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    loadUser();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      showModal('error', 'Erro', 'Usuário não encontrado.', { text: 'OK', onPress: () => setModalVisible(false) });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        birthDate: formatDateForAPI(formData.birthDate),
      };

      const response = await api.patch(`/users/${user.id}`, updateData);
      const updatedUser = response.data as User;
      await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showModal('success', 'Sucesso', 'Perfil atualizado com sucesso!', { 
        text: 'OK', 
        onPress: () => {
          setModalVisible(false);
          navigation.goBack();
        }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Não foi possível atualizar o perfil.';
      showModal('error', 'Erro', errorMessage, { text: 'OK', onPress: () => setModalVisible(false) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Selecionar Imagem',
      'Funcionalidade de upload de imagem em desenvolvimento.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: paperTheme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 24,
      color: paperTheme.colors.onBackground,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: 16,
      overflow: 'hidden',
      backgroundColor: paperTheme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      fontSize: 32,
      color: paperTheme.colors.onSurfaceVariant,
    },
    uploadButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: isUploadingImage ? paperTheme.colors.outline : paperTheme.colors.primary,
      minWidth: 140,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadButtonText: {
      color: paperTheme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: paperTheme.colors.onSurface,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: paperTheme.colors.surface,
      color: paperTheme.colors.onSurface,
    },
    inputError: {
      borderColor: paperTheme.colors.error,
    },
    inputNormal: {
      borderColor: paperTheme.colors.outline,
    },
    errorText: {
      color: paperTheme.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      marginBottom: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 8,
      backgroundColor: paperTheme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      color: paperTheme.colors.onSurfaceVariant,
      fontSize: 16,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 8,
      backgroundColor: paperTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      backgroundColor: paperTheme.colors.outline,
    },
    saveButtonText: {
      color: paperTheme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>Editar Perfil</Text>

        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
            {(user?.profilePicture || selectedImage) ? (
              <Image
                source={{ uri: selectedImage || user?.profilePicture || '' }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={[styles.avatarPlaceholder, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: isUploadingImage ? paperTheme.colors.outline : paperTheme.colors.primary }]}
            onPress={handleImageUpload}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color={paperTheme.colors.onPrimary} />
            ) : (
              <Text style={[styles.uploadButtonText, { color: paperTheme.colors.onPrimary }]}>Alterar Foto</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Nome *</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: errors.name ? paperTheme.colors.error : paperTheme.colors.outline,
              }
            ]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Digite seu nome"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
          />
          {errors.name && <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Email *</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: errors.email ? paperTheme.colors.error : paperTheme.colors.outline,
              }
            ]}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Digite seu email"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>{errors.email}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Telefone</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: paperTheme.colors.outline,
              }
            ]}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Digite seu telefone"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Data de Nascimento</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: paperTheme.colors.surface,
                color: paperTheme.colors.onSurface,
                borderColor: paperTheme.colors.outline,
              }
            ]}
            value={formData.birthDate}
            onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={[styles.cancelButtonText, { color: paperTheme.colors.onSurfaceVariant }]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: isLoading ? paperTheme.colors.outline : paperTheme.colors.primary }
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={paperTheme.colors.onPrimary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: paperTheme.colors.onPrimary }]}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryButton={modalConfig.primaryButton}
      />
    </SafeAreaView>
  );
};

export default EditProfileScreen;