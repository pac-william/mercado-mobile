import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfileScreen: React.FC = () => {
  const { state, updateProfile, updateProfilePartial, uploadProfilePicture, clearUpdateError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (state.user) {
      setFormData({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        address: state.user.address || '',
      });
    }
  }, [state.user]);

  useEffect(() => {
    if (state.updateError) {
      Alert.alert('Erro', state.updateError);
      clearUpdateError();
    }
  }, [state.updateError]);

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

    setIsLoading(true);
    try {
      await updateProfile(formData);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (state.user) {
      setFormData({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        address: state.user.address || '',
      });
    }
    setErrors({});
    setSelectedImage(null);
  };

  const handleImageUpload = async () => {
    // Simulação de seleção de imagem (em um app real, use react-native-image-picker)
    Alert.alert(
      'Selecionar Imagem',
      'Em um app real, isso abriria a galeria. Por agora, simular upload.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Simular Upload', onPress: simulateImageUpload }
      ]
    );
  };

  const simulateImageUpload = async () => {
    setIsUploadingImage(true);
    try {
      // Simular um arquivo de imagem (em produção, use a biblioteca real)
      const mockFile = { uri: 'mock-image-uri', type: 'image/jpeg', fileName: 'profile.jpg' };
      await uploadProfilePicture(mockFile);
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      setSelectedImage(mockFile.uri);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer upload da imagem.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</Text>

        {/* Seção de Foto de Perfil */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
            {(state.user?.profilePicture || selectedImage) ? (
              <Image
                source={{ uri: selectedImage || state.user?.profilePicture || '' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-gray-500">Foto</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className={`py-2 px-4 rounded-lg ${isUploadingImage ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={handleImageUpload}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center">Alterar Foto</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Nome *</Text>
          <TextInput
            className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-gray-50`}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Digite seu nome"
          />
          {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Email *</Text>
          <TextInput
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-gray-50`}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Telefone</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Digite seu telefone"
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Endereço</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Digite seu endereço"
          />
        </View>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-gray-500 py-3 px-6 rounded-lg flex-1 mr-2"
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 px-6 rounded-lg flex-1 ml-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold">Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
