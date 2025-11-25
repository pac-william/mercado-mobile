import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Searchbar, Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { HomeStackParamList } from "../../../App";
import { getProducts, Product } from "../../services/productService";
import ProductCard from "../../components/ui/ProductCard";
import { Header } from "../../components/layout/header";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { isNetworkError } from "../../utils/networkUtils";

type CategoryProductsRouteProp = RouteProp<HomeStackParamList, "MarketCategoryProducts">;

export default function MarketCategoryProductsScreen() {
  const route = useRoute<CategoryProductsRouteProp>();
  const { marketId, categoryId, categoryName, marketName, marketLogo } = route.params;
  const navigation = useNavigation<any>();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [offline, setOffline] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = useCallback(
    async (pageToLoad: number = 1, replace: boolean = false) => {
      if (pageToLoad === 1 && !replace) {
        setLoading(true);
      }
      try {
        const response = await getProducts(
          pageToLoad,
          20,
          marketId,
          searchQuery.trim() ? searchQuery.trim() : undefined,
          undefined,
          undefined,
          categoryId ? [categoryId] : undefined
        );
        const fetchedProducts = response.products ?? [];
        setProducts((prev) => {
          if (pageToLoad === 1) {
            return fetchedProducts;
          }
          const existingIds = new Set(prev.map((item) => item.id));
          const merged = fetchedProducts.filter((item) => !existingIds.has(item.id));
          return [...prev, ...merged];
        });
        setHasMore(fetchedProducts.length === 20);
        setPage(pageToLoad);
        setOffline(false);
      } catch (error: any) {
        if (isNetworkError(error)) {
          setOffline(true);
        }
      } finally {
        if (pageToLoad === 1) {
          setLoading(false);
        }
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [categoryId, marketId, searchQuery]
  );

  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }
    setLoadingMore(true);
    fetchProducts(page + 1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        marketLogo={marketLogo || ""}
        marketName={marketName}
        title={item.name}
        subtitle={item.unit || ""}
        price={item.price}
        imageUrl={item.image}
        onPress={() =>
          navigation.navigate("ProductDetail", {
            product: { ...item, marketName }
          })
        }
        style={styles.productCard}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.onBackground, marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      {offline && (
        <OfflineBanner message="Sem conexão com a internet. Alguns recursos podem estar limitados." />
      )}
      <View style={styles.header}>
        <Text style={[styles.categoryTitle, { color: paperTheme.colors.onBackground }]}>
          {categoryName}
        </Text>
        <Text style={[styles.marketSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
          {marketName}
        </Text>
      </View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar produtos..."
          onChangeText={setSearchInput}
          value={searchInput}
          style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface }]}
          icon={() => <Ionicons name="search-outline" size={22} color={paperTheme.colors.primary} />}
          clearIcon={() => <Ionicons name="close-circle" size={22} color={paperTheme.colors.onSurfaceVariant} />}
          inputStyle={{ color: paperTheme.colors.onSurface }}
          placeholderTextColor={paperTheme.colors.onSurfaceVariant}
        />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 40, 80) }
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.listFooter}>
              <ActivityIndicator size="small" color={paperTheme.colors.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={48}
                color={paperTheme.colors.onSurfaceVariant}
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Nenhum produto encontrado
              </Text>
              <Text style={[styles.emptySubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
                Tente ajustar sua busca ou os filtros
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },
  marketSubtitle: {
    fontSize: 14,
    marginTop: 4
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  searchbar: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16
  },
  productWrapper: {
    width: "48%"
  },
  productCard: {
    marginBottom: 0
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7
  }
});

