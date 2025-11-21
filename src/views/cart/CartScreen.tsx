import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import { CartItem, useCart } from '../../contexts/CartContext';
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { getCart, mapCartItemResponseToCartItem, removeCartItem, clearCart as clearCartAPI, updateCartItem } from '../../services/cartService';
import { getMarketById } from '../../services/marketService';


type CartScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { state: cartState, removeItem, updateQuantity, clearCart, addItem } = useCart();
  const { modalState, hideModal, showWarning } = useModal();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Se já carregou uma vez, não recarrega automaticamente
    // Isso evita que itens removidos/limpos voltem
    if (hasLoadedOnce) {
      return;
    }

    try {
      setLoading(true);
      const carts = await getCart();
      
      clearCart();
      
      const getMarketName = async (marketId: string): Promise<string> => {
        try {
          const market = await getMarketById(marketId);
          return market.name;
        } catch (error) {
          console.warn(`Erro ao buscar mercado ${marketId}:`, error);
          return "Mercado";
        }
      };
      
      const allItems = carts.flatMap((cart) => cart.items ?? []);
      const addedIds = new Set<string>();
      
      for (const item of allItems) {
        const cartItem = await mapCartItemResponseToCartItem(item, getMarketName);
        const itemId = String(cartItem.id);
        
        if (!addedIds.has(itemId)) {
          addedIds.add(itemId);
          
          addItem({
            id: itemId,
            name: cartItem.name,
            price: cartItem.price,
            image: cartItem.image,
            marketName: cartItem.marketName,
            marketId: cartItem.marketId,
            cartItemId: cartItem.cartItemId,
          });
          
          if (item.quantity !== 1) {
            updateQuantity(itemId, item.quantity);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!sessionLoading && isAuthenticated && !hasLoadedOnce) {
      loadCart();
    } else if (!sessionLoading && !isAuthenticated) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, isAuthenticated]);



  const handleRemoveItem = async (id: string, name: string) => {
    showWarning(
      'Remover Item',
      `Deseja remover "${name}" do seu carrinho?`,
      {
        text: 'Remover',
        onPress: async () => {
          try {
            // Remove do contexto local primeiro para feedback imediato
            const item = cartState.items.find(i => String(i.id) === String(id));
            
            // Se estiver autenticado e tiver cartItemId, remove da API também
            if (isAuthenticated && item?.cartItemId) {
              try {
                await removeCartItem(item.cartItemId);
              } catch (apiError) {
                console.error("Erro ao remover item da API:", apiError);
                // Continua removendo localmente mesmo se der erro na API
              }
            }
            
            removeItem(id);
            hideModal();
          } catch (error) {
            console.error("Erro ao remover item:", error);
            hideModal();
          }
        },
        style: 'danger',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  const handleClearCart = async () => {
    showWarning(
      'Limpar Carrinho',
      'Deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita.',
      {
        text: 'Limpar Tudo',
        onPress: async () => {
          try {
            if (isAuthenticated) {
              try {
                await clearCartAPI();
              } catch (apiError) {
                console.error("Erro ao limpar carrinho na API:", apiError);
              }
            }
            
            clearCart();
            setHasLoadedOnce(false);
            hideModal();
          } catch (error) {
            console.error("Erro ao limpar carrinho:", error);
            hideModal();
          }
        },
        style: 'danger',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  const groupedByMarket = useMemo(() => {
    const groups: Record<string, { marketId: string; marketName: string; items: CartItem[]; total: number; itemCount: number }> = {};
    
    cartState.items.forEach((item) => {
      const key = item.marketId;
      if (!groups[key]) {
        groups[key] = {
          marketId: item.marketId,
          marketName: item.marketName,
          items: [],
          total: 0,
          itemCount: 0,
        };
      }
      groups[key].items.push(item);
      groups[key].total += item.price * item.quantity;
      groups[key].itemCount += item.quantity;
    });
    
    return Object.values(groups);
  }, [cartState.items]);

  const handleCheckout = (marketId?: string, items?: CartItem[]) => {
    navigation.navigate('Checkout', { marketId, items } as never);
  };

  if (loading || sessionLoading) {
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
            Carregando carrinho...
          </Text>
        </View>
      </View>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
        <Header />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32
        }}>
          <Ionicons name="cart-outline" size={80} color={paperTheme.colors.outline} />
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: paperTheme.colors.onBackground,
            marginTop: 16,
            marginBottom: 8
          }}>
            Carrinho Vazio
          </Text>
          <Text style={{
            fontSize: 16,
            color: paperTheme.colors.onSurface,
            textAlign: 'center',
            lineHeight: 24,
            opacity: 0.7
          }}>
            Adicione alguns produtos ao seu carrinho para começar suas compras
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
        {/* Container principal com flex */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 200, 220),
              paddingTop: 10
            }}
            showsVerticalScrollIndicator={true}
            bounces={true}
            indicatorStyle={paperTheme.dark ? 'white' : 'default'}
          >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: paperTheme.colors.surface,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
              Meu Carrinho ({cartState.itemCount} {cartState.itemCount === 1 ? 'item' : 'itens'})
            </Text>
            <TouchableOpacity
              onPress={handleClearCart}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: '#ffebee',
                borderRadius: 20,
              }}
            >
              <Ionicons name="trash-outline" size={14} color="#d32f2f" />
              <Text style={{ color: '#d32f2f', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          {groupedByMarket.map((group, groupIndex) => (
            <View key={group.marketId} style={{ marginTop: groupIndex > 0 ? 24 : 8 }}>
              <View style={{
                backgroundColor: paperTheme.colors.surface,
                marginHorizontal: 16,
                marginTop: 8,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <Ionicons name="storefront" size={20} color={paperTheme.colors.primary} />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: paperTheme.colors.onSurface,
                    marginLeft: 8,
                  }}>
                    {group.marketName}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: paperTheme.colors.onSurfaceVariant,
                }}>
                  {group.itemCount} {group.itemCount === 1 ? 'item' : 'itens'}
                </Text>
              </View>

              {group.items.map((item) => (
            <View key={item.id} style={{
              backgroundColor: paperTheme.colors.surface,
              marginHorizontal: 16,
              marginTop: 8,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
              overflow: 'hidden',
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: 14,
                paddingBottom: 10,
              }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: 65,
                      height: 65,
                      borderRadius: 10,
                      backgroundColor: '#f5f5f5',
                    }}
                    resizeMode="contain"
                  />

                  <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: paperTheme.colors.onSurface,
                        marginBottom: 3,
                        lineHeight: 20
                      }}>
                        {item.name}
                      </Text>

                      <Text style={{
                        fontSize: 13,
                        color: paperTheme.colors.onSurface,
                        opacity: 0.7,
                        marginBottom: 4
                      }}>
                        {item.marketName}
                      </Text>
                    </View>

                    <Text style={{
                      fontSize: 17,
                      fontWeight: 'bold',
                      color: paperTheme.colors.primary
                    }}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id, item.name)}
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: '#ffebee',
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 6,
                  }}
                >
                  <Ionicons name="close" size={15} color="#d32f2f" />
                </TouchableOpacity>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 14,
                paddingBottom: 10,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: paperTheme.colors.onSurface
                }}>
                  Quantidade
                </Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: paperTheme.colors.surfaceVariant,
                  borderRadius: 30,
                  paddingHorizontal: 5,
                  paddingVertical: 3,
                }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const newQuantity = Math.max(1, item.quantity - 1);
                      updateQuantity(item.id, newQuantity);
                      
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: item.quantity <= 1 ? '#e0e0e0' : '#FF4500',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: item.quantity <= 1 ? 'transparent' : '#FF4500',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: item.quantity <= 1 ? 0 : 3,
                    }}
                    disabled={item.quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={item.quantity <= 1 ? '#999' : 'white'}
                    />
                  </TouchableOpacity>

                  <View style={{
                    minWidth: 40,
                    alignItems: 'center',
                    marginHorizontal: 10,
                  }}>
                    <Text style={{
                      fontSize: 17,
                      fontWeight: 'bold',
                      color: paperTheme.colors.onSurface,
                    }}>
                      {item.quantity}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={async () => {
                      const newQuantity = item.quantity + 1;
                      updateQuantity(item.id, newQuantity);
                      
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#FF4500',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#FF4500',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="add" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingBottom: 14,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: paperTheme.colors.outline,
                backgroundColor: paperTheme.colors.surfaceVariant,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: paperTheme.colors.onSurface
                }}>
                  Subtotal
                </Text>
                <Text style={{
                  fontSize: 17,
                  fontWeight: 'bold',
                  color: paperTheme.colors.primary
                }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
              ))}

              <View style={{
                backgroundColor: paperTheme.colors.surface,
                marginHorizontal: 16,
                marginTop: 12,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: paperTheme.colors.onSurface,
                  }}>
                    Subtotal {group.marketName}
                  </Text>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: paperTheme.colors.primary,
                  }}>
                    R$ {group.total.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('MarketDetails', { marketId: group.marketId })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: paperTheme.colors.outline,
                    backgroundColor: paperTheme.colors.surfaceVariant,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color={paperTheme.colors.primary} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: paperTheme.colors.primary,
                    marginLeft: 8,
                  }}>
                    Adicionar mais produtos
                  </Text>
                </TouchableOpacity>

                <Button
                  mode="contained"
                  onPress={() => handleCheckout(group.marketId, group.items)}
                  style={{
                    borderRadius: 14,
                    minHeight: 46,
                    backgroundColor: paperTheme.colors.primary,
                  }}
                  contentStyle={{
                    paddingVertical: 10,
                    paddingHorizontal: 24,
                  }}
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: paperTheme.colors.onPrimary,
                  }}
                  icon={() => <Ionicons name="card" size={19} color={paperTheme.colors.onPrimary} />}
                >
                  Finalizar Pedido - {group.marketName}
                </Button>
              </View>
            </View>
          ))}

          {groupedByMarket.length > 1 && (
            <View style={{
              backgroundColor: paperTheme.colors.surface,
              marginHorizontal: 16,
              marginTop: 24,
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: paperTheme.colors.onSurface,
                }}>
                  Total Geral
                </Text>
                <Text style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: paperTheme.colors.primary,
                }}>
                  R$ {cartState.total.toFixed(2)}
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: paperTheme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginTop: 8,
              }}>
                Você tem {groupedByMarket.length} {groupedByMarket.length === 1 ? 'pedido' : 'pedidos'} separados
              </Text>
            </View>
          )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Modal customizado */}
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
};

export default CartScreen;