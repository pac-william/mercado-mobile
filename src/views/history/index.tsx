import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getUserSuggestions, getSuggestionById } from "../../services/suggestionService";
import { Suggestion, SuggestionListItem } from "../../types/suggestion";
import { formatDate, getRelativeTime } from "../../utils/dateUtils";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";
import { useLoading } from "../../hooks/useLoading";

type HistoryScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const paperTheme = useCustomTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { loading, execute } = useLoading({ initialValue: true });
  const { loading: refreshing, execute: executeRefresh } = useLoading();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    const executeFn = reset && pageNum === 1 ? execute : executeRefresh;
    
    executeFn(async () => {
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
      }
    });
  }, [execute, executeRefresh]);

  useFocusEffect(
    useCallback(() => {
      loadSuggestions(1, true);
    }, [loadSuggestions])
  );

  const handleRefresh = () => {
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
              <Ionicons name="cube-outline" size={ICON_SIZES.sm} color={paperTheme.colors.primary} />
              <Text style={[styles.badgeText, { color: paperTheme.colors.onSurfaceVariant }]}>
                {essentialProducts.length} essenciais
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
              <Ionicons name="bag-outline" size={ICON_SIZES.sm} color={paperTheme.colors.primary} />
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
              size={ICON_SIZES.md}
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
          size={ICON_SIZES.xxxl + ICON_SIZES.xl}
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
          <Text style={{ color: paperTheme.colors.onBackground, marginTop: SPACING.smPlus }}>
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
            size={ICON_SIZES.xl}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons
            name="sparkles"
            size={ICON_SIZES.xlPlus}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
  },
  errorContainer: {
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  suggestionCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  taskText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  badgeText: {
    fontSize: FONT_SIZE.sm - 1,
    fontWeight: "500",
  },
  viewMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  viewMoreText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
    marginRight: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl + SPACING.xlBase,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
    textAlign: "center",
    lineHeight: SPACING.xlBase,
  },
  footerLoader: {
    marginVertical: SPACING.lg,
  },
});

