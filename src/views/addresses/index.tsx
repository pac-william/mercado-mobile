import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import { useSession } from '../../hooks/useSession';
import { Address, getUserAddresses } from '../../services/addressService';

type AddressesScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function AddressesScreen() {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const { user, refreshSession } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleEditAddress = (addressId: string) => {
    navigation.navigate('EditAddress', { addressId });
  };

  const renderAddressItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.addressCard}
      onPress={() => handleEditAddress(item.id)}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.name}</Text>
        {item.isFavorite && (
          <Ionicons name="star" size={20} color="#FFD700" />
        )}
      </View>
      <Text style={styles.addressText}>
        {item.street}, {item.number}
      </Text>
      {item.complement && (
        <Text style={styles.addressText}>{item.complement}</Text>
      )}
      <Text style={styles.addressText}>
        {item.neighborhood}, {item.city} - {item.state}
      </Text>
      <Text style={styles.addressText}>CEP: {item.zipCode}</Text>
    </TouchableOpacity>
  );

  // Mostra mensagem se não estiver autenticado
  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Endereços</Text>
          <Text style={styles.subtitle}>
            {user ? `Olá, ${user.name.split(' ')[0]}! ` : ''}Gerencie seus endereços de entrega
          </Text>
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
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione um endereço para facilitar suas entregas
            </Text>
          </View>
        )}
      </View>

      {addresses.length < 3 && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleAddAddress}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
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
  listContent: {
    paddingHorizontal: 16,
  },
  addressCard: {
    backgroundColor: 'white',
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
    color: '#1a1a1a',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
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
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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

