import React from "react";
import { View, Image, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";

type ProductDetailRouteProp = RouteProp<RootStackParamList, "ProductDetail">;

interface Props {
  route: ProductDetailRouteProp;
}

export default function ProductDetail({ route }: Props) {
  const { product } = route.params;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Image
        source={{ uri: product.image }}
        style={{
          width: "100%",
          height: 250,
          resizeMode: "contain",
          borderRadius: 12,
          marginBottom: 20,
        }}
      />
      <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 10 }}>
        {product.name}
      </Text>
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        R$ {product.price.toFixed(2)}
      </Text>
      <Text variant="bodyMedium" style={{ color: "gray" }}>
        Produto do mercado: {product.marketName}
      </Text>
    </ScrollView>
  );
}
