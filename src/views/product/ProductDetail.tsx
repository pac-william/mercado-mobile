import React, { useState } from "react";
import { View, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { useCart } from "../../contexts/CartContext";
import CustomModal from "../../components/ui/CustomModal";
import { useModal } from "../../hooks/useModal";
import { useSession } from "../../hooks/useSession";
import { addItemToCart } from "../../services/cartService";
import { Ionicons } from "@expo/vector-icons";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;

interface Props {
  route: ProductDetailRouteProp;
}

const { width } = Dimensions.get('window');

export default function ProductDetail({ route }: Props) {
  const { product } = route.params;
  const { addItem } = useCart();
  const { modalState, hideModal, showSuccess, showWarning } = useModal();
  const { isAuthenticated } = useSession();
  const navigation = useNavigation();
  const paperTheme = useTheme();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return; // Previne múltiplas chamadas
    
    try {
      setIsAdding(true);

      if (isAuthenticated) {
        try {
          const cartResponse = await addItemToCart({
            productId: product.id,
            quantity: 1,
          });
          
          const addedItem = cartResponse.items.find(item => 
            item.productId === product.id
          );
          
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            marketName: product.marketName,
            marketId: product.marketId,
            cartItemId: addedItem?.id,
          });
        } catch (apiError: any) {
          console.error("Erro ao adicionar item ao carrinho na API:", apiError);
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            marketName: product.marketName,
            marketId: product.marketId,
          });
          
          showWarning(
            'Aviso',
            'O produto foi adicionado ao carrinho localmente, mas houve um problema ao sincronizar com o servidor.',
            {
              text: 'OK',
              onPress: hideModal,
            }
          );
          return;
        }
      } else {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          marketName: product.marketName,
          marketId: product.marketId,
        });
      }
      
      showSuccess(
        'Produto Adicionado! 🎉',
        `${product.name} foi adicionado ao seu carrinho com sucesso!`,
        {
          text: 'Ver Carrinho',
          onPress: () => {
            hideModal();
            navigation.navigate('Cart' as never);
          },
          style: 'success',
        },
        {
          text: 'Continuar Comprando',
          onPress: hideModal,
        }
      );
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      showWarning(
        'Erro',
        'Não foi possível adicionar o produto ao carrinho. Tente novamente.',
        {
          text: 'OK',
          onPress: hideModal,
        }
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <Header />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: 100, 
          paddingTop: 10 
        }}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        
        <View style={{
          height: 320,
          backgroundColor: paperTheme.colors.surface,
          marginHorizontal: 16,
          marginTop: 10,
          borderRadius: 24,
          shadowColor: paperTheme.colors.modalShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
          overflow: 'hidden'
        }}>
          <Image
            source={{ uri: product.image }}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
            }}
          />
          
          <View style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: paperTheme.colors.discountBadge,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <Text style={{ color: paperTheme.colors.white, fontWeight: 'bold', fontSize: 12 }}>
              -20%
            </Text>
          </View>
        </View>

        <View style={{ 
          backgroundColor: paperTheme.colors.surface, 
          marginHorizontal: 16,
          marginTop: 20,
          borderRadius: 24, 
          shadowColor: paperTheme.colors.modalShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
          padding: 24,
        }}>
          <Text
            variant="headlineSmall"
            style={{ 
              fontWeight: "bold", 
              marginBottom: 12,
              color: paperTheme.colors.onSurface,
              lineHeight: 28
            }}
          >
            {product.name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text
              variant="headlineMedium"
              style={{
                fontWeight: "bold",
                color: paperTheme.colors.primary,
                fontSize: 28,
                marginRight: 12
              }}
            >
              R$ {product.price.toFixed(2)}
            </Text>
            <Text
              style={{
                color: paperTheme.colors.onSurfaceVariant,
                fontSize: 16,
                textDecorationLine: 'line-through'
              }}
            >
              R$ {(product.price * 1.25).toFixed(2)}
            </Text>
          </View>

          <Divider style={{ marginVertical: 16, backgroundColor: paperTheme.colors.outline }} />

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 20,
            backgroundColor: paperTheme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 16
          }}>
            <Ionicons name="storefront-outline" size={24} color={paperTheme.colors.tertiary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 14, marginBottom: 4 }}>
                Disponível em:
              </Text>
              <Text style={{ fontWeight: "600", color: paperTheme.colors.onSurface, fontSize: 16 }}>
                {product.marketName}
              </Text>
            </View>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 24 
          }}>
            <View style={{ flexDirection: 'row', marginRight: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name="star" 
                  size={20} 
                  color={paperTheme.colors.favoriteIcon} 
                />
              ))}
            </View>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 14 }}>
              (4.8) • 127 avaliações
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleAddToCart}
            disabled={isAdding}
            loading={isAdding}
            style={{ 
              borderRadius: 16, 
              paddingVertical: 8,
              backgroundColor: paperTheme.colors.primary,
              shadowColor: paperTheme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            icon={() => <Ionicons name="cart" size={20} color={paperTheme.colors.onPrimary} />}
          >
            {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
          </Button>
        </View>

        <View style={{ 
          backgroundColor: paperTheme.colors.surface, 
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 24, 
          shadowColor: paperTheme.colors.modalShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
          padding: 24,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 16,
            color: paperTheme.colors.onSurface
          }}>
            Detalhes do Produto
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 14, marginBottom: 4 }}>
              Categoria
            </Text>
            <Text style={{ fontWeight: '600', color: paperTheme.colors.onSurface }}>
              Alimentos
            </Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 14, marginBottom: 4 }}>
              Peso/Volume
            </Text>
            <Text style={{ fontWeight: '600', color: paperTheme.colors.onSurface }}>
              500g
            </Text>
          </View>
          
          <View>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 14, marginBottom: 4 }}>
              Validade
            </Text>
            <Text style={{ fontWeight: '600', color: paperTheme.colors.onSurface }}>
              30 dias
            </Text>
          </View>
        </View>
      </ScrollView>

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