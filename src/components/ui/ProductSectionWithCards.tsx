import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../App";
import ProductCard from "./ProductCard";
import { getProducts, Product } from "../../services/productService";
import { getMarketById } from "../../services/marketService";
import { SuggestionItem } from "../../types/suggestion";
import { SPACING, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

interface ProductSectionWithCardsProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: SuggestionItem[];
  navigation: NativeStackNavigationProp<HomeStackParamList>;
}

interface ProductWithMarket extends Product {
  marketName: string;
  marketAddress: string;
  marketLogo?: string;
}

export default function ProductSectionWithCards({
  title,
  icon,
  items,
  navigation,
}: ProductSectionWithCardsProps) {
  const paperTheme = useTheme();
  const [products, setProducts] = useState<ProductWithMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [items]);

  const loadProducts = async () => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const allProducts: Product[] = [];

      for (const item of items) {
        try {
          const response = await getProducts(1, 10, undefined, item.name, undefined, undefined, item.categoryId);
          if (response.products?.length > 0) {
            allProducts.push(...response.products);
          }
        } catch {
          continue;
        }
      }

      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );

      const marketIds = [...new Set(uniqueProducts.map((p) => p.marketId))];
      const marketsMap = new Map<string, { name: string; address: string; logo?: string }>();
      const defaultMarket = { name: "Mercado", address: "", logo: "" };

      await Promise.all(
        marketIds.map(async (marketId) => {
          try {
            const market = await getMarketById(marketId);
            marketsMap.set(marketId, {
              name: market.name,
              address: market.address || "",
              logo: market.profilePicture || "",
            });
          } catch {
            marketsMap.set(marketId, defaultMarket);
          }
        })
      );

      const productsWithMarket: ProductWithMarket[] = uniqueProducts.map((product) => {
        const market = marketsMap.get(product.marketId) || defaultMarket;
        return {
          ...product,
          marketName: market.name,
          marketAddress: market.address,
          marketLogo: market.logo,
        };
      });

      setProducts(productsWithMarket);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
          {title}
        </Text>
        {!loading && products.length > 0 && (
          <Text style={[styles.productCount, { color: paperTheme.colors.onSurfaceVariant }]}>
            ({products.length})
          </Text>
        )}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={paperTheme.colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Nenhum produto encontrado
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              marketLogo={item.marketLogo || ""}
              marketName={item.marketName}
              title={item.name}
              subtitle={item.unit || item.name}
              price={item.price}
              imageUrl={item.image}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  product: { ...item },
                })
              }
              style={styles.productCard}
            />
          )}
          contentContainerStyle={styles.productsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
  },
  productCount: {
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.xs,
  },
  productsList: {
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.lg,
  },
  productCard: {
    marginRight: SPACING.md,
  },
  loadingContainer: {
    paddingVertical: SPACING.xlBase,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: SPACING.xlBase,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
  },
});

