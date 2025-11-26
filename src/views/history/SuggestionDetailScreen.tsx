import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getSuggestionById } from "../../services/suggestionService";
import { Suggestion } from "../../types/suggestion";
import { useMarketLoader } from "../../hooks/useMarketLoader";
import { formatDistance } from "../../utils/distance";
import { useUserLocation } from "../../hooks/useUserLocation";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

type SuggestionDetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function SuggestionDetailScreen() {
  const navigation = useNavigation<SuggestionDetailScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useCustomTheme();
  const { suggestionId } = route.params as { suggestionId: string };
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { markets, productsCache, loadMarkets } = useMarketLoader();
  const { getUserLocation } = useUserLocation();

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const locationPromise = getUserLocation();
      const data = await getSuggestionById(suggestionId);
      setSuggestion(data);
      const coords = await locationPromise;
      await loadMarkets(data, coords);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar sugestão");
    } finally {
      setLoading(false);
    }
  }, [suggestionId, getUserLocation, loadMarkets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <Text style={{ color: paperTheme.colors.onBackground, marginTop: SPACING.smPlus }}>
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
            <Ionicons name="chevron-back" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
            Escolher Mercado
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={ICON_SIZES.xxxl + ICON_SIZES.xl}
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
      <View style={[styles.header, { borderBottomColor: paperTheme.colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
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
              <Ionicons name="storefront-outline" size={SPACING.jumbo} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Nenhum mercado encontrado
              </Text>
            </View>
          ) : (
            markets.map((market) => {
              const distanceLabel = formatDistance(market.distance);

              return (
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
                      products: productsCache.get(market.id),
                    });
                  }}
                >
                  <View style={styles.marketCardContent}>
                    {market.logo ? (
                      <Image source={{ uri: market.logo }} style={styles.marketLogo} />
                    ) : (
                      <View style={[styles.marketLogoPlaceholder, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                        <Ionicons name="storefront-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />
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
                        {distanceLabel && (
                          <View
                            style={[
                              styles.marketBadge,
                              styles.marketDistanceBadge,
                              { borderColor: paperTheme.colors.secondary, backgroundColor: paperTheme.colors.surface },
                            ]}
                          >
                            <Ionicons name="navigate-outline" size={ICON_SIZES.sm} color={paperTheme.colors.secondary} />
                            <Text style={[styles.marketBadgeText, { color: paperTheme.colors.secondary }]}>
                              {distanceLabel}
                            </Text>
                          </View>
                        )}
                        <View style={[styles.marketBadge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                          <Ionicons name="cube-outline" size={ICON_SIZES.sm} color={paperTheme.colors.primary} />
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
                    <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>
              );
            })
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  marketsSection: {
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
    marginBottom: SPACING.lg,
  },
  emptyMarketsContainer: {
    alignItems: "center",
    paddingVertical: SPACING.jumbo,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
  },
  marketLogo: {
    width: SPACING.xxxl + SPACING.lg,
    height: SPACING.xxxl + SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  marketLogoPlaceholder: {
    width: SPACING.xxxl + SPACING.lg,
    height: SPACING.xxxl + SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  marketCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  marketCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
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
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  marketBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  marketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  marketDistanceBadge: {
    borderWidth: 1,
  },
  marketBadgeText: {
    fontSize: FONT_SIZE.sm - 1,
    fontWeight: "500",
  },
  marketPriceText: {
    fontSize: FONT_SIZE.md - 1,
    fontWeight: "600",
  },
});

