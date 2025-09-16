import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import { useModal } from '../../hooks/useModal';

const CartScreen: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { modalState, hideModal, showWarning, showSuccess } = useModal();

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

  const handleCheckout = () => {
    showSuccess(
      'Finalizar Compra',
      `Total: R$ ${state.total.toFixed(2)}\n\nDeseja finalizar sua compra?`,
      {
        text: 'Finalizar Compra',
        onPress: () => {
          clearCart();
          hideModal();
          showSuccess(
            'Compra Finalizada!',
            'Sua compra foi processada com sucesso! Obrigado por escolher nossos produtos.',
            {
              text: 'Continuar Comprando',
              onPress: hideModal,
              style: 'success',
            }
          );
        },
        style: 'success',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  if (state.items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <Header />
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: 32
        }}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#666',
            marginTop: 16,
            marginBottom: 8
          }}>
            Carrinho Vazio
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: '#999',
            textAlign: 'center',
            lineHeight: 24
          }}>
            Adicione alguns produtos ao seu carrinho para começar suas compras
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header />
      
      {/* Container principal com flex */}
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingBottom: 20,
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
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }}>
              Meu Carrinho ({state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'})
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
        {state.items.map((item, index) => (
          <View key={item.id} style={{
            backgroundColor: 'white',
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
                      color: '#1a1a1a',
                      marginBottom: 6,
                      lineHeight: 24
                    }}>
                      {item.name}
                    </Text>
                    
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#666',
                      marginBottom: 8
                    }}>
                      {item.marketName}
                    </Text>
                  </View>

                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: 'bold', 
                    color: '#2e7d32'
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
                color: '#1a1a1a' 
              }}>
                Quantidade
              </Text>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
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
                    color: '#1a1a1a',
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
              borderTopColor: '#f0f0f0',
              backgroundColor: '#fafafa',
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: '#1a1a1a' 
              }}>
                Subtotal
              </Text>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: '#2e7d32'
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
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40, // Aumentado para garantir visibilidade
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }}>
            Total
          </Text>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#2e7d32'
          }}>
            R$ {state.total.toFixed(2)}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleCheckout}
          style={{
            borderRadius: 16,
            paddingVertical: 8,
            backgroundColor: '#FF4500',
            shadowColor: '#FF4500',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          icon={() => <Ionicons name="card" size={20} color="white" />}
        >
          Finalizar Compra
        </Button>
      </View>

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
    </SafeAreaView>
  );
};

export default CartScreen;
