import React from "react";
import { View, Image, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { useCart } from "../../contexts/CartContext";
import CustomModal from "../../components/ui/CustomModal";
import { useModal } from "../../hooks/useModal";
import { Ionicons } from "@expo/vector-icons";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;

interface Props {
  route: ProductDetailRouteProp;
}

const { width } = Dimensions.get('window');

export default function ProductDetail({ route }: Props) {
  const { product } = route.params;
  const { addItem } = useCart();
  const { modalState, hideModal, showSuccess } = useModal();
  const navigation = useNavigation();

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      marketName: product.marketName,
    });
    
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: 100, // Espaço para a barra de navegação
          paddingTop: 10 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagem do produto com gradiente */}
        <View style={{
          height: 320,
          backgroundColor: '#fff',
          marginHorizontal: 16,
          marginTop: 10,
          borderRadius: 24,
          shadowColor: '#000',
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
          
          {/* Badge de desconto (opcional) */}
          <View style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#FF6B6B',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
              -20%
            </Text>
          </View>
        </View>

        {/* Informações do produto */}
        <View style={{ 
          backgroundColor: 'white', 
          marginHorizontal: 16,
          marginTop: 20,
          borderRadius: 24, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
          padding: 24,
        }}>
          {/* Nome do produto */}
          <Text
            variant="headlineSmall"
            style={{ 
              fontWeight: "bold", 
              marginBottom: 12,
              color: '#1a1a1a',
              lineHeight: 28
            }}
          >
            {product.name}
          </Text>

          {/* Preço */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text
              variant="headlineMedium"
              style={{
                fontWeight: "bold",
                color: "#2e7d32",
                fontSize: 28,
                marginRight: 12
              }}
            >
              R$ {product.price.toFixed(2)}
            </Text>
            <Text
              style={{
                color: "#666",
                fontSize: 16,
                textDecorationLine: 'line-through'
              }}
            >
              R$ {(product.price * 1.25).toFixed(2)}
            </Text>
          </View>

          <Divider style={{ marginVertical: 16, backgroundColor: '#e0e0e0' }} />

          {/* Informações do mercado */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 20,
            backgroundColor: '#f8f9fa',
            padding: 16,
            borderRadius: 16
          }}>
            <Ionicons name="storefront-outline" size={24} color="#0891B2" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
                Disponível em:
              </Text>
              <Text style={{ fontWeight: "600", color: "#000", fontSize: 16 }}>
                {product.marketName}
              </Text>
            </View>
          </View>

          {/* Avaliação (placeholder) */}
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
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={{ color: "#666", fontSize: 14 }}>
              (4.8) • 127 avaliações
            </Text>
          </View>

          {/* Botão de adicionar ao carrinho */}
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={{ 
              borderRadius: 16, 
              paddingVertical: 8,
              backgroundColor: '#FF4500',
              shadowColor: '#FF4500',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            icon={() => <Ionicons name="cart" size={20} color="white" />}
          >
            Adicionar ao Carrinho
          </Button>
        </View>

        {/* Seção de detalhes adicionais */}
        <View style={{ 
          backgroundColor: 'white', 
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 24, 
          shadowColor: '#000',
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
            color: '#1a1a1a'
          }}>
            Detalhes do Produto
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
              Categoria
            </Text>
            <Text style={{ fontWeight: '600', color: '#000' }}>
              Alimentos
            </Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
              Peso/Volume
            </Text>
            <Text style={{ fontWeight: '600', color: '#000' }}>
              500g
            </Text>
          </View>
          
          <View>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
              Validade
            </Text>
            <Text style={{ fontWeight: '600', color: '#000' }}>
              30 dias
            </Text>
          </View>
        </View>
      </ScrollView>

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
}
