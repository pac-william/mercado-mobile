import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { formatCEP, searchAddressByCEP, validateCEP } from '../../services/cepService';
import { Address, createAddress, getAddressById, updateAddress } from '../../services/addressService';
import { reverseGeocode } from '../../services/geocodingService';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../../constants/styles';

type AddEditAddressScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface RouteParams {
  addressId?: string;
  initialData?: {
    name?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  onAddressAdded?: (address: any) => void;
}

export default function AddEditAddressScreen() {
  const navigation = useNavigation<AddEditAddressScreenNavigationProp>();
  const paperTheme = useCustomTheme();
  const route = useRoute();
  const { addressId, initialData, onAddressAdded } = (route.params as RouteParams) || {};
  const [address, setAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    street: initialData?.street || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    isFavorite: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
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
        const updatedAddress = await updateAddress(addressId, addressData);
        Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
        navigation.goBack();
      } else {
        const newAddress = await createAddress(addressData);
        Alert.alert('Sucesso', 'Endereço adicionado com sucesso!');
        
        if (onAddressAdded) {
          onAddressAdded(newAddress);
        }
        navigation.goBack();
      }
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

  const handleRequestLocation = () => {
    Alert.alert(
      'Usar localização atual?',
      'Deseja usar sua localização atual para preencher automaticamente o endereço?\n\nSerá necessário permitir o acesso à sua localização.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sim, usar localização',
          onPress: handleGetLocation,
        },
      ],
      { cancelable: true }
    );
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Para usar sua localização, é necessário permitir o acesso à localização nas configurações do dispositivo.'
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const addressData = await reverseGeocode(latitude, longitude);
      console.log('addressData', addressData);
      setFormData(prev => ({
        ...prev,
        street: prev.street.trim() || addressData.street || '',
        number: prev.number.trim() || addressData.number || '',
        neighborhood: prev.neighborhood.trim() || addressData.neighborhood || '',
        city: prev.city.trim() || addressData.city || '',
        state: prev.state.trim() || addressData.state || '',
        zipCode: prev.zipCode.trim() || (addressData.zipCode ? formatCEP(addressData.zipCode) : ''),
        complement: prev.complement.trim() || '',
      }));
    } catch (error: any) {
      console.error('Erro ao buscar localização:', error);
      let errorMessage = 'Não foi possível obter sua localização.';
      
      if (error.message?.includes('permission')) {
        errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização nas configurações.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Tempo esgotado ao buscar localização. Tente novamente.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Endereço não encontrado para as coordenadas fornecidas.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingLocation(false);
    }
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
          showsVerticalScrollIndicator={true}
          indicatorStyle={paperTheme.dark ? 'white' : 'default'}
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
          <TouchableOpacity
            style={[styles.locationButton, {
              backgroundColor: paperTheme.colors.surfaceVariant,
              borderColor: paperTheme.colors.outline,
            }]}
            onPress={handleRequestLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color={paperTheme.colors.primary} />
            ) : (
              <Ionicons name="location" size={20} color={paperTheme.colors.primary} style={{ marginRight: 8 }} />
            )}
            <Text style={[styles.locationButtonText, { color: paperTheme.colors.onSurface }]}>
              {loadingLocation ? 'Buscando localização...' : 'Usar minha localização atual'}
            </Text>
          </TouchableOpacity>

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
                  borderColor: cepError ? paperTheme.colors.error : paperTheme.colors.outline,
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
              <Text style={[styles.errorText, { color: paperTheme.colors.errorText }]}>{cepError}</Text>
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
              borderColor: formData.isFavorite ? paperTheme.colors.favoriteIcon : paperTheme.colors.outline
            }]}
            onPress={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
          >
            <Ionicons
              name={formData.isFavorite ? "star" : "star-outline"}
              size={24}
              color={formData.isFavorite ? paperTheme.colors.favoriteIcon : paperTheme.colors.onSurface}
            />
            <Text style={[styles.favoriteText, formData.isFavorite && styles.favoriteTextActive, {
              color: formData.isFavorite ? paperTheme.colors.favoriteText : paperTheme.colors.onSurface
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
              <ActivityIndicator color={paperTheme.colors.onPrimary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: paperTheme.colors.onPrimary }]}>Salvar</Text>
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
    paddingBottom: SPACING.xxxl * 2 + SPACING.xlBase,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xlBase,
  },
  title: {
    fontSize: FONT_SIZE.displaySm,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
  },
  form: {
    paddingHorizontal: SPACING.lg,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  locationButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  inputGroup: {
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
  cepContainer: {
    position: 'relative',
  },
  cepLoading: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  favoriteToggleActive: {
  },
  favoriteText: {
    fontSize: FONT_SIZE.lg,
    marginLeft: SPACING.md,
  },
  favoriteTextActive: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xlBase,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
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
  },
  saveButtonDisabled: {
  },
  saveButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});