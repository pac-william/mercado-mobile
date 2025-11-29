import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { usePermissions } from '../../hooks/usePermissions';
import { useSession } from '../../hooks/useSession';
import { formatCEP } from '../../services/cepService';
import { Address, deleteAddress, getUserAddresses } from '../../services/addressService';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from '../../constants/styles';

type AddressesScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function AddressesScreen() {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const paperTheme = useCustomTheme();
  const { user, refreshSession } = useSession();
  const permissions = usePermissions();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await getUserAddresses(1, 100);
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
    <View style={[styles.addressCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
      <TouchableOpacity
        onPress={() => handleEditAddress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.addressHeader}>
          <Text style={[styles.addressName, { color: paperTheme.colors.onSurface }]}>{item.name}</Text>
          <View style={styles.headerActions}>
            {item.isFavorite && (
              <Ionicons name="star" size={ICON_SIZES.lg} color={paperTheme.colors.favoriteIcon} style={styles.favoriteIcon} />
            )}
            <TouchableOpacity
              onPress={() => handleDeleteAddress(item.id, item.name)}
              style={styles.deleteButton}
              hitSlop={{ top: SPACING.smPlus, bottom: SPACING.smPlus, left: SPACING.smPlus, right: SPACING.smPlus }}
            >
              <Ionicons name="trash-outline" size={ICON_SIZES.lg} color={paperTheme.colors.errorText} />
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
      <ScreenHeader title="Meus Endereços" icon="location" />

      <View style={styles.content}>
        <View style={styles.header}>
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
              <Ionicons name="location" size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
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
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              addresses.length < 3 ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: paperTheme.colors.buttonPrimary, shadowColor: paperTheme.colors.modalShadow }]} onPress={handleAddAddress}>
                    <Ionicons name="add" size={ICON_SIZES.xl + SPACING.xsPlus} color={paperTheme.colors.white} />
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={SPACING.xxxl * 2} color={paperTheme.colors.outline} />
            <Text style={[styles.emptyTitle, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>Nenhum endereço cadastrado</Text>
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>
              Adicione um endereço para facilitar suas entregas
            </Text>
            {addresses.length < 3 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: paperTheme.colors.buttonPrimary, shadowColor: paperTheme.colors.modalShadow }]} onPress={handleAddAddress}>
                  <Ionicons name="add" size={ICON_SIZES.xl + SPACING.xsPlus} color={paperTheme.colors.white} />
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
    marginBottom: SPACING.md,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  locationButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  addressCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.large,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressName: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    marginRight: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  addressText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.micro,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: SPACING.xlBase,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.lg,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xlBase,
    alignItems: 'flex-end',
  },
  addButton: {
    width: SPACING.xxxl + SPACING.xlBase,
    height: SPACING.xxxl + SPACING.xlBase,
    borderRadius: BORDER_RADIUS.xxl + SPACING.xsPlus,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});