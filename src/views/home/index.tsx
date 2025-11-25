import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FlatList, View, Image, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Text, ActivityIndicator, useTheme, Searchbar } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeStackParamList } from '../../../App';
import ProductCard from "../../components/ui/ProductCard";
import FilterButton from "../../components/ui/FilterButton";
import FilterModal from "../../components/ui/FilterModal";
import HeroBanner from "../../components/ui/Hero";
import { Header } from "../../components/layout/header";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { getProducts, Product } from "../../services/productService";
import { getMarkets, getMarketById } from "../../services/marketService";
import { Market } from "../../domain/marketDomain";
import { isNetworkError } from "../../utils/networkUtils";
import { isValidImageUri } from "../../utils/imageUtils";
import { normalizeString } from "../../utils/stringUtils";
import { useUserLocation } from "../../hooks/useUserLocation";
import { usePermissions } from "../../hooks/usePermissions";
import { formatDistance } from "../../utils/distance";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type MarketWithProducts = Market & {
  products?: Product[];
};

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const paperTheme = useTheme();
  const [markets, setMarkets] = useState<MarketWithProducts[]>([]);
  const [loading, setLoading] = useState(true); 
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    categoryIds?: string[];
  }>({});
  const [sortByDistance, setSortByDistance] = useState(false);
  const { getUserLocation } = useUserLocation();
  const permissions = usePermissions();

  const fetchMarketsWithProducts = useCallback(async () => {
    try {
      setLoading(true);
      let userLatitude: number | undefined;
      let userLongitude: number | undefined;

      if (sortByDistance && permissions.location.granted) {
        const userLocation = await getUserLocation();
        if (userLocation) {
          userLatitude = userLocation.latitude;
          userLongitude = userLocation.longitude;
        }
      }

      const resMarkets = await getMarkets(
        1,
        20,
        undefined,
        userLatitude,
        userLongitude
      );
      const marketsWithDetails = await Promise.all(
        resMarkets.markets.map(async (marketFromList: Market) => {
          try {
            const marketDetails = await getMarketById(marketFromList.id);
            const resProducts = await getProducts(
              1,
              20,
              marketDetails.id,
              undefined,
              filters.minPrice,
              filters.maxPrice,
              filters.categoryIds
            );
            return {
              ...marketDetails,
              distance: marketFromList.distance,
              latitude: marketFromList.latitude,
              longitude: marketFromList.longitude,
              products: resProducts.products
            };
          } catch (err: any) {
            console.error(`Erro ao buscar dados completos do mercado ${marketFromList.name}:`, err);
            if (isNetworkError(err)) {
              setOffline(true);
            }
            return { ...marketFromList, products: [] };
          }
        })
      );
      
      setMarkets(marketsWithDetails);
      setOffline(false);
    } catch (error: any) {
      console.error("Erro ao buscar mercados:", error);
      if (isNetworkError(error)) {
        setOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, sortByDistance, permissions.location.granted, getUserLocation]);

  useEffect(() => {
    fetchMarketsWithProducts();
  }, [fetchMarketsWithProducts]);

  const handleToggleNearbyMarkets = async () => {
    if (sortByDistance) {
      setSortByDistance(false);
    } else {
      if (!permissions.location.granted) {
        const granted = await permissions.location.request();
        if (!granted) {
          return;
        }
      }
      setSortByDistance(true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMarketsWithProducts();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: { minPrice?: number; maxPrice?: number; categoryIds?: string[] }) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.categoryIds && filters.categoryIds.length > 0);

  const filteredMarkets = useMemo(() => {
    let filtered: MarketWithProducts[] = markets;

    if (searchQuery.trim()) {
      const normalizedQuery = normalizeString(searchQuery.trim());
      filtered = markets
        .map((market): MarketWithProducts | null => {
          const normalizedMarketName = normalizeString(market.name);
          const marketMatches = normalizedMarketName.includes(normalizedQuery);
          
          const filteredProducts = market.products?.filter((product: Product) => {
            const normalizedProductName = normalizeString(product.name);
            return normalizedProductName.includes(normalizedQuery);
          }) || [];

          if (marketMatches || filteredProducts.length > 0) {
            return {
              ...market,
              products: marketMatches ? market.products : filteredProducts
            };
          }
          return null;
        })
        .filter((market): market is MarketWithProducts => market !== null);
    }

    return filtered
      .filter((market) => market.products && market.products.length > 0)
      .map((market) => (
        <View key={market.id} style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("MarketDetails", { marketId: market.id })}
            style={[styles.marketInfoCard, { backgroundColor: paperTheme.colors.surface }]}
            activeOpacity={0.7}
          >
            {isValidImageUri(market.profilePicture) ? (
              <Image
                source={{ uri: market.profilePicture }}
                style={styles.marketImage}
              />
            ) : (
              <View style={[styles.marketImage, styles.marketImagePlaceholder, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                <Ionicons name="storefront-outline" size={32} color={paperTheme.colors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]}>
                {market.name}
              </Text>
              <Text style={[styles.marketAddress, { color: paperTheme.colors.onSurfaceVariant }]} numberOfLines={1} ellipsizeMode="tail">
                {market.address}
              </Text>
              {sortByDistance && market.distance !== null && market.distance !== undefined && (
                <View style={styles.marketDistanceContainer}>
                  <View
                    style={[
                      styles.marketDistanceBadge,
                      { borderColor: paperTheme.colors.secondary, backgroundColor: paperTheme.colors.surface },
                    ]}
                  >
                    <Ionicons name="navigate-outline" size={12} color={paperTheme.colors.secondary} />
                    <Text style={[styles.marketDistanceText, { color: paperTheme.colors.secondary }]}>
                      {formatDistance(market.distance)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <FlatList
            data={market.products}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.productList}
            renderItem={({ item, index }) => (
              <ProductCard
                marketLogo={market.profilePicture || ""}
                marketName={market.name}
                title={item.name}
                subtitle=""
                price={item.price}
                imageUrl={item.image}
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: { ...item, marketName: market.name } })
                }
                style={{
                  marginRight:
                    index === (market.products?.length || 0) - 1 ? 0 : 12,
                }}
              />
            )}
            contentContainerStyle={{ paddingLeft: 4, paddingRight: 16 }}
          />
        </View>
      ));
  }, [markets, searchQuery, sortByDistance, navigation, paperTheme.colors]);

    if (loading) {
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
      <ScrollView
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <HeroBanner />
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Buscar produtos ou mercados..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface }]}
            icon={() => <Ionicons name="search-outline" size={24} color={paperTheme.colors.primary} />}
            clearIcon={() => <Ionicons name="close-circle" size={24} color={paperTheme.colors.onSurfaceVariant} />}
            inputStyle={{ color: paperTheme.colors.onSurface }}
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleToggleNearbyMarkets}
            style={styles.nearbyButton}
            activeOpacity={0.7}
          >
            <View style={styles.nearbyButtonContent}>
              <Ionicons
                name={sortByDistance ? "navigate" : "navigate-outline"}
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={[styles.nearbyButtonText, { color: paperTheme.colors.primary }]}>
                Mercados Próximos
              </Text>
              {sortByDistance && (
                <View style={[styles.nearbyButtonBadge, { backgroundColor: paperTheme.colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
          <FilterButton
            title="Filtra por..."
            onPress={() => setFilterModalVisible(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </View>

        {filteredMarkets}
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewFlex: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 16,
        paddingBottom: 200, 
    },
    marketInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    marketImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    marketImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    marketName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    marketAddress: {
        fontSize: 14,
        lineHeight: 20,
    },
    marketDistanceContainer: {
        marginTop: 8,
    },
    marketDistanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: 'flex-start',
        gap: 4,
    },
    marketDistanceText: {
        fontSize: 12,
        fontWeight: '500',
    },
    productList: {
        minHeight: 250,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    searchbar: {
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    nearbyButton: {
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    nearbyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nearbyButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    nearbyButtonBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
});