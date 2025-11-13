import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getSuggestionById } from "../../services/suggestionService";
import { Suggestion } from "../../types/suggestion";
import { formatDateTime } from "../../utils/dateUtils";
import ProductSectionWithCards from "../../components/ui/ProductSectionWithCards";

type SuggestionDetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function SuggestionDetailScreen() {
  const navigation = useNavigation<SuggestionDetailScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useTheme();
  const { suggestionId } = route.params as { suggestionId: string };
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestion();
  }, [suggestionId]);

  const loadSuggestion = async () => {
    try {
      setError(null);
      const data = await getSuggestionById(suggestionId);
      setSuggestion(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar sugestão");
    } finally {
      setLoading(false);
    }
  };

  const essentialProducts = useMemo(
    () => suggestion?.data.items.filter((i) => i.type === "essential") || [],
    [suggestion]
  );
  const commonProducts = useMemo(
    () => suggestion?.data.items.filter((i) => i.type === "common") || [],
    [suggestion]
  );
  const utensils = useMemo(
    () => suggestion?.data.items.filter((i) => i.type === "utensil") || [],
    [suggestion]
  );

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

  const renderHeader = () => (
    <View style={styles.header}>
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
      {suggestion && (
        <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
          Detalhes da Sugestão
        </Text>
      )}
    </View>
  );

  if (error || !suggestion) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <Header />
        {renderHeader()}
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
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
          ]}
        >
          <Text
            style={[styles.taskText, { color: paperTheme.colors.onSurface }]}
          >
            {suggestion.task}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={paperTheme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {formatDateTime(suggestion.createdAt)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="cube-outline"
                size={16}
                color={paperTheme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {suggestion.data.items.length} produtos
              </Text>
            </View>
          </View>
        </View>

        <ProductSectionWithCards
          title="Produtos Essenciais"
          icon="star"
          items={essentialProducts}
          navigation={navigation}
        />

        <ProductSectionWithCards
          title="Produtos Comuns"
          icon="cube-outline"
          items={commonProducts}
          navigation={navigation}
        />

        <ProductSectionWithCards
          title="Utensílios"
          icon="restaurant-outline"
          items={utensils}
          navigation={navigation}
        />
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  taskText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
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
});

