import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Header } from "../../components/layout/header";
import { SuggestionResponse, getSuggestionById, getSuggestions } from "../../services/suggestionService";
import { useMarketLoader } from "../../hooks/useMarketLoader";
import { AIStackParamList } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { formatDistance } from "../../utils/distance";
import { useUserLocation } from "../../hooks/useUserLocation";
import { Suggestion } from "../../types/suggestion";
import ReceiptModal from "../../components/ui/ReceiptModal";

type AISearchNavigationProp = NativeStackNavigationProp<AIStackParamList>;

export default function AISearch() {
  const navigation = useNavigation<AISearchNavigationProp>();
  const paperTheme = useTheme();
  const [results, setResults] = useState<SuggestionResponse | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const { markets, productsCache, loading: loadingMarkets, loadMarkets } = useMarketLoader();
  const { getUserLocation, locationLoading } = useUserLocation();
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptModalMode, setReceiptModalMode] = useState<'recipe' | 'instructions'>('recipe');

  const recipeSuggestions = [
    "Receita de bolo de chocolate",
    "Pizza caseira",
    "Risotto de camarão",
    "Salada Caesar",
    "Hambúrguer artesanal",
    "Sushi caseiro",
    "Tacos mexicanos",
    "Pasta carbonara",
    "Brownie de chocolate",
    "Frango grelhado"
  ];

  useEffect(() => {
    const fetchSuggestionAndMarkets = async () => {
      if (!results?.suggestionId) return;

      try {
        const locationPromise = getUserLocation();
        const suggestionData = await getSuggestionById(results.suggestionId);
        setSuggestion(suggestionData);
        const coords = await locationPromise;
        await loadMarkets(suggestionData, coords);
      } catch (error) {
        console.warn("Erro ao carregar mercados da sugestão", error);
      }
    };

    fetchSuggestionAndMarkets();
  }, [results?.suggestionId, loadMarkets, getUserLocation]);

  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    
    if (!searchTerm.trim()) {
      return;
    }

    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const suggestionResponse = await getSuggestions(searchTerm.trim());
      setResults(suggestionResponse);
      setSuggestion(null);
    } catch (error: any) {
      setResults(null);
      setSuggestion(null);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        <View style={styles.searchSection}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={32} color={paperTheme.colors.primary} />
            <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>
              Pesquise por Receitas
            </Text>
            <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
              Descreva o que você quer cozinhar e nossa IA vai sugerir os ingredientes necessários
            </Text>
          </View>
          
          <View style={styles.searchInputContainer}>
            <View style={styles.searchBarContainer}>
              <Searchbar
                placeholder="Ex: Bolo de chocolate, Pizza"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface }]}
                icon={() => <Ionicons name="sparkles-outline" size={24} color={paperTheme.colors.primary} />}
                clearIcon={() => <Ionicons name="close-circle" size={24} color={paperTheme.colors.onSurfaceVariant} />}
                onSubmitEditing={() => handleSearch()}
                inputStyle={{ color: paperTheme.colors.onSurface }}
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
              />
              <TouchableOpacity
                onPress={() => handleSearch()}
                disabled={loading || !searchQuery.trim()}
                style={[
                  styles.searchButton,
                  {
                    backgroundColor: paperTheme.colors.primary,
                    opacity: (loading || !searchQuery.trim()) ? 0.6 : 1,
                  }
                ]}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={paperTheme.colors.onPrimary} />
                ) : (
                  <Ionicons name="search" size={20} color={paperTheme.colors.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Buscando receitas e ingredientes...
            </Text>
            <Text style={[styles.loadingSubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nossa IA está analisando sua busca
            </Text>
          </View>
        )}

        {!results && !loading && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: paperTheme.colors.onBackground }]}>
              💡 Sugestões de Receitas
            </Text>
            <Text style={[styles.suggestionsSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
              Toque em uma sugestão para ver os ingredientes
            </Text>
            
            <View style={styles.suggestionsGrid}>
              {recipeSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor: paperTheme.colors.surface,
                      borderColor: paperTheme.colors.outline,
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSearchQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                >
                  <Ionicons 
                    name="restaurant-outline" 
                    size={20} 
                    color={paperTheme.colors.primary} 
                  />
                  <Text 
                    style={[styles.suggestionText, { color: paperTheme.colors.onSurface }]}
                    numberOfLines={2}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {results && (
          <>
            {suggestion?.data?.receipt && (
              <View style={styles.receiptCardsContainer}>
                <TouchableOpacity
                  style={[
                    styles.receiptCard,
                    { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setReceiptModalMode('recipe');
                    setReceiptModalVisible(true);
                  }}
                >
                  <View style={styles.receiptCardContent}>
                    <View style={[styles.receiptCardIcon, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                      <Ionicons name="book-outline" size={24} color={paperTheme.colors.onPrimaryContainer} />
                    </View>
                    <View style={styles.receiptCardInfo}>
                      <Text style={[styles.receiptCardTitle, { color: paperTheme.colors.onSurface }]}>
                        Receita
                      </Text>
                      <Text style={[styles.receiptCardSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                        Ver ingredientes e informações
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.receiptCard,
                    { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setReceiptModalMode('instructions');
                    setReceiptModalVisible(true);
                  }}
                >
                  <View style={styles.receiptCardContent}>
                    <View style={[styles.receiptCardIcon, { backgroundColor: paperTheme.colors.secondaryContainer }]}>
                      <Ionicons name="restaurant-outline" size={24} color={paperTheme.colors.onSecondaryContainer} />
                    </View>
                    <View style={styles.receiptCardInfo}>
                      <Text style={[styles.receiptCardTitle, { color: paperTheme.colors.onSurface }]}>
                        Modo de Preparo
                      </Text>
                      <Text style={[styles.receiptCardSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                        Ver passos de preparação
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {locationLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Buscando sua localização...
                </Text>
              </View>
            )}

            {loadingMarkets ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Buscando mercados próximos...
                </Text>
              </View>
            ) : markets.length > 0 ? (
              <View style={styles.marketsContainer}>
                <Text style={[styles.marketsTitle, { color: paperTheme.colors.onBackground }]}>
                  Mercados Disponíveis
                </Text>
                {markets.map((market) => {
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
                          suggestionId: results.suggestionId,
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
                            {distanceLabel && (
                              <View
                                style={[
                                  styles.marketBadge,
                                  styles.marketDistanceBadge,
                                  { borderColor: paperTheme.colors.secondary, backgroundColor: paperTheme.colors.surface },
                                ]}
                              >
                                <Ionicons name="navigate-outline" size={12} color={paperTheme.colors.secondary} />
                                <Text style={[styles.marketBadgeText, { color: paperTheme.colors.secondary }]}>
                                  {distanceLabel}
                                </Text>
                              </View>
                            )}
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
                  );
                })}
              </View>
            ) : markets.length === 0 && !loadingMarkets ? (
              <View style={styles.emptyMarketsContainer}>
                <Ionicons name="storefront-outline" size={48} color={paperTheme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyMarketsText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Nenhum mercado encontrado com estes produtos
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {suggestion?.data?.receipt && (
        <ReceiptModal
          visible={receiptModalVisible}
          onClose={() => setReceiptModalVisible(false)}
          receipt={suggestion.data.receipt}
          mode={receiptModalMode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInputContainer: {
    marginTop: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  suggestionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  marketsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 24,
  },
  marketsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  marketCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  marketCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  marketLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  marketLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
  },
  marketBadges: {
    flexDirection: "row",
    gap: 8,
  },
  marketBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  marketDistanceBadge: {
    borderWidth: 1,
  },
  marketBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  marketPriceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyMarketsContainer: {
    paddingVertical: 48,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyMarketsText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  receiptCardsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  receiptCard: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  receiptCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  receiptCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  receiptCardInfo: {
    flex: 1,
  },
  receiptCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  receiptCardSubtitle: {
    fontSize: 13,
  },
});

