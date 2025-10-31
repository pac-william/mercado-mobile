import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";

const { width } = Dimensions.get("window"); // pega largura da tela
const CARD_WIDTH = width * 0.45;

interface ProductCardProps {
  marketLogo: string;
  marketName: string;
  marketAddress: string;
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
  marketAddress,
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
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Image source={{ uri: marketLogo }} style={styles.logo} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text 
            style={[styles.marketName, { color: paperTheme.colors.onSurface }]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {marketName}
          </Text>
          <Text 
            style={[styles.marketAddress, { color: paperTheme.colors.onSurfaceVariant }]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {marketAddress}
          </Text>
        </View>
      </View>

      <View style={styles.productImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
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
    // backgroundColor será aplicado dinamicamente via props
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    // borderWidth e borderColor serão aplicados dinamicamente via props
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  marketName: {
    fontWeight: "bold",
    fontSize: 14,
    // color será aplicado dinamicamente via props
  },
  marketAddress: {
    fontSize: 12,
    // color será aplicado dinamicamente via props
  },
  productImageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
  },
  footer: {
    marginTop: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
    // color será aplicado dinamicamente via props
  },
  productSubtitle: {
    fontSize: 12,
    // color será aplicado dinamicamente via props
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    // color será aplicado dinamicamente via props
  },
});
