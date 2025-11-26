import React, { useState } from "react";
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { useCart } from "../../contexts/CartContext";
import CustomModal from "../../components/ui/CustomModal";
import { useModal } from "../../hooks/useModal";
import { useSession } from "../../hooks/useSession";
import { addItemToCart } from "../../services/cartService";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../../utils/format";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";

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
  const paperTheme = useCustomTheme();
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
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        <View style={[styles.imageContainer, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
          />
          
          <View style={[styles.discountBadge, { backgroundColor: paperTheme.colors.discountBadge }]}>
            <Text style={[styles.discountText, { color: paperTheme.colors.white }]}>
              -20%
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <Text
            variant="headlineSmall"
            style={[styles.productName, { color: paperTheme.colors.onSurface }]}
          >
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <Text
              variant="headlineMedium"
              style={[styles.price, { color: paperTheme.colors.primary }]}
            >
              {formatCurrency(product.price)}
            </Text>
            <Text style={[styles.oldPrice, { color: paperTheme.colors.onSurfaceVariant }]}>
              {formatCurrency(product.price * 1.25)}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.outline }]} />

          <View style={[styles.marketInfo, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
            <Ionicons name="storefront-outline" size={ICON_SIZES.xl} color={paperTheme.colors.tertiary} />
            <View style={styles.marketInfoText}>
              <Text style={[styles.marketInfoLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                Disponível em:
              </Text>
              <Text style={[styles.marketInfoValue, { color: paperTheme.colors.onSurface }]}>
                {product.marketName}
              </Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name="star" 
                  size={ICON_SIZES.lg} 
                  color={paperTheme.colors.favoriteIcon} 
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: paperTheme.colors.onSurfaceVariant }]}>
              (4.8) • 127 avaliações
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleAddToCart}
            disabled={isAdding}
            loading={isAdding}
            style={[styles.addButton, { backgroundColor: paperTheme.colors.primary, shadowColor: paperTheme.colors.primary }]}
            labelStyle={styles.addButtonLabel}
            icon={() => <Ionicons name="cart" size={ICON_SIZES.lg} color={paperTheme.colors.onPrimary} />}
          >
            {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
          </Button>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <Text style={[styles.detailsTitle, { color: paperTheme.colors.onSurface }]}>
            Detalhes do Produto
          </Text>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Categoria
            </Text>
            <Text style={[styles.detailValue, { color: paperTheme.colors.onSurface }]}>
              Alimentos
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Peso/Volume
            </Text>
            <Text style={[styles.detailValue, { color: paperTheme.colors.onSurface }]}>
              500g
            </Text>
          </View>
          
          <View>
            <Text style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Validade
            </Text>
            <Text style={[styles.detailValue, { color: paperTheme.colors.onSurface }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.jumbo * 2 + SPACING.xlBase,
    paddingTop: SPACING.smPlus,
  },
  imageContainer: {
    height: SPACING.xxxl * 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.smPlus,
    borderRadius: BORDER_RADIUS.xxl,
    shadowOffset: { width: 0, height: SPACING.xs },
    shadowOpacity: 0.15,
    shadowRadius: SPACING.lg,
    elevation: SPACING.xs,
    overflow: 'hidden',
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xsPlus,
    borderRadius: BORDER_RADIUS.xl,
  },
  discountText: {
    fontWeight: 'bold',
    fontSize: FONT_SIZE.sm,
  },
  infoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xlBase,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.large,
    padding: SPACING.xl,
  },
  productName: {
    fontWeight: "bold",
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.displaySm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  price: {
    fontWeight: "bold",
    fontSize: FONT_SIZE.displaySm,
    marginRight: SPACING.md,
  },
  oldPrice: {
    fontSize: FONT_SIZE.lg,
    textDecorationLine: 'line-through',
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xlBase,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  marketInfoText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  marketInfoLabel: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  marketInfoValue: {
    fontWeight: "600",
    fontSize: FONT_SIZE.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.md,
  },
  ratingText: {
    fontSize: FONT_SIZE.md,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xs,
    ...SHADOWS.large,
  },
  addButtonLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  detailsCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    shadowOffset: { width: 0, height: SPACING.xs },
    shadowOpacity: 0.1,
    shadowRadius: SPACING.md,
    elevation: 6,
    padding: SPACING.xl,
  },
  detailsTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  detailItem: {
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontWeight: '600',
  },
});