import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { Address, createAddress, getAddressById, updateAddress } from '../../services/addressService';

type AddEditAddressScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface RouteParams {
  addressId?: string;
}

export default function AddEditAddressScreen() {
  const navigation = useNavigation<AddEditAddressScreenNavigationProp>();
  const route = useRoute();
  const { addressId } = (route.params as RouteParams) || {};
  const [address, setAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isFavorite: false,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (addressId) {
      setIsEditing(true);
      const loadAddress = async () => {
        try {
          const addressData = await getAddressById(addressId);
          // Converter null para undefined para compatibilidade de tipos
          const addressWithFixedTypes = {
            ...addressData,
            complement: addressData.complement ?? undefined
          };
          setAddress(addressWithFixedTypes);
          setFormData({
            name: addressData.name,
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || '',
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,
            isFavorite: addressData.isFavorite,
          });
        } catch (error) {
          console.error('Erro ao carregar endereço:', error);
          Alert.alert('Erro', 'Não foi possível carregar o endereço.');
        }
      };
      loadAddress();
    }
  }, [addressId]);

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing && addressId) {
        await updateAddress(addressId, formData);
        Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
      } else {
        await createAddress(formData);
        Alert.alert('Sucesso', 'Endereço adicionado com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o endereço.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do endereço é obrigatório');
      return false;
    }
    if (!formData.street.trim()) {
      Alert.alert('Erro', 'Rua é obrigatória');
      return false;
    }
    if (!formData.number.trim()) {
      Alert.alert('Erro', 'Número é obrigatório');
      return false;
    }
    if (!formData.neighborhood.trim()) {
      Alert.alert('Erro', 'Bairro é obrigatório');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erro', 'Cidade é obrigatória');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Erro', 'Estado é obrigatório');
      return false;
    }
    if (!formData.zipCode.trim()) {
      Alert.alert('Erro', 'CEP é obrigatório');
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Atualize as informações do endereço' : 'Adicione um novo endereço de entrega'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Endereço *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Casa, Trabalho, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CEP *</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
              placeholder="00000-000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rua *</Text>
            <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholder="Nome da rua"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número *</Text>
            <TextInput
              style={styles.input}
              value={formData.number}
              onChangeText={(text) => setFormData({ ...formData, number: text })}
              placeholder="Número"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              value={formData.complement}
              onChangeText={(text) => setFormData({ ...formData, complement: text })}
              placeholder="Apto, sala, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro *</Text>
            <TextInput
              style={styles.input}
              value={formData.neighborhood}
              onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
              placeholder="Nome do bairro"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Nome da cidade"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              placeholder="UF"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.favoriteToggle, formData.isFavorite && styles.favoriteToggleActive]}
            onPress={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
          >
            <Ionicons
              name={formData.isFavorite ? "star" : "star-outline"}
              size={24}
              color={formData.isFavorite ? "#FFD700" : "#666"}
            />
            <Text style={[styles.favoriteText, formData.isFavorite && styles.favoriteTextActive]}>
              Definir como endereço favorito
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  favoriteToggleActive: {
    backgroundColor: '#fff8dc',
    borderColor: '#FFD700',
  },
  favoriteText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  favoriteTextActive: {
    color: '#8b6914',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
