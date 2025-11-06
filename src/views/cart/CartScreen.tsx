import { Ionicons } from '@expo/vector-icons';
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
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import { useCart } from '../../contexts/CartContext';
import { OrderCreateDTO } from "../../domain/orderDomain";
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { getCart, mapCartItemResponseToCartItem } from '../../services/cartService';
import { getMarketById } from '../../services/marketService';
import { createOrder } from '../../services/orderService';


const CartScreen: React.FC = () => {
  const { state: cartState, removeItem, updateQuantity, clearCart, addItem } = useCart();
  const { modalState, hideModal, showWarning, showSuccess } = useModal();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
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
      for (const item of cartResponse.items) {
        const cartItem = await mapCartItemResponseToCartItem(item, getMarketName);
        // Adiciona o item uma vez (o contexto inicializa com quantidade 1)
        addItem({
          id: cartItem.id,
          name: cartItem.name,
          price: cartItem.price,
          image: cartItem.image,
          marketName: cartItem.marketName,
          marketId: cartItem.marketId,
        });
        // Atualiza a quantidade para o valor correto da API
        if (item.quantity !== 1) {
          updateQuantity(cartItem.id, item.quantity);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      // Se der erro, continua com o carrinho local
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, clearCart, addItem, updateQuantity]);

  useEffect(() => {
    if (!sessionLoading) {
      loadCart();
    }
  }, [sessionLoading, isAuthenticated, loadCart]);



  const handleRemoveItem = (id: string, name: string) => {
    showWarning(
      'Remover Item',
      `Deseja remover "${name}" do seu carrinho?`,
      {
        text: 'Remover',
        onPress: () => {
          removeItem(id);
          hideModal();
        },
        style: 'danger',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  const handleClearCart = () => {
    showWarning(
      'Limpar Carrinho',
      'Deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita.',
      {
        text: 'Limpar Tudo',
        onPress: () => {
          clearCart();
          hideModal();
        },
        style: 'danger',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  const handleCheckout = async () => {
    showSuccess(
      'Finalizar Compra',
      `Total: R$ ${cartState.total.toFixed(2)}\n\nDeseja finalizar sua compra?`,
      {
        text: 'Finalizar Compra',
        onPress: async () => {
          try {
            hideModal();

            const orderData: OrderCreateDTO = {
              userId: user?.sub || "", 
              marketId: cartState.items[0]?.marketId || "",
              items: cartState.items.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
            };
            
            const newOrder = await createOrder(orderData);

            clearCart();

            showSuccess(
              'Compra Finalizada!',
              `Pedido #${newOrder.id} criado com sucesso!`,
              {
                text: 'Continuar Comprando',
                onPress: hideModal,
                style: 'success',
              }
            );
          } catch (error) {
            console.error('Erro ao criar pedido:', error);
            showWarning(
              'Erro ao finalizar',
              'Não foi possível processar seu pedido. Tente novamente.',
              {
                text: 'OK',
                onPress: hideModal,
              }
            );
          }
        },
        style: 'success',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
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
                    onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
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
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
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
          paddingBottom: Math.max(insets.bottom + 10, 20),
          borderTopWidth: 1,
          borderTopColor: paperTheme.colors.outline,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
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
              borderRadius: 16,
              minHeight: 56,
              backgroundColor: paperTheme.colors.primary,
            }}
            contentStyle={{
              paddingVertical: 12,
            }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
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