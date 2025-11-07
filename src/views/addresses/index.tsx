import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { usePermissions } from '../../hooks/usePermissions';
import { useSession } from '../../hooks/useSession';
import { formatCEP } from '../../services/cepService';
import { Address, deleteAddress, getUserAddresses } from '../../services/addressService';

type AddressesScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function AddressesScreen() {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const paperTheme = usePaperTheme();
  const { user, refreshSession } = useSession();
  const permissions = usePermissions();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await getUserAddresses(1, 100);
      // Converter null para undefined para compatibilidade de tipos
      const addressesList = (response.addresses || []).map(addr => ({
        ...addr,
        complement: addr.complement ?? undefined
      }));
      setAddresses(addressesList);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);


  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSession();
    await loadAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress');
  };

  const handleUseLocation = async () => {
    if (permissions.location.granted) {
      await getCurrentLocation();
    } else {
      const granted = await permissions.location.request();
      if (granted) {
        await getCurrentLocation();
      } else {
        Alert.alert(
          'Localização não disponível',
          'Você pode adicionar um endereço manualmente clicando no botão "+" abaixo.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        
        const street = addressData.street || addressData.name || '';
        const neighborhood = addressData.district || addressData.subregion || '';
        const city = addressData.city || '';
        const state = addressData.region || '';
        const rawZipCode = addressData.postalCode || '';
        const zipCode = rawZipCode ? formatCEP(rawZipCode) : '';
        
        navigation.navigate('AddAddress', {
          initialData: {
            street,
            neighborhood,
            city,
            state,
            zipCode,
            number: '',
            complement: '',
            name: 'Minha Localização',
          },
        });
      } else {
        Alert.alert('Erro', 'Não foi possível obter o endereço da sua localização.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização. Verifique se o GPS está ativado.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleEditAddress = (addressId: string) => {
    navigation.navigate('EditAddress', { addressId });
  };

  const handleDeleteAddress = (addressId: string, addressName: string) => {
    Alert.alert(
      'Excluir endereço',
      `Tem certeza que deseja excluir o endereço "${addressName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              await loadAddresses();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o endereço. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: any }) => (
    <View style={[styles.addressCard, { backgroundColor: paperTheme.colors.surface }]}>
      <TouchableOpacity
        onPress={() => handleEditAddress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.addressHeader}>
          <Text style={[styles.addressName, { color: paperTheme.colors.onSurface }]}>{item.name}</Text>
          <View style={styles.headerActions}>
            {item.isFavorite && (
              <Ionicons name="star" size={20} color="#FFD700" style={styles.favoriteIcon} />
            )}
            <TouchableOpacity
              onPress={() => handleDeleteAddress(item.id, item.name)}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
          {item.street}, {item.number}
        </Text>
        {item.complement && (
          <Text style={[styles.addressText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>{item.complement}</Text>
        )}
        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
          {item.neighborhood}, {item.city} - {item.state}
        </Text>
        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>CEP: {item.zipCode}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>Meus Endereços</Text>
          <Text style={[styles.subtitle, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
            {user ? `Olá, ${user.name.split(' ')[0]}! ` : ''}Gerencie seus endereços de entrega
          </Text>
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline }]}
            onPress={handleUseLocation}
            disabled={loadingLocation || permissions.location.loading}
            activeOpacity={0.7}
          >
            {(loadingLocation || permissions.location.loading) ? (
              <ActivityIndicator size="small" color={paperTheme.colors.primary} />
            ) : (
              <Ionicons name="location" size={20} color={paperTheme.colors.primary} />
            )}
            <Text style={[styles.locationButtonText, { color: paperTheme.colors.onSurface }]}>
              {loadingLocation ? 'Buscando localização...' : permissions.location.loading ? 'Solicitando permissão...' : 'Usar minha localização'}
            </Text>
          </TouchableOpacity>
        </View>

        {addresses.length > 0 ? (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={renderAddressItem}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              addresses.length < 3 ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                    <Ionicons name="add" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={paperTheme.colors.outline} />
            <Text style={[styles.emptyTitle, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>Nenhum endereço cadastrado</Text>
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>
              Adicione um endereço para facilitar suas entregas
            </Text>
            {addresses.length < 3 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                  <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});