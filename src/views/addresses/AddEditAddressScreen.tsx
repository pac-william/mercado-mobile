import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { formatCEP, searchAddressByCEP, validateCEP } from '../../services/cepService';
import { Address, createAddress, getAddressById, updateAddress } from '../../services/addressService';

type AddEditAddressScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface RouteParams {
  addressId?: string;
}

export default function AddEditAddressScreen() {
  const navigation = useNavigation<AddEditAddressScreenNavigationProp>();
  const paperTheme = usePaperTheme();
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
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const cepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (addressId) {
      setIsEditing(true);
      const loadAddress = async () => {
        try {
          const addressData = await getAddressById(addressId);
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

    return () => {
      if (cepTimeoutRef.current) {
        clearTimeout(cepTimeoutRef.current);
      }
    };
  }, [addressId]);

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const addressData = prepareAddressData();

      if (isEditing && addressId) {
        await updateAddress(addressId, addressData);
        Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
      } else {
        await createAddress(addressData);
        Alert.alert('Sucesso', 'Endereço adicionado com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      let errorMessage = 'Não foi possível salvar o endereço.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Alert.alert('Erro', errorMessage);
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
    if (!validateCEP(formData.zipCode)) {
      Alert.alert('Erro', 'CEP deve ter formato válido (00000-000)');
      return false;
    }
    return true;
  };

  const handleCEPChange = (text: string) => {
    const formatted = formatCEP(text);
    setFormData({ ...formData, zipCode: formatted });
    setCepError(null);

    if (cepTimeoutRef.current) {
      clearTimeout(cepTimeoutRef.current);
    }

    const cleanZipCode = formatted.replace(/\D/g, '');
    
    if (cleanZipCode.length === 8) {
      cepTimeoutRef.current = setTimeout(async () => {
        setLoadingCEP(true);
        setCepError(null);
        
        try {
          const cepData = await searchAddressByCEP(formatted);
          
          setFormData(prev => ({
            ...prev,
            street: prev.street.trim() ? prev.street : (cepData.street || ''),
            neighborhood: prev.neighborhood.trim() ? prev.neighborhood : (cepData.neighborhood || ''),
            city: prev.city.trim() ? prev.city : (cepData.city || ''),
            state: prev.state.trim() ? prev.state : (cepData.state || ''),
            complement: (prev.complement && prev.complement.trim()) ? prev.complement : (cepData.complement || ''),
          }));
        } catch (error: any) {
          setCepError(error.message || 'CEP não encontrado');
        } finally {
          setLoadingCEP(false);
        }
      }, 500);
    }
  };

  const prepareAddressData = () => {
    const cleanZipCode = formData.zipCode.replace(/\D/g, '');
    const formattedZipCode = cleanZipCode.length === 8 
      ? `${cleanZipCode.slice(0, 5)}-${cleanZipCode.slice(5)}`
      : formData.zipCode;

    return {
      name: formData.name.trim(),
      street: formData.street.trim(),
      number: formData.number.trim(),
      complement: formData.complement.trim() || undefined,
      neighborhood: formData.neighborhood.trim(),
      city: formData.city.trim(),
      state: formData.state.trim().toUpperCase(),
      zipCode: formattedZipCode,
      isFavorite: formData.isFavorite,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>
            {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
          </Text>
          <Text style={[styles.subtitle, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
            {isEditing ? 'Atualize as informações do endereço' : 'Adicione um novo endereço de entrega'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Nome do Endereço *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Casa, Trabalho, etc."
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>CEP *</Text>
            <View style={styles.cepContainer}>
              <TextInput
                style={[styles.input, cepError && styles.inputError, { 
                  backgroundColor: paperTheme.colors.surface,
                  borderColor: cepError ? '#d32f2f' : paperTheme.colors.outline,
                  color: paperTheme.colors.onSurface
                }]}
                value={formData.zipCode}
                onChangeText={handleCEPChange}
                placeholder="00000-000"
                placeholderTextColor={paperTheme.colors.onSurface + '80'}
                keyboardType="numeric"
                maxLength={9}
              />
              {loadingCEP && (
                <View style={styles.cepLoading}>
                  <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                </View>
              )}
            </View>
            {cepError && (
              <Text style={styles.errorText}>{cepError}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Rua *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholder="Nome da rua"
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Número *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.number}
              onChangeText={(text) => setFormData({ ...formData, number: text })}
              placeholder="Número"
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Complemento</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.complement}
              onChangeText={(text) => setFormData({ ...formData, complement: text })}
              placeholder="Apto, sala, etc."
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Bairro *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.neighborhood}
              onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
              placeholder="Nome do bairro"
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Cidade *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Nome da cidade"
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: paperTheme.colors.onSurface }]}>Estado *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline,
                color: paperTheme.colors.onSurface
              }]}
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              placeholder="UF"
              placeholderTextColor={paperTheme.colors.onSurface + '80'}
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.favoriteToggle, formData.isFavorite && styles.favoriteToggleActive, {
              backgroundColor: formData.isFavorite ? paperTheme.colors.surfaceVariant : paperTheme.colors.surface,
              borderColor: formData.isFavorite ? '#FFD700' : paperTheme.colors.outline
            }]}
            onPress={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
          >
            <Ionicons
              name={formData.isFavorite ? "star" : "star-outline"}
              size={24}
              color={formData.isFavorite ? "#FFD700" : paperTheme.colors.onSurface}
            />
            <Text style={[styles.favoriteText, formData.isFavorite && styles.favoriteTextActive, {
              color: formData.isFavorite ? '#8b6914' : paperTheme.colors.onSurface
            }]}>
              Definir como endereço favorito
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: paperTheme.colors.onSurfaceVariant }]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled, { backgroundColor: loading ? paperTheme.colors.outline : paperTheme.colors.primary }]}
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  cepContainer: {
    position: 'relative',
  },
  cepLoading: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 4,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
  },
  favoriteToggleActive: {
  },
  favoriteText: {
    fontSize: 16,
    marginLeft: 12,
  },
  favoriteTextActive: {
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
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});