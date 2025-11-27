import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ViewStyle, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { isValidImageUri } from "../../utils/imageUtils";
import { formatCurrency } from "../../utils/format";
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useModal } from "../../hooks/useModal";
import CustomModal from "./CustomModal";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;

interface ProductCardProps {
  marketLogo: string;
  marketName: string;
  title: string;
  subtitle: string;
  price: number;
  imageUrl?: string;
  onPress: () => void;
  style?: ViewStyle;
  productId?: string;
  marketId?: string;
  showAddToCartButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  marketLogo,
  marketName,
  title,
  subtitle,
  price,
  imageUrl,
  onPress,
  style,
  productId,
  marketId,
  showAddToCartButton = true,
}) => {
  const paperTheme = useCustomTheme();
  const navigation = useNavigation();
  const { modalState, hideModal, showSuccess, showWarning } = useModal();
  const { addToCart, isAdding } = useAddToCart({
    onSuccess: () => {
      showSuccess(
        'Produto Adicionado! 🎉',
        `${title} foi adicionado ao seu carrinho com sucesso!`,
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
    },
    onError: (error: any) => {
      if (error?.response?.status) {
        showWarning(
          'Aviso',
          'O produto foi adicionado ao carrinho localmente, mas houve um problema ao sincronizar com o servidor.',
          {
            text: 'OK',
            onPress: hideModal,
          }
        );
      } else {
        showWarning(
          'Erro',
          'Não foi possível adicionar o produto ao carrinho. Tente novamente.',
          {
            text: 'OK',
            onPress: hideModal,
          }
        );
      }
    },
  });

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (!productId || !marketId || isAdding) return;

    addToCart({
      productId,
      productName: title,
      price,
      image: imageUrl || '',
      marketName,
      marketId,
    });
  };

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.card, 
          { 
            width: CARD_WIDTH,
            backgroundColor: paperTheme.colors.surface,
            borderWidth: 1,
            borderColor: paperTheme.colors.outline,
            shadowColor: paperTheme.colors.modalShadow,
          }
        ]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          {isValidImageUri(marketLogo) ? (
            <Image source={{ uri: marketLogo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: paperTheme.colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: FONT_SIZE.xs }}>Sem logo</Text>
            </View>
          )}
          <View style={{ marginLeft: SPACING.md, flex: 1 }}>
            <Text 
              style={[styles.marketName, { color: paperTheme.colors.onSurface }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {marketName}
            </Text>
          </View>
        </View>

        <View style={styles.productImageContainer}>
          {isValidImageUri(imageUrl) ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, { backgroundColor: paperTheme.colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: FONT_SIZE.sm }}>Sem imagem</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.titleContainer}>
            <Text 
              style={[styles.productTitle, { color: paperTheme.colors.onSurface }]} 
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
          {subtitle && (
            <Text 
              style={[styles.productSubtitle, { color: paperTheme.colors.onSurfaceVariant }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
              {formatCurrency(price)}
            </Text>
            {showAddToCartButton && productId && marketId && (
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  {
                    backgroundColor: paperTheme.colors.primary,
                    shadowColor: paperTheme.colors.modalShadow,
                  }
                ]}
                onPress={handleAddToCart}
                disabled={isAdding}
                activeOpacity={0.8}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color={paperTheme.colors.onPrimary} />
                ) : (
                  <Ionicons name="cart-outline" size={ICON_SIZES.md} color={paperTheme.colors.onPrimary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <CustomModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        primaryButton={modalState.primaryButton}
        secondaryButton={modalState.secondaryButton}
      />
    </>
  );
}

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  logo: {
    width: ICON_SIZES.xxxl,
    height: ICON_SIZES.xxxl,
    borderRadius: BORDER_RADIUS.full,
  },
  marketName: {
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
  },
  productImageContainer: {
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  productImage: {
    width: "100%",
    height: SPACING.xxxl * 3,
    resizeMode: "contain",
  },
  footer: {
    marginTop: SPACING.xs,
  },
  titleContainer: {
    minHeight: FONT_SIZE.md * 2.4,
    justifyContent: 'flex-start',
    marginBottom: SPACING.micro,
  },
  productTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
    lineHeight: FONT_SIZE.md * 1.2,
  },
  productSubtitle: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.micro,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    flex: 1,
  },
  addToCartButton: {
    width: ICON_SIZES.xxxl,
    height: ICON_SIZES.xxxl,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
    marginLeft: SPACING.sm,
  },
});
