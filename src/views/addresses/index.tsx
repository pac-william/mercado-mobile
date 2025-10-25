import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/header';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../App';

type AddressesScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function AddressesScreen() {
  const { state, getUserAddresses } = useAuth();
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      await getUserAddresses();
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
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

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Endereços</Text>
          <Text style={styles.subtitle}>Gerencie seus endereços de entrega</Text>
        </View>

        {state.addresses.length > 0 ? (
          <FlatList
            data={state.addresses}
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

      {state.addresses.length < 3 && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleAddAddress}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = {
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
  floatingButton: {
    position: 'absolute' as any,
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
};

