import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import Button from '../../components/ui/Button';
import { CartItem, useCart } from '../../contexts/CartContext';
import { OrderCreateDTO } from '../../domain/orderDomain';
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { Address, getUserAddresses } from '../../services/addressService';
import { createOrder } from '../../services/orderService';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
type CheckoutScreenRouteProp = RouteProp<HomeStackParamList, 'Checkout'>;

const PAYMENT_METHODS = [
  { id: 'credit_card', backendValue: 'CREDIT_CARD', name: 'Cartão de Crédito', icon: 'card' },
  { id: 'debit_card', backendValue: 'DEBIT_CARD', name: 'Cartão de Débito', icon: 'card-outline' },
  { id: 'pix', backendValue: 'PIX', name: 'PIX', icon: 'flash' },
  { id: 'cash', backendValue: 'CASH', name: 'Dinheiro', icon: 'cash' },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const route = useRoute<CheckoutScreenRouteProp>();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { state: cartState, clearCart, removeItem } = useCart();
  const { modalState, hideModal, showSuccess, showWarning } = useModal();
  const { user, isAuthenticated } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const checkoutItems = useMemo(() => {
    const routeItems = route.params?.items;
    const routeMarketId = route.params?.marketId;
    
    if (routeItems && routeItems.length > 0) {
      return routeItems;
    }
    
    if (routeMarketId) {
      return cartState.items.filter(item => item.marketId === routeMarketId);
    }
    
    return cartState.items;
  }, [route.params, cartState.items]);

  const checkoutTotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [checkoutItems]);

  const checkoutItemCount = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [checkoutItems]);

  const checkoutMarketId = useMemo(() => {
    return route.params?.marketId || checkoutItems[0]?.marketId || '';
  }, [route.params, checkoutItems]);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      // Usa getUserAddresses como no AddressesScreen, mas filtra apenas os ativos
      const response = await getUserAddresses(1, 100);
      // Converter null para undefined para compatibilidade de tipos (como no AddressesScreen)
      const addressesList = (response.addresses || [])
        .filter(addr => addr.isActive) // Filtra apenas endereços ativos
        .map(addr => ({
          ...addr,
          complement: addr.complement ?? undefined
        }));
      setAddresses(addressesList);
      
      // Se tiver endereços e nenhum selecionado, seleciona o favorito ou o primeiro
      if (addressesList.length > 0) {
        setSelectedAddress(prev => {
          // Se já tem um selecionado e ele ainda existe na lista, mantém
          if (prev && addressesList.find(addr => addr.id === prev.id)) {
            return prev;
          }
          // Caso contrário, seleciona o favorito ou o primeiro
          const favorite = addressesList.find(addr => addr.isFavorite);
          return favorite || addressesList[0];
        });
      } else {
        // Se não tiver endereços, limpa a seleção
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Recarrega endereços quando a tela ganha foco (ex: quando volta de adicionar endereço)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadAddresses();
      }
    }, [isAuthenticated, loadAddresses])
  );

  const handleAddAddress = () => {
    navigation.navigate('AddAddress', {
      // O callback será chamado no AddEditAddressScreen
      // e os endereços serão recarregados via useFocusEffect
    } as any);
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleFinalizeOrder = async () => {
    if (!selectedAddress) {
      showWarning(
        'Endereço necessário',
        'Por favor, selecione ou cadastre um endereço de entrega.',
        {
          text: 'OK',
          onPress: hideModal,
        }
      );
      return;
    }

    if (!selectedPaymentMethod) {
      showWarning(
        'Forma de pagamento necessária',
        'Por favor, selecione uma forma de pagamento.',
        {
          text: 'OK',
          onPress: hideModal,
        }
      );
      return;
    }

    try {
      setCreatingOrder(true);

      // Converte o paymentMethod para o formato esperado pelo backend
      const paymentMethodObj = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
      const backendPaymentMethod = paymentMethodObj?.backendValue || selectedPaymentMethod.toUpperCase();

      const orderData: OrderCreateDTO = {
        userId: user?.sub || '',
        marketId: checkoutMarketId,
        items: checkoutItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        addressId: selectedAddress.id,
        paymentMethod: backendPaymentMethod,
      };

      const newOrder = await createOrder(orderData);

      checkoutItems.forEach(item => {
        removeItem(item.id);
      });

      showSuccess(
        'Compra Finalizada! 🎉',
        `Pedido #${newOrder.id} criado com sucesso!\n\nTotal: R$ ${checkoutTotal.toFixed(2)}`,
        {
          text: 'Ver Pedidos',
          onPress: () => {
            hideModal();
            // Navega para a tela de pedidos (pode estar em SettingsStack)
            navigation.getParent()?.navigate('SettingsStack', { screen: 'Orders' } as any);
          },
          style: 'success',
        },
        {
          text: 'Continuar Comprando',
          onPress: () => {
            hideModal();
            navigation.goBack();
          },
        }
      );
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Extrai mensagem de erro mais detalhada
      let errorMessage = 'Não foi possível processar seu pedido. Tente novamente.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Se for erro de validação do Zod, mostra os erros específicos
        if (errorData.issues && Array.isArray(errorData.issues)) {
          const validationErrors = errorData.issues.map((issue: any) => {
            const path = issue.path?.join('.') || 'campo';
            return `${path}: ${issue.message}`;
          }).join('\n');
          errorMessage = `Erro de validação:\n${validationErrors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showWarning(
        'Erro ao finalizar',
        errorMessage,
        {
          text: 'OK',
          onPress: hideModal,
        }
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
        <Header />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={{
            marginTop: 16,
            fontSize: 16,
            color: paperTheme.colors.onSurface,
            opacity: 0.7
          }}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 200, 220),
            paddingTop: 10
          }}
          showsVerticalScrollIndicator={true}
          indicatorStyle={paperTheme.dark ? 'white' : 'default'}
        >
          {/* Resumo do Pedido */}
          <View style={{
            backgroundColor: paperTheme.colors.surface,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: paperTheme.colors.modalShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: paperTheme.colors.onSurface,
              marginBottom: 16
            }}>
              Resumo do Pedido
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8
            }}>
              <Text style={{ color: paperTheme.colors.onSurface, opacity: 0.7 }}>
                Subtotal ({checkoutItemCount} {checkoutItemCount === 1 ? 'item' : 'itens'})
              </Text>
              <Text style={{ color: paperTheme.colors.onSurface, fontWeight: '600' }}>
                R$ {checkoutTotal.toFixed(2)}
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: paperTheme.colors.outline
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: paperTheme.colors.onSurface
              }}>
                Total
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: paperTheme.colors.primary
              }}>
                R$ {checkoutTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Seleção de Endereço */}
          <View style={{
            backgroundColor: paperTheme.colors.surface,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: paperTheme.colors.modalShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: paperTheme.colors.onSurface
              }}>
                Endereço de Entrega
              </Text>
              <TouchableOpacity
                onPress={handleAddAddress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: paperTheme.colors.primary,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="add" size={18} color={paperTheme.colors.onPrimary} />
                <Text style={{ color: paperTheme.colors.onPrimary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                  Novo
                </Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={{
                padding: 20,
                alignItems: 'center',
                backgroundColor: paperTheme.colors.surfaceVariant,
                borderRadius: 12,
              }}>
                <Ionicons name="location-outline" size={48} color={paperTheme.colors.outline} />
                <Text style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: '600',
                  color: paperTheme.colors.onSurface,
                  marginBottom: 8
                }}>
                  Nenhum endereço cadastrado
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: paperTheme.colors.onSurface,
                  opacity: 0.7,
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  Cadastre um endereço para continuar com a compra
                </Text>
                <Button
                  title="Cadastrar Endereço"
                  onPress={handleAddAddress}
                  variant="primary"
                  size="medium"
                  fullWidth
                />
              </View>
            ) : (
              <View>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    onPress={() => handleSelectAddress(address)}
                    style={{
                      borderWidth: 2,
                      borderColor: selectedAddress?.id === address.id
                        ? paperTheme.colors.primary
                        : paperTheme.colors.outline,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      backgroundColor: selectedAddress?.id === address.id
                        ? paperTheme.colors.primaryContainer
                        : paperTheme.colors.surfaceVariant,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8
                    }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: paperTheme.colors.onSurface
                          }}>
                            {address.name}
                          </Text>
                          {address.isFavorite && (
                            <Ionicons name="star" size={16} color={paperTheme.colors.favoriteIcon} style={{ marginLeft: 8 }} />
                          )}
                        </View>
                        <Text style={{
                          fontSize: 14,
                          color: paperTheme.colors.onSurface,
                          opacity: 0.7,
                          marginBottom: 2
                        }}>
                          {address.street}, {address.number}
                        </Text>
                        {address.complement && (
                          <Text style={{
                            fontSize: 14,
                            color: paperTheme.colors.onSurface,
                            opacity: 0.7,
                            marginBottom: 2
                          }}>
                            {address.complement}
                          </Text>
                        )}
                        <Text style={{
                          fontSize: 14,
                          color: paperTheme.colors.onSurface,
                          opacity: 0.7,
                          marginBottom: 2
                        }}>
                          {address.neighborhood}, {address.city} - {address.state}
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: paperTheme.colors.onSurface,
                          opacity: 0.7
                        }}>
                          CEP: {address.zipCode}
                        </Text>
                      </View>
                      {selectedAddress?.id === address.id && (
                        <Ionicons name="checkmark-circle" size={24} color={paperTheme.colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Seleção de Forma de Pagamento */}
          <View style={{
            backgroundColor: paperTheme.colors.surface,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: paperTheme.colors.modalShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: paperTheme.colors.onSurface,
              marginBottom: 16
            }}>
              Forma de Pagamento
            </Text>

            <View>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => handleSelectPaymentMethod(method.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: selectedPaymentMethod === method.id
                      ? paperTheme.colors.primary
                      : paperTheme.colors.outline,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: selectedPaymentMethod === method.id
                      ? paperTheme.colors.primaryContainer
                      : paperTheme.colors.surfaceVariant,
                  }}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={selectedPaymentMethod === method.id
                      ? paperTheme.colors.primary
                      : paperTheme.colors.onSurfaceVariant}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: selectedPaymentMethod === method.id ? '600' : '400',
                    color: paperTheme.colors.onSurface
                  }}>
                    {method.name}
                  </Text>
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color={paperTheme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Botão Finalizar */}
        <View style={{
          backgroundColor: paperTheme.colors.surface,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom + 80, 100),
          borderTopWidth: 1,
          borderTopColor: paperTheme.colors.outline,
          shadowColor: paperTheme.colors.modalShadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: paperTheme.colors.onSurface,
            }}>
              Total
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: paperTheme.colors.primary
            }}>
              R$ {checkoutTotal.toFixed(2)}
            </Text>
          </View>
          
          <Button
            title={creatingOrder ? 'Finalizando...' : 'Finalizar Pedido'}
            onPress={handleFinalizeOrder}
            variant="primary"
            size="large"
            icon={{
              name: "checkmark-circle",
              position: "left",
            }}
            loading={creatingOrder}
            disabled={creatingOrder || !selectedAddress || !selectedPaymentMethod}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        primaryButton={modalState.primaryButton}
        secondaryButton={modalState.secondaryButton}
      />
    </View>
  );
}