import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Header } from "../../components/layout/header";
import SearchItens from "../../components/ui/SearchItens";
import HeroBanner from "../../components/ui/Hero";
import CategoriesGrid from "../../components/ui/CategoriesGrid";
import { SuggestionResponse } from "../../services/suggestionService";

export default function Search() {
  const paperTheme = useTheme();
  const [results, setResults] = useState<SuggestionResponse | null>(null);

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

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />

      <FlatList
        data={flatListData}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        ListHeaderComponent={
          <>
            <View style={styles.searchSection}>
              <SearchItens onResult={setResults} />
            </View>

            <View style={styles.sectionCenter}>
              <HeroBanner />
            </View>

            <View style={styles.section}>
              <CategoriesGrid />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.resultItem,
              {
                backgroundColor: paperTheme.colors.surface,
                borderWidth: 1,
                borderColor: paperTheme.colors.outline,
              }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.itemText, { color: paperTheme.colors.onSurface }]}>
              {item.value}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    marginTop: 16, 
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionCenter: {
    marginVertical: 20,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
