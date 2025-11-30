import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Header } from "../../components/layout/header";
import { SuggestionResponse, getSuggestionById, getSuggestions } from "../../services/suggestionService";
import { useMarketLoader } from "../../hooks/useMarketLoader";
import { AIStackParamList } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { formatDistance } from "../../utils/distance";
import { useUserLocation } from "../../hooks/useUserLocation";
import { Suggestion } from "../../types/suggestion";
import ReceiptModal from "../../components/ui/ReceiptModal";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { formatCurrency } from "../../utils/format";
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOWS, ICON_SIZES } from "../../constants/styles";
import { useSession } from "../../hooks/useSession";
import CustomModal from "../../components/ui/CustomModal";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";
import { Session, SessionUser } from "../../types/session";
import api from "../../services/api";

type AISearchNavigationProp = NativeStackNavigationProp<AIStackParamList>;
type TabNavigationProp = BottomTabNavigationProp<any>;

export default function AISearch() {
  const navigation = useNavigation<AISearchNavigationProp>();
  const tabNavigation = useNavigation<TabNavigationProp>();
  const { isAuthenticated, refreshSession } = useSession();
  const [results, setResults] = useState<SuggestionResponse | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const { markets, productsCache, loading: loadingMarkets, loadMarkets } = useMarketLoader();
  const { getUserLocation, locationLoading } = useUserLocation();
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptModalMode, setReceiptModalMode] = useState<'recipe' | 'instructions'>('recipe');
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      usePKCE: true,
      extraParams: {
        prompt: 'login',
      },
    },
    discovery
  );

  const processedCodesRef = useRef<Set<string>>(new Set());

  const fetchOrCreateUser = useCallback(async (auth0User: SessionUser) => {
    try {
      const auth0Id = auth0User.sub;
      try {
        await api.get(`/users/auth0/${auth0Id}`);
      } catch (error: any) {
        if (error.response?.status === 500 || error.response?.status === 404) {
          const createData = {
            name: auth0User.name || auth0User.email || '',
            email: auth0User.email,
            auth0Id: auth0Id,
            profilePicture: auth0User.picture || undefined,
          };
          await api.post('/users', createData);
        }
      }
    } catch (error) {
    }
  }, []);

  const fetchUserInfo = useCallback(async (accessToken: string, sessionData?: Partial<Session>) => {
    try {
      const response = await axios.get(`https://${auth0Domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = response.data as SessionUser;

      if (userData.sub) {
        await fetchOrCreateUser(userData);
      }

      if (sessionData) {
        const updatedSession: Session = {
          ...sessionData,
          user: userData,
        } as Session;
        await SecureStore.setItemAsync('session', JSON.stringify(updatedSession));
      }
    } catch (error) {
    }
  }, [fetchOrCreateUser]);

  useEffect(() => {
    if (response?.type === 'success' && 'params' in response && response.params && 'code' in response.params) {
      const code = (response.params as any).code;
      
      if (processedCodesRef.current.has(code)) {
        return;
      }

      processedCodesRef.current.add(code);

      const fetchToken = async () => {
        try {
          const tokenResponse = await axios.post(
            `https://${auth0Domain}/oauth/token`,
            new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: clientId,
              code: code,
              redirect_uri: redirectUri,
              code_verifier: request?.codeVerifier || '',
            }).toString(),
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );

          const data = tokenResponse.data;

          if (data.id_token && data.access_token) {
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = data.expires_in ? now + data.expires_in : now + 3600;
            const sid = data.id_token ? data.id_token.substring(0, 32) : `sid_${now}`;

            const session: Partial<Session> = {
              tokenSet: {
                accessToken: data.access_token,
                idToken: data.id_token,
                scope: data.scope || 'openid profile email offline_access',
                requestedScope: data.scope || 'openid profile email offline_access',
                refreshToken: data.refresh_token || '',
                expiresAt: expiresAt,
              },
              internal: {
                sid: sid,
                createdAt: now,
              },
              exp: expiresAt,
            };

            await fetchUserInfo(data.access_token, session);
            await refreshSession();
          }
        } catch (error) {
        }
      };

      fetchToken();
    }
  }, [response, request?.codeVerifier, fetchUserInfo, refreshSession]);

  const { styles, theme: paperTheme } = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: SPACING.xxxl * 2,
    },
    searchSection: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
    },
    searchInputContainer: {
      marginTop: SPACING.xlBase,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchbar: {
      flex: 1,
      borderRadius: BORDER_RADIUS.lgPlus,
      ...SHADOWS.medium,
      marginRight: SPACING.xs,
    },
    searchButton: {
      width: ICON_SIZES.xxxl,
      height: ICON_SIZES.xxxl,
      borderRadius: BORDER_RADIUS.lgPlus,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.medium,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    title: {
      fontSize: FONT_SIZE.xxxl,
      fontWeight: "bold",
      marginTop: SPACING.xs,
      textAlign: "center",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontSize: FONT_SIZE.md,
      marginTop: SPACING.xs,
      textAlign: "center",
      lineHeight: SPACING.xlBase,
      color: theme.colors.onSurfaceVariant,
    },
    suggestionsContainer: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xxl,
    },
    suggestionsTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: "bold",
      marginBottom: SPACING.xs,
      color: theme.colors.onBackground,
    },
    suggestionsSubtitle: {
      fontSize: FONT_SIZE.sm + 1,
      marginBottom: SPACING.xlBase,
      color: theme.colors.onSurfaceVariant,
    },
    suggestionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    suggestionCard: {
      width: "48%",
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.md,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.medium,
    },
    suggestionText: {
      fontSize: FONT_SIZE.sm + 1,
      fontWeight: "500",
      marginLeft: SPACING.xs,
      flex: 1,
      color: theme.colors.onSurface,
    },
    loadingContainer: {
      paddingVertical: SPACING.xxxl + SPACING.xlBase,
      alignItems: "center",
      paddingHorizontal: SPACING.xxl,
    },
    loadingText: {
      marginTop: SPACING.lg,
      fontSize: FONT_SIZE.lg,
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.onSurfaceVariant,
    },
    loadingSubtext: {
      marginTop: SPACING.xs,
      fontSize: FONT_SIZE.md,
      textAlign: "center",
      opacity: 0.7,
      color: theme.colors.onSurfaceVariant,
    },
    marketsContainer: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
      paddingBottom: SPACING.xl,
    },
    marketsTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: "bold",
      marginBottom: SPACING.lg,
      color: theme.colors.onBackground,
    },
    marketCard: {
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      marginBottom: SPACING.md,
      ...SHADOWS.medium,
    },
    marketCardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.lg,
    },
    marketLogo: {
      width: ICON_SIZES.xxxl + ICON_SIZES.xl,
      height: ICON_SIZES.xxxl + ICON_SIZES.xl,
      borderRadius: BORDER_RADIUS.xxl + SPACING.xs,
      marginRight: SPACING.md,
    },
    marketLogoPlaceholder: {
      width: ICON_SIZES.xxxl + ICON_SIZES.xl,
      height: ICON_SIZES.xxxl + ICON_SIZES.xl,
      borderRadius: BORDER_RADIUS.xxl + SPACING.xs,
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
      color: theme.colors.onSurface,
    },
    marketAddress: {
      fontSize: FONT_SIZE.sm + 1,
      marginBottom: SPACING.xs,
      color: theme.colors.onSurfaceVariant,
    },
    marketBadges: {
      flexDirection: "row",
      gap: SPACING.xs,
    },
    marketBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.xs,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.xs,
      gap: SPACING.xs,
    },
    marketDistanceBadge: {
      borderWidth: 1,
    },
    marketBadgeText: {
      fontSize: FONT_SIZE.sm,
      fontWeight: "500",
    },
    marketPriceText: {
      fontSize: FONT_SIZE.md,
      fontWeight: "bold",
    },
    emptyMarketsContainer: {
      paddingVertical: ICON_SIZES.xxxl + ICON_SIZES.xl,
      alignItems: "center",
      paddingHorizontal: SPACING.xxl,
    },
    emptyMarketsText: {
      fontSize: FONT_SIZE.md,
      marginTop: SPACING.md,
      textAlign: "center",
      color: theme.colors.onSurfaceVariant,
    },
    receiptCardsContainer: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
      gap: SPACING.md,
    },
    receiptCard: {
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      ...SHADOWS.medium,
    },
    receiptCardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.lg,
    },
    receiptCardIcon: {
      width: ICON_SIZES.xxxl,
      height: ICON_SIZES.xxxl,
      borderRadius: BORDER_RADIUS.xxl,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    receiptCardInfo: {
      flex: 1,
    },
    receiptCardTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: "600",
      marginBottom: SPACING.xs,
      color: theme.colors.onSurface,
    },
    receiptCardSubtitle: {
      fontSize: FONT_SIZE.sm + 1,
      color: theme.colors.onSurfaceVariant,
    },
  }));

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

    if (!isAuthenticated) {
      setLoginModalVisible(true);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const suggestionResponse = await getSuggestions(searchTerm.trim());
      setResults(suggestionResponse);
      setSuggestion(null);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setLoginModalVisible(true);
      }
      setResults(null);
      setSuggestion(null);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [searchQuery, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchSection}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={ICON_SIZES.xxl} color={paperTheme.colors.primary} />
            <Text style={styles.title}>
              Pesquise por Receitas
            </Text>
            <Text style={styles.subtitle}>
              Descreva o que você quer cozinhar e nossa IA vai sugerir os ingredientes necessários
            </Text>
          </View>
          
          <View style={styles.searchInputContainer}>
            <View style={styles.searchBarContainer}>
              <Searchbar
                placeholder="Ex: Bolo de chocolate, Pizza"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}
                icon={() => <Ionicons name="sparkles-outline" size={ICON_SIZES.xl} color={paperTheme.colors.primary} />}
                clearIcon={() => <Ionicons name="close-circle" size={ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />}
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
                    shadowColor: paperTheme.colors.modalShadow,
                  }
                ]}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={paperTheme.colors.onPrimary} />
                ) : (
                  <Ionicons name="search" size={ICON_SIZES.lg} color={paperTheme.colors.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            <Text style={styles.loadingText}>
              Buscando receitas e ingredientes...
            </Text>
            <Text style={styles.loadingSubtext}>
              Nossa IA está analisando sua busca
            </Text>
          </View>
        )}

        {!results && !loading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              💡 Sugestões de Receitas
            </Text>
            <Text style={styles.suggestionsSubtitle}>
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
                      shadowColor: paperTheme.colors.modalShadow,
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
                    size={ICON_SIZES.lg} 
                    color={paperTheme.colors.primary} 
                  />
                  <Text 
                    style={styles.suggestionText}
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
                    { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline, shadowColor: paperTheme.colors.modalShadow },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setReceiptModalMode('recipe');
                    setReceiptModalVisible(true);
                  }}
                >
                  <View style={styles.receiptCardContent}>
                    <View style={[styles.receiptCardIcon, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                      <Ionicons name="book-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onPrimaryContainer} />
                    </View>
                    <View style={styles.receiptCardInfo}>
                      <Text style={styles.receiptCardTitle}>
                        Receita
                      </Text>
                      <Text style={styles.receiptCardSubtitle}>
                        Ver ingredientes e informações
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.receiptCard,
                    { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline, shadowColor: paperTheme.colors.modalShadow },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setReceiptModalMode('instructions');
                    setReceiptModalVisible(true);
                  }}
                >
                  <View style={styles.receiptCardContent}>
                    <View style={[styles.receiptCardIcon, { backgroundColor: paperTheme.colors.secondaryContainer }]}>
                      <Ionicons name="restaurant-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSecondaryContainer} />
                    </View>
                    <View style={styles.receiptCardInfo}>
                      <Text style={styles.receiptCardTitle}>
                        Modo de Preparo
                      </Text>
                      <Text style={styles.receiptCardSubtitle}>
                        Ver passos de preparação
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {locationLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={styles.loadingText}>
                  Buscando sua localização...
                </Text>
              </View>
            )}

            {loadingMarkets ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={styles.loadingText}>
                  Buscando mercados próximos...
                </Text>
              </View>
            ) : markets.length > 0 ? (
              <View style={styles.marketsContainer}>
                <Text style={styles.marketsTitle}>
                  Mercados Disponíveis
                </Text>
                {markets.map((market) => {
                  const distanceLabel = formatDistance(market.distance);

                  return (
                    <TouchableOpacity
                      key={market.id}
                      style={[
                        styles.marketCard,
                        { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline, shadowColor: paperTheme.colors.modalShadow },
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
                            <Ionicons name="storefront-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />
                          </View>
                        )}
                        <View style={styles.marketInfo}>
                          <Text style={styles.marketName}>
                            {market.name}
                          </Text>
                          {market.address && (
                            <Text style={styles.marketAddress} numberOfLines={1}>
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
                                {formatCurrency(market.totalPrice)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : markets.length === 0 && !loadingMarkets ? (
              <View style={styles.emptyMarketsContainer}>
                <Ionicons name="storefront-outline" size={ICON_SIZES.xxxl + ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />
                <Text style={styles.emptyMarketsText}>
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

      <CustomModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        type="info"
        title="Login Necessário"
        message="Para usar a pesquisa por receitas, é necessário fazer login na sua conta."
        primaryButton={{
          text: "Fazer Login",
          onPress: () => {
            setLoginModalVisible(false);
            promptAsync();
          },
          style: "primary",
        }}
        secondaryButton={{
          text: "Cancelar",
          onPress: () => setLoginModalVisible(false),
        }}
      />
    </View>
  );
}

