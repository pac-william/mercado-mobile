import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Header } from "../../components/layout/header";
import SearchItens from "../../components/ui/SearchItens";
import HeroBanner from "../../components/ui/Hero";
import CategoriesGrid from "../../components/ui/CategoriesGrid";
import { SuggestionResponse } from "../../services/suggestionService";

export default function Search() {
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
    <View style={styles.container}>
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
          <View style={styles.resultItem}>
            <Text style={styles.itemText}>• {item.value}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eeeeeeff",
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
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});
