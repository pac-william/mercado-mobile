import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useCart } from '../../contexts/CartContext';
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { getCart, mapCartItemResponseToCartItem, removeCartItem, clearCart as clearCartAPI, updateCartItem } from '../../services/cartService';
import { getMarketById } from '../../services/marketService';


type CartScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { state: cartState, removeItem, updateQuantity, clearCart, addItem } = useCart();
  const { modalState, hideModal, showWarning, showSuccess } = useModal();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
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
      const cartResponse = await getCart();
      
      // Limpa o carrinho local primeiro
      clearCart();
      
      // Função auxiliar para buscar nome do mercado
      const getMarketName = async (marketId: string): Promise<string> => {
        try {
          const market = await getMarketById(marketId);
          return market.name;
        } catch (error) {
          console.warn(`Erro ao buscar mercado ${marketId}:`, error);
          return "Mercado";
        }
      };
      
      // Adiciona os itens do carrinho da API ao contexto
      // Como já limpamos o carrinho, podemos adicionar todos os itens diretamente
      // Usa um Set para evitar duplicações baseadas no ID
      const addedIds = new Set<string>();
      
      for (const item of cartResponse.items) {
        const cartItem = await mapCartItemResponseToCartItem(item, getMarketName);
        const itemId = String(cartItem.id);
        
        // Verifica se já adicionamos este item (evita duplicações na API)
        if (!addedIds.has(itemId)) {
          addedIds.add(itemId);
          
          // Adiciona o item com o cartItemId para sincronização
          addItem({
            id: itemId,
            name: cartItem.name,
            price: cartItem.price,
            image: cartItem.image,
            marketName: cartItem.marketName,
            marketId: cartItem.marketId,
            cartItemId: cartItem.cartItemId, // Preserva o cartItemId
          });
          
          // Atualiza a quantidade para o valor correto da API
          if (item.quantity !== 1) {
            updateQuantity(itemId, item.quantity);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      // Se der erro, continua com o carrinho local
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
            // Se estiver autenticado, limpa na API também
            if (isAuthenticated) {
              try {
                await clearCartAPI();
              } catch (apiError) {
                console.error("Erro ao limpar carrinho na API:", apiError);
                // Continua limpando localmente mesmo se der erro na API
              }
            }
            
            clearCart();
            // Reseta o flag para permitir recarregar na próxima vez que a tela for montada
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

  const handleCheckout = () => {
    // Navega para a tela de checkout
    navigation.navigate('Checkout' as never);
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
              paddingBottom: 10,
              paddingTop: 10
            }}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
          {/* Header do carrinho */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: paperTheme.colors.surface,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
              Meu Carrinho ({cartState.itemCount} {cartState.itemCount === 1 ? 'item' : 'itens'})
            </Text>
            <TouchableOpacity
              onPress={handleClearCart}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#ffebee',
                borderRadius: 20,
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#d32f2f" />
              <Text style={{ color: '#d32f2f', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de itens */}
          {cartState.items.map((item, index) => (
            <View key={item.id} style={{
              backgroundColor: paperTheme.colors.surface,
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
              overflow: 'hidden',
            }}>
              {/* Header do item com botão remover */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: 20,
                paddingBottom: 16,
              }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  {/* Imagem do produto */}
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 16,
                      backgroundColor: '#f5f5f5',
                    }}
                    resizeMode="contain"
                  />

                  {/* Informações do produto */}
                  <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{
                        fontSize: 17,
                        fontWeight: 'bold',
                        color: paperTheme.colors.onSurface,
                        marginBottom: 6,
                        lineHeight: 24
                      }}>
                        {item.name}
                      </Text>

                      <Text style={{
                        fontSize: 14,
                        color: paperTheme.colors.onSurface,
                        opacity: 0.7,
                        marginBottom: 8
                      }}>
                        {item.marketName}
                      </Text>
                    </View>

                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: paperTheme.colors.primary
                    }}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Botão remover */}
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id, item.name)}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#ffebee',
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 12,
                  }}
                >
                  <Ionicons name="close" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>

              {/* Controles de quantidade */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingBottom: 16,
              }}>
                <Text style={{
                  fontSize: 16,
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
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const newQuantity = Math.max(1, item.quantity - 1);
                      updateQuantity(item.id, newQuantity);
                      
                      // Sincroniza com a API se autenticado
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
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
                      size={22}
                      color={item.quantity <= 1 ? '#999' : 'white'}
                    />
                  </TouchableOpacity>

                  <View style={{
                    minWidth: 50,
                    alignItems: 'center',
                    marginHorizontal: 16,
                  }}>
                    <Text style={{
                      fontSize: 20,
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
                      
                      // Sincroniza com a API se autenticado
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
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
                    <Ionicons name="add" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subtotal do item */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: 20,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: paperTheme.colors.outline,
                backgroundColor: paperTheme.colors.surfaceVariant,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: paperTheme.colors.onSurface
                }}>
                  Subtotal
                </Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: paperTheme.colors.primary
                }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          </ScrollView>
        </View>

        {/* Resumo do pedido - fixo na parte inferior */}
        <View style={{
          backgroundColor: paperTheme.colors.surface,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom + 20, 30),
          borderTopWidth: 1,
          borderTopColor: paperTheme.colors.outline,
          shadowColor: '#000',
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
              R$ {cartState.total.toFixed(2)}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleCheckout}
            style={{
              borderRadius: 14,
              minHeight: 56,
              backgroundColor: paperTheme.colors.primary,
            }}
            contentStyle={{
              paddingVertical: 14,
              paddingHorizontal: 24,
            }}
            labelStyle={{ 
              fontSize: 17, 
              fontWeight: 'bold',
              color: paperTheme.colors.onPrimary,
            }}
            icon={() => <Ionicons name="card" size={22} color={paperTheme.colors.onPrimary} />}
          >
            Finalizar Compra
          </Button>
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