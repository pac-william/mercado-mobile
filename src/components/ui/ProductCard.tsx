import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions,ViewStyle  } from "react-native";
import { Text } from "react-native-paper";

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
  return (
    <TouchableOpacity style={[styles.card, { width: CARD_WIDTH }]} onPress={onPress}>
      <View style={styles.header}>
        <Image source={{ uri: marketLogo }} style={styles.logo} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.marketName} numberOfLines={1} ellipsizeMode="tail">
            {marketName}
          </Text>
          <Text style={styles.marketAddress} numberOfLines={1} ellipsizeMode="tail">
            {marketAddress}
          </Text>
        </View>
      </View>

      <View style={styles.productImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.productTitle} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.productSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        )}
        <Text style={styles.productPrice}>R$ {price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
  },
  marketAddress: {
    fontSize: 12,
    color: "gray",
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
  },
  productSubtitle: {
    fontSize: 12,
    color: "gray",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
