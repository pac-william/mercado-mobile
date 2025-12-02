import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Searchbar, Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from "../../constants/styles";

import { HomeStackParamList } from "../../../App";
import { getProducts, Product } from "../../services/productService";
import ProductCard from "../../components/ui/ProductCard";
import { Header } from "../../components/layout/header";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { isNetworkError } from "../../utils/networkUtils";
import { useLoading } from "../../hooks/useLoading";

type CategoryProductsRouteProp = RouteProp<HomeStackParamList, "MarketCategoryProducts">;

export default function MarketCategoryProductsScreen() {
  const route = useRoute<CategoryProductsRouteProp>();
  const { marketId, categoryId, categoryName, marketName, marketLogo } = route.params;
  const navigation = useNavigation<any>();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const { loading, execute } = useLoading({ initialValue: true });
  const { loading: loadingMore, execute: executeLoadMore } = useLoading();
  const { loading: refreshing, execute: executeRefresh } = useLoading();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [offline, setOffline] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadProducts = useCallback(async () => {
    await execute(async () => {
      try {
        const response = await getProducts(
          1,
          20,
          marketId,
          searchQuery.trim() ? searchQuery.trim() : undefined,
          undefined,
          undefined,
          categoryId ? [categoryId] : undefined
        );
        const fetchedProducts = response.products ?? [];
        setProducts(fetchedProducts);
        setHasMore(fetchedProducts.length === 20);
        setPage(1);
        setOffline(false);
      } catch (error: any) {
        if (isNetworkError(error)) {
          setOffline(true);
        }
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
    });
  }, [categoryId, marketId, searchQuery, execute]);

  const fetchProducts = useCallback(
    async (pageToLoad: number = 1, replace: boolean = false) => {
      if (pageToLoad === 1 && replace) {
        await executeRefresh(async () => {
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
            setProducts(fetchedProducts);
            setHasMore(fetchedProducts.length === 20);
            setPage(pageToLoad);
            setOffline(false);
          } catch (error: any) {
            if (isNetworkError(error)) {
              setOffline(true);
            }
            console.error('Erro ao buscar produtos:', error);
            throw error;
          }
        });
      } else if (pageToLoad === 1) {
        await loadProducts();
      } else {
        await executeLoadMore(async () => {
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
            console.error('Erro ao buscar produtos:', error);
            throw error;
          }
        });
      }
    },
    [categoryId, marketId, searchQuery, executeLoadMore, executeRefresh, loadProducts]
  );

  useEffect(() => {
    loadProducts();
  }, [categoryId, marketId]);
  
  useEffect(() => {
    if (searchQuery !== '') {
      loadProducts();
    }
  }, [searchQuery]);

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
    fetchProducts(page + 1);
  };

  const handleRefresh = () => {
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
        productId={item.id}
        marketId={marketId}
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
      <ScreenHeader title={categoryName} icon="grid" />
      {offline && (
        <OfflineBanner message="Sem conexão com a internet. Alguns recursos podem estar limitados." />
      )}
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
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg
  },
  searchbar: {
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm
  },
  row: {
    justifyContent: "space-between",
    marginBottom: SPACING.lg
  },
  productWrapper: {
    width: "48%"
  },
  productCard: {
    marginBottom: 0
  },
  listFooter: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    textAlign: "center"
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginTop: SPACING.sm,
    opacity: 0.7
  }
});

