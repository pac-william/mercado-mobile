import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Header } from "../../components/layout/header";
import SearchItens from "../../components/ui/SearchItens";
import { SuggestionResponse } from "../../services/suggestionService";
import { Ionicons } from "@expo/vector-icons";

export default function AISearch() {
  const paperTheme = useTheme();
  const [results, setResults] = useState<SuggestionResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sugestões iniciais para inspirar o usuário
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

  const flatListData = useMemo(() => {
    if (!results) return [];
    const data: { type: "essential" | "common" | "utensil"; value: string }[] = [];

    results.essential_products?.forEach((item) =>
      data.push({ type: "essential", value: item })
    );
    results.common_products?.forEach((item) =>
      data.push({ type: "common", value: item })
    );
    results.utensils?.forEach((item) =>
      data.push({ type: "utensil", value: item })
    );

    return data;
  }, [results]);

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Simula uma busca com a sugestão
    setTimeout(() => {
      // Aqui você pode fazer a busca automaticamente se quiser
    }, 100);
  };

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
          
          <View style={{ marginTop: 20 }}>
            <SearchItens 
              onResult={setResults} 
              placeholder="Ex: Bolo de chocolate, Pizza"
            />
          </View>
        </View>

        {!results && (
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
                  onPress={() => handleSuggestionPress(suggestion)}
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

        {results && flatListData.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Ionicons name="checkmark-circle" size={24} color={paperTheme.colors.primary} />
              <Text style={[styles.resultsTitle, { color: paperTheme.colors.onBackground }]}>
                Ingredientes Encontrados
              </Text>
            </View>

            <FlatList
              data={flatListData}
              keyExtractor={(item, index) => `${item.type}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.resultItem,
                    {
                      backgroundColor: paperTheme.colors.surface,
                      borderColor: paperTheme.colors.outline,
                    }
                  ]}
                >
                  <Ionicons 
                    name={
                      item.type === "essential" 
                        ? "star" 
                        : item.type === "common" 
                        ? "cube-outline" 
                        : "restaurant-outline"
                    }
                    size={18}
                    color={paperTheme.colors.primary}
                    style={styles.resultIcon}
                  />
                  <Text style={[styles.itemText, { color: paperTheme.colors.onSurface }]}>
                    {item.value}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {results && flatListData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={paperTheme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nenhum ingrediente encontrado
            </Text>
            <Text style={[styles.emptySubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
              Tente pesquisar por outro termo ou escolha uma das sugestões acima
            </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
  resultsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  resultIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
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
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});

