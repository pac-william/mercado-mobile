import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/layout/header";
import SearchItens, { SearchResults } from "../../components/ui/SearchItens";
import HeroBanner from "../../components/ui/Hero";
import CategoriesGrid from "../../components/ui/CategoriesGrid";
import { SearchStackParamList } from "../../navigation/types";
import { isValidImageUri } from "../../utils/imageUtils";

type SearchScreenNavigationProp = NativeStackNavigationProp<SearchStackParamList>;

export default function Search() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useTheme();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResult = useCallback((data: SearchResults) => {
    const marketMap = new Map();
    data.markets.forEach((market) => {
      marketMap.set(market.id, market);
    });

    const enrichedProducts = data.products.map((product) => {
      const market = marketMap.get(product.marketId);
      return {
        ...product,
        marketName: market?.name || "",
      };
    });

    setResults({
      products: enrichedProducts,
      markets: data.markets,
    });
    setHasSearched(true);
  }, []);

  useEffect(() => {
    const params = route.params as { initialResults?: SearchResults } | undefined;
    if (params?.initialResults) {
      handleSearchResult(params.initialResults);
    }
  }, [route.params, handleSearchResult]);

  const hasProducts = useMemo(() => results && results.products.length > 0, [results]);
  const hasMarkets = useMemo(() => results && results.markets.length > 0, [results]);
  const hasResults = useMemo(() => hasProducts || hasMarkets, [hasProducts, hasMarkets]);

  const renderProductItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        {
          backgroundColor: paperTheme.colors.surface,
          borderColor: paperTheme.colors.outline,
          shadowColor: paperTheme.colors.modalShadow,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      {item.image && isValidImageUri(item.image) && (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
          R$ {item.price.toFixed(2)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
    </TouchableOpacity>
  ), [navigation, paperTheme.colors]);

  const renderMarketItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.marketItem,
        {
          backgroundColor: paperTheme.colors.surface,
          borderColor: paperTheme.colors.outline,
          shadowColor: paperTheme.colors.modalShadow,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("MarketDetails", { marketId: item.id })}
    >
      {isValidImageUri(item.profilePicture) ? (
        <Image source={{ uri: item.profilePicture }} style={styles.marketImage} />
      ) : (
        <View style={[styles.marketImage, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
          <Ionicons name="storefront-outline" size={24} color={paperTheme.colors.onSurfaceVariant} />
        </View>
      )}
      <View style={styles.marketInfo}>
        <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.address && (
          <Text style={[styles.marketAddress, { color: paperTheme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {item.address}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
    </TouchableOpacity>
  ), [navigation, paperTheme.colors]);

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchSection}>
          <SearchItens onResult={handleSearchResult} />
        </View>

        {!hasSearched && (
          <>
            <View style={styles.sectionCenter}>
              <HeroBanner />
            </View>
            <View style={styles.section}>
              <CategoriesGrid />
            </View>
          </>
        )}

        {hasSearched && !hasResults && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={paperTheme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurface }]}>
              Nenhum resultado encontrado
            </Text>
            <Text style={[styles.emptySubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
              Tente buscar por outro termo
            </Text>
          </View>
        )}

        {hasProducts && results && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              Produtos ({results.products.length})
            </Text>
            <FlatList
              data={results.products}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderProductItem}
            />
          </View>
        )}

        {hasMarkets && results && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              Mercados ({results.markets.length})
            </Text>
            <FlatList
              data={results.markets}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderMarketItem}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionCenter: {
    marginVertical: 20,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  marketItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  marketImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  marketInfo: {
    flex: 1,
  },
  marketName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  marketAddress: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
