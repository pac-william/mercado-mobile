import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getUserSuggestions, getSuggestionById } from "../../services/suggestionService";
import { Suggestion, SuggestionListItem } from "../../types/suggestion";
import { formatDate, getRelativeTime } from "../../utils/dateUtils";

type HistoryScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const paperTheme = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setError(null);
      const response = await getUserSuggestions(pageNum, 10);

      const suggestionPromises = response.suggestions.map((item: SuggestionListItem) =>
        getSuggestionById(item.id).catch(() => null)
      );

      const fetchedSuggestions = await Promise.all(suggestionPromises);
      const validSuggestions = fetchedSuggestions.filter(
        (s): s is Suggestion => s !== null
      );

      if (reset) {
        setSuggestions(validSuggestions);
      } else {
        setSuggestions((prev) => [...prev, ...validSuggestions]);
      }

      setHasMore(pageNum < response.meta.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar histórico");
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSuggestions(1, true);
    }, [loadSuggestions])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSuggestions(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadSuggestions(page + 1, false);
    }
  };

  const renderSuggestionItem = ({ item }: { item: Suggestion }) => {
    const essentialProducts = item.data.items.filter((i) => i.type === "essential");
    const totalProducts = item.data.items.length;

    return (
      <TouchableOpacity
        style={[
          styles.suggestionCard,
          {
            backgroundColor: paperTheme.colors.surface,
            borderColor: paperTheme.colors.outline,
            shadowColor: paperTheme.colors.modalShadow,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate("SuggestionDetail", { suggestionId: item.id });
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.taskText, { color: paperTheme.colors.onSurface }]}
              numberOfLines={2}
            >
              {item.task}
            </Text>
            <Text
              style={[
                styles.dateText,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {formatDate(item.createdAt)} • {getRelativeTime(item.createdAt)}
            </Text>
          </View>

          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
              <Ionicons name="cube-outline" size={12} color={paperTheme.colors.primary} />
              <Text style={[styles.badgeText, { color: paperTheme.colors.onSurfaceVariant }]}>
                {essentialProducts.length} essenciais
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
              <Ionicons name="bag-outline" size={12} color={paperTheme.colors.primary} />
              <Text style={[styles.badgeText, { color: paperTheme.colors.onSurfaceVariant }]}>
                {totalProducts} produtos
              </Text>
            </View>
          </View>

          <View style={styles.viewMoreContainer}>
            <Text
              style={[styles.viewMoreText, { color: paperTheme.colors.primary }]}
            >
              Ver Sugestão Completa
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={paperTheme.colors.primary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="bag-outline"
          size={64}
          color={paperTheme.colors.onSurfaceVariant}
        />
        <Text
          style={[styles.emptyTitle, { color: paperTheme.colors.onSurface }]}
        >
          Nenhuma sugestão encontrada
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Você ainda não criou nenhuma sugestão. Comece criando uma sugestão de
          produtos para suas receitas!
        </Text>
      </View>
    );
  };

  if (loading && suggestions.length === 0) {
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

  return (
    <View
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
    >
      <Header />
      <View style={[styles.header, { borderBottomColor: paperTheme.colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons
            name="sparkles"
            size={28}
            color={paperTheme.colors.primary}
          />
          <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
            Histórico de Sugestões
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={renderSuggestionItem}
        contentContainerStyle={
          suggestions.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && suggestions.length > 0 ? (
            <ActivityIndicator
              size="small"
              color={paperTheme.colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
      />
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
  },
  backButton: {
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  suggestionCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  viewMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    marginVertical: 16,
  },
});

