import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/layout/header";
import EmptyState from "../../components/ui/EmptyState";
import SearchItens, { SearchResults } from "../../components/ui/SearchItens";
import HeroBanner from "../../components/ui/Hero";
import CategoriesGrid from "../../components/ui/CategoriesGrid";
import { SearchStackParamList } from "../../navigation/types";
import { isValidImageUri } from "../../utils/imageUtils";
import { formatCurrency } from "../../utils/format";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";
import { CachedImage } from "../../components/ui/CachedImage";

type SearchScreenNavigationProp = NativeStackNavigationProp<SearchStackParamList>;

export default function Search() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useCustomTheme();
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
        <CachedImage source={item.image} style={styles.productImage} resizeMode="contain" cachePolicy="memory-disk" />
      )}
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
          {formatCurrency(item.price)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
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
        <CachedImage source={item.profilePicture} style={styles.marketImage} resizeMode="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={[styles.marketImage, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
          <Ionicons name="storefront-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />
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
      <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
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
          <EmptyState
            icon="search-outline"
            title="Nenhum resultado encontrado"
            subtitle="Tente buscar por outro termo"
            iconSize={ICON_SIZES.xxxl + ICON_SIZES.xl}
            showHeader={false}
          />
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
    marginVertical: SPACING.xlBase,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "bold",
    marginBottom: SPACING.md,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  productImage: {
    width: SPACING.xxxl + SPACING.xlBase,
    height: SPACING.xxxl + SPACING.xlBase,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  marketItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  marketImage: {
    width: SPACING.xxxl + SPACING.xlBase,
    height: SPACING.xxxl + SPACING.xlBase,
    borderRadius: BORDER_RADIUS.xxl + SPACING.micro,
    marginRight: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  marketInfo: {
    flex: 1,
  },
  marketName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  marketAddress: {
    fontSize: FONT_SIZE.sm + 1,
  },
});
