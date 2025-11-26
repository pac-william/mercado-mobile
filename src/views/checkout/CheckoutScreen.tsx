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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { CartItem, useCart } from '../../contexts/CartContext';
import { OrderCreateDTO } from '../../domain/orderDomain';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { Address, getUserAddresses } from '../../services/addressService';
import { createOrder } from '../../services/orderService';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from '../../constants/styles';
import { formatCurrency, formatOrderDate } from '../../utils/format';
import Card from '../../components/ui/Card';

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
  const paperTheme = useCustomTheme();
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
      const response = await getUserAddresses(1, 100);
      const addressesList = (response.addresses || [])
        .filter(addr => addr.isActive)
        .map(addr => ({
          ...addr,
          complement: addr.complement ?? undefined
        }));
      setAddresses(addressesList);
      
      if (addressesList.length > 0) {
        setSelectedAddress(prev => {
          if (prev && addressesList.find(addr => addr.id === prev.id)) {
            return prev;
          }
          const favorite = addressesList.find(addr => addr.isFavorite);
          return favorite || addressesList[0];
        });
      } else {
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

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadAddresses();
      }
    }, [isAuthenticated, loadAddresses])
  );

  const handleAddAddress = () => {
    navigation.navigate('AddAddress', {} as any);
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

      const paymentMethodObj = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
      const backendPaymentMethod = paymentMethodObj?.backendValue || selectedPaymentMethod.toUpperCase();

      const orderData: OrderCreateDTO = {
        userId: user?.id || '',
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
        `Pedido #${newOrder.id} criado com sucesso!\n\nTotal: ${formatCurrency(checkoutTotal)}`,
        {
          text: 'Ver Pedidos',
          onPress: () => {
            hideModal();
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
      
      let errorMessage = 'Não foi possível processar seu pedido. Tente novamente.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
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
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : SPACING.xlBase}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + SPACING.jumbo * 4 + SPACING.xlBase, SPACING.jumbo * 4 + SPACING.xlBase) }
          ]}
          showsVerticalScrollIndicator={true}
          indicatorStyle={paperTheme.dark ? 'white' : 'default'}
        >
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
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
                {formatCurrency(checkoutTotal)}
              </Text>
            </View>
            <View style={[styles.totalRow, { borderTopColor: paperTheme.colors.outline }]}>
              <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>
                {formatCurrency(checkoutTotal)}
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
                Endereço de Entrega
              </Text>
              <TouchableOpacity
                onPress={handleAddAddress}
                style={[styles.addButton, { backgroundColor: paperTheme.colors.primary }]}
              >
                <Ionicons name="add" size={ICON_SIZES.lg} color={paperTheme.colors.onPrimary} />
                <Text style={[styles.addButtonText, { color: paperTheme.colors.onPrimary }]}>
                  Novo
                </Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={[styles.emptyAddressContainer, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                <Ionicons name="location-outline" size={SPACING.jumbo} color={paperTheme.colors.outline} />
                <Text style={[styles.emptyAddressTitle, { color: paperTheme.colors.onSurface }]}>
                  Nenhum endereço cadastrado
                </Text>
                <Text style={[styles.emptyAddressText, { color: paperTheme.colors.onSurface }]}>
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
                    style={[
                      styles.addressItem,
                      {
                        borderColor: selectedAddress?.id === address.id
                          ? paperTheme.colors.primary
                          : paperTheme.colors.outline,
                        backgroundColor: selectedAddress?.id === address.id
                          ? paperTheme.colors.primaryContainer
                          : paperTheme.colors.surfaceVariant,
                      }
                    ]}
                  >
                    <View style={styles.addressItemContent}>
                      <View style={styles.addressItemInfo}>
                        <View style={styles.addressItemHeader}>
                          <Text style={[styles.addressName, { color: paperTheme.colors.onSurface }]}>
                            {address.name}
                          </Text>
                          {address.isFavorite && (
                            <Ionicons name="star" size={ICON_SIZES.lg} color={paperTheme.colors.favoriteIcon} style={styles.favoriteIcon} />
                          )}
                        </View>
                        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface }]}>
                          {address.street}, {address.number}
                        </Text>
                        {address.complement && (
                          <Text style={[styles.addressText, { color: paperTheme.colors.onSurface }]}>
                            {address.complement}
                          </Text>
                        )}
                        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface }]}>
                          {address.neighborhood}, {address.city} - {address.state}
                        </Text>
                        <Text style={[styles.addressText, { color: paperTheme.colors.onSurface }]}>
                          CEP: {address.zipCode}
                        </Text>
                      </View>
                      {selectedAddress?.id === address.id && (
                        <Ionicons name="checkmark-circle" size={ICON_SIZES.xl} color={paperTheme.colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
              Forma de Pagamento
            </Text>

            <View>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => handleSelectPaymentMethod(method.id)}
                  style={[
                    styles.paymentMethodItem,
                    {
                      borderColor: selectedPaymentMethod === method.id
                        ? paperTheme.colors.primary
                        : paperTheme.colors.outline,
                      backgroundColor: selectedPaymentMethod === method.id
                        ? paperTheme.colors.primaryContainer
                        : paperTheme.colors.surfaceVariant,
                    }
                  ]}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={ICON_SIZES.xl}
                    color={selectedPaymentMethod === method.id
                      ? paperTheme.colors.primary
                      : paperTheme.colors.onSurfaceVariant}
                    style={styles.paymentMethodIcon}
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    { color: paperTheme.colors.onSurface },
                    selectedPaymentMethod === method.id && styles.paymentMethodTextSelected
                  ]}>
                    {method.name}
                  </Text>
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={ICON_SIZES.xl} color={paperTheme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </ScrollView>

        <View style={[
          styles.footer,
          {
            backgroundColor: paperTheme.colors.surface,
            borderTopColor: paperTheme.colors.outline,
            shadowColor: paperTheme.colors.modalShadow,
            paddingBottom: Math.max(insets.bottom + SPACING.xxxl * 2, SPACING.jumbo * 2 + SPACING.xlBase),
          }
        ]}>
          <View style={styles.footerTotalRow}>
            <Text style={[styles.footerTotalLabel, { color: paperTheme.colors.onSurface }]}>
              Total
            </Text>
            <Text style={[styles.footerTotalValue, { color: paperTheme.colors.primary }]}>
              {formatCurrency(checkoutTotal)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.smPlus,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xlBase,
    ...SHADOWS.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xsPlus,
    borderRadius: BORDER_RADIUS.xl,
  },
  addButtonText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyAddressContainer: {
    padding: SPACING.xlBase,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyAddressTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptyAddressText: {
    fontSize: FONT_SIZE.md,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addressItem: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  addressItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  addressItemInfo: {
    flex: 1,
  },
  addressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  favoriteIcon: {
    marginLeft: SPACING.xs,
  },
  addressText: {
    fontSize: FONT_SIZE.md,
    opacity: 0.7,
    marginBottom: SPACING.micro,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  paymentMethodIcon: {
    marginRight: SPACING.md,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '400',
  },
  paymentMethodTextSelected: {
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.xlBase,
    paddingTop: SPACING.xlBase,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: SPACING.xs,
    elevation: 8,
  },
  footerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  footerTotalLabel: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: '600',
  },
  footerTotalValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
});