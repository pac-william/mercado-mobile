import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { isValidImageUri } from "../../utils/imageUtils";
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

const { width } = Dimensions.get("window"); // pega largura da tela
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  marketLogo,
  marketName,
  title,
  subtitle,
  price,
  imageUrl,
  onPress,
  style 
}) => {
  const paperTheme = useTheme();

  return (
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
        <Text 
          style={[styles.productTitle, { color: paperTheme.colors.onSurface }]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[styles.productSubtitle, { color: paperTheme.colors.onSurfaceVariant }]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
        <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
          R$ {price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
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
  productTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
    marginBottom: SPACING.micro,
  },
  productSubtitle: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.micro,
  },
  productPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
});
