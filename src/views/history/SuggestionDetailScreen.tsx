import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getSuggestionById } from "../../services/suggestionService";
import { Suggestion } from "../../types/suggestion";
import { getProducts, Product } from "../../services/productService";
import { getMarketById } from "../../services/marketService";

type SuggestionDetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface MarketInfo {
  id: string;
  name: string;
  address: string;
  logo?: string;
  productCount: number;
  totalPrice: number;
}

export default function SuggestionDetailScreen() {
  const navigation = useNavigation<SuggestionDetailScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useTheme();
  const { suggestionId } = route.params as { suggestionId: string };
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketInfo[]>([]);

  useEffect(() => {
    loadData();
  }, [suggestionId]);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getSuggestionById(suggestionId);
      setSuggestion(data);
      await loadMarkets(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar sugestão");
    } finally {
      setLoading(false);
    }
  };

  const loadMarkets = async (suggestionData: Suggestion) => {
    if (suggestionData.data.items.length === 0) return;

    try {
      const allProducts: Product[] = [];
      const marketIdsSet = new Set<string>();

      for (const item of suggestionData.data.items) {
        try {
          const response = await getProducts(1, 50, undefined, item.name, undefined, undefined, item.categoryId);
          if (response.products?.length > 0) {
            allProducts.push(...response.products);
            response.products.forEach((p) => marketIdsSet.add(p.marketId));
          }
        } catch {
          continue;
        }
      }

      const marketsInfo = await Promise.all(
        Array.from(marketIdsSet).map(async (marketId): Promise<MarketInfo | null> => {
          try {
            const market = await getMarketById(marketId);
            const marketProducts: Product[] = [];

            for (const item of suggestionData.data.items) {
              try {
                const response = await getProducts(1, 50, marketId, item.name, undefined, undefined, item.categoryId);
                if (response.products?.length > 0) {
                  marketProducts.push(...response.products);
                }
              } catch {
                continue;
              }
            }

            const uniqueProducts = marketProducts.filter(
              (product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
            );

            const totalPrice = uniqueProducts.reduce((sum, product) => sum + product.price, 0);

            return {
              id: market.id,
              name: market.name,
              address: market.address || "",
              logo: market.profilePicture,
              productCount: uniqueProducts.length,
              totalPrice: totalPrice,
            };
          } catch {
            return null;
          }
        })
      );

      setMarkets(marketsInfo.filter((m): m is MarketInfo => m !== null));
    } catch {
      setMarkets([]);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={paperTheme.colors.primary}
          />
          <Text style={{ color: paperTheme.colors.onBackground, marginTop: 10 }}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !suggestion) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <Header />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={paperTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
            Escolher Mercado
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={paperTheme.colors.error}
          />
          <Text
            style={[styles.errorText, { color: paperTheme.colors.error }]}
          >
            {error || "Sugestão não encontrada"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
    >
      <Header />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={paperTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
          Escolher Mercado
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        <View style={styles.marketsSection}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Escolha um Mercado
          </Text>
          {markets.length === 0 ? (
            <View style={styles.emptyMarketsContainer}>
              <Ionicons name="storefront-outline" size={48} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Nenhum mercado encontrado
              </Text>
            </View>
          ) : (
            markets.map((market) => (
              <TouchableOpacity
                key={market.id}
                style={[
                  styles.marketCard,
                  { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate("MarketProducts", {
                    suggestionId: suggestionId,
                    marketId: market.id,
                  });
                }}
              >
                <View style={styles.marketCardContent}>
                  {market.logo ? (
                    <Image source={{ uri: market.logo }} style={styles.marketLogo} />
                  ) : (
                    <View style={[styles.marketLogoPlaceholder, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                      <Ionicons name="storefront-outline" size={24} color={paperTheme.colors.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={styles.marketInfo}>
                    <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]}>
                      {market.name}
                    </Text>
                    {market.address && (
                      <Text style={[styles.marketAddress, { color: paperTheme.colors.onSurfaceVariant }]} numberOfLines={1}>
                        {market.address}
                      </Text>
                    )}
                    <View style={styles.marketBadges}>
                      <View style={[styles.marketBadge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                        <Ionicons name="cube-outline" size={12} color={paperTheme.colors.primary} />
                        <Text style={[styles.marketBadgeText, { color: paperTheme.colors.primary }]}>
                          {market.productCount} {market.productCount === 1 ? "produto" : "produtos"}
                        </Text>
                      </View>
                      <View style={[styles.marketBadge, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                        <Text style={[styles.marketPriceText, { color: paperTheme.colors.onPrimaryContainer }]}>
                          R$ {market.totalPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  marketsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyMarketsContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  marketLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  marketLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  marketCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  marketCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
    fontSize: 12,
    marginBottom: 8,
  },
  marketBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  marketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  marketBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  marketPriceText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

