import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserUpdateDTO } from 'dtos/userDTO';
import React, { useCallback, useEffect, useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsStackParamList } from '../../../App';
import CustomModal from '../../components/ui/CustomModal';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { User } from '../../types/user';
import { usePermissions } from '../../hooks/usePermissions';
import { getUserMe, updateUserMe } from '../../services/userService';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../../constants/styles';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const paperTheme = useCustomTheme();
  const permissions = usePermissions();
  const { profile: contextProfile, setLocalPhoto: setProfilePhoto, applyProfileUpdate, localPhoto } = useUserProfile();
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
  const [isLoadingUser, setIsLoadingUser] = useState(false);
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
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      const day = dateObj.getUTCDate().toString().padStart(2, '0');
      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  const formatBirthDateInput = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const isValidDate = (dateString: string): boolean => {
    if (!dateString || dateString.length !== 10) return false;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const formatDateForAPI = (dateString: string): string | undefined => {
    if (!dateString || !dateString.trim()) return undefined;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString();
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


  const initializeFormData = useCallback((userData: User) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      birthDate: userData.birthDate ? formatDateForInput(userData.birthDate) : '',
    });
  }, []);

  useEffect(() => {
    if (contextProfile) {
      setUser(contextProfile);
      initializeFormData(contextProfile);
      setIsLoadingUser(false);
    } else {
      setIsLoadingUser(true);
    }
  }, [contextProfile, initializeFormData]);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getUserMe();
      setUser(currentUser);
      initializeFormData(currentUser);
      await applyProfileUpdate(currentUser);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      if (!contextProfile) {
        showModal('error', 'Erro', 'Não foi possível carregar os dados do usuário.', {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            navigation.goBack();
          }
        });
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [navigation, applyProfileUpdate, contextProfile, initializeFormData]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

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

    if (formData.birthDate && formData.birthDate.trim() && !isValidDate(formData.birthDate)) {
      newErrors.birthDate = 'Data de nascimento inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const previousLocalPhoto = localPhoto;
    let pendingLocalPhoto: string | null = null;
    try {
      let profilePicture: string | undefined = undefined;

      if (selectedImage) {
        const base64Image = await convertImageToBase64(selectedImage);
        if (base64Image) {
          profilePicture = base64Image;
          pendingLocalPhoto = base64Image;
          await setProfilePhoto(base64Image);
        } else {
          setIsLoading(false);
          Alert.alert(
            'Aviso',
            'Não foi possível processar a imagem. O perfil será salvo sem foto.',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Continuar sem foto',
                onPress: async () => {
                  await saveProfileWithoutImage();
                }
              }
            ]
          );
          return;
        }
      }

      const success = await saveProfile(profilePicture);
      if (!success && pendingLocalPhoto) {
        await setProfilePhoto(previousLocalPhoto || null);
      }
      setIsLoading(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Não foi possível atualizar o perfil.';
      showModal('error', 'Erro', errorMessage, { text: 'OK', onPress: () => setModalVisible(false) });
      if (pendingLocalPhoto) {
        await setProfilePhoto(previousLocalPhoto || null);
      }
      setIsLoading(false);
    }
  };

  const saveProfile = async (profilePicture?: string): Promise<boolean> => {
    try {
      const formattedBirthDate = formatDateForAPI(formData.birthDate);
      const updateData: UserUpdateDTO = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        birthDate: formattedBirthDate || undefined,
        profilePicture,
      };

      await updateUserMe(updateData);
      const updatedUser = await getUserMe();
      setUser(updatedUser);
      await applyProfileUpdate(updatedUser);
      setSelectedImage(null);
      showModal('success', 'Sucesso', 'Perfil atualizado com sucesso!', {
        text: 'OK',
        onPress: () => {
          setModalVisible(false);
          navigation.goBack();
        }
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Não foi possível atualizar o perfil.';
      showModal('error', 'Erro', errorMessage, { text: 'OK', onPress: () => setModalVisible(false) });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileWithoutImage = async () => {
    setIsLoading(true);
    await saveProfile(undefined);
  };

  const handleCancel = () => {
    navigation.goBack();
  };


  const handleTakePhoto = async () => {
    if (permissions.camera.loading) {
      return;
    }

    if (!permissions.camera.granted) {
      const granted = await permissions.camera.request();
      if (!granted) {
        Alert.alert(
          'Câmera não disponível',
          'Você pode continuar sem foto de perfil ou escolher uma foto da galeria.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      showModal('error', 'Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleChooseFromGallery = async () => {
    if (permissions.mediaLibrary.loading) {
      return;
    }

    if (!permissions.mediaLibrary.granted) {
      const granted = await permissions.mediaLibrary.request();
      if (!granted) {
        Alert.alert(
          'Galeria não disponível',
          'Você pode continuar sem foto de perfil ou tirar uma foto com a câmera.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      showModal('error', 'Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const handleImageUpload = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handleChooseFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Selecionar Imagem',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tirar Foto', onPress: handleTakePhoto },
          { text: 'Escolher da Galeria', onPress: handleChooseFromGallery },
        ]
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xxxl * 2 + SPACING.xlBase,
    },
    title: {
      fontSize: FONT_SIZE.displaySm,
      fontWeight: 'bold',
      marginBottom: SPACING.xl,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    avatarContainer: {
      width: SPACING.jumbo * 2,
      height: SPACING.jumbo * 2,
      borderRadius: SPACING.jumbo,
      marginBottom: SPACING.lg,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      fontSize: FONT_SIZE.displayMd,
    },
    uploadButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: BORDER_RADIUS.md,
      minWidth: SPACING.xxxl * 3 + SPACING.xlBase,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadButtonText: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: SPACING.lg,
    },
    label: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
      marginBottom: SPACING.xs,
    },
    input: {
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZE.lg,
    },
    inputError: {
    },
    inputNormal: {
    },
    errorText: {
      fontSize: FONT_SIZE.md,
      marginTop: SPACING.xs,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.xs,
      marginBottom: SPACING.lg,
      gap: SPACING.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      paddingVertical: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
    },
    saveButtonText: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
    },
  });

  if (isLoadingUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={paperTheme.dark ? 'white' : 'default'}
          keyboardShouldPersistTaps="handled"
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
                borderColor: errors.birthDate ? paperTheme.colors.error : paperTheme.colors.outline,
              }
            ]}
            value={formData.birthDate}
            onChangeText={(text) => {
              const formatted = formatBirthDateInput(text);
              setFormData({ ...formData, birthDate: formatted });
            }}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.birthDate && <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>{errors.birthDate}</Text>}
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
      </KeyboardAvoidingView>

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