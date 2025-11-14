import * as React from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Searchbar, useTheme } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getSuggestions, SuggestionResponse } from "../../services/suggestionService";

interface SearchItensProps {
  onResult: (data: SuggestionResponse) => void;
  placeholder?: string;
}

const SearchItens: React.FC<SearchItensProps> = ({ onResult, placeholder = "Digite sua receita ou produto" }) => {
  const paperTheme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    try {
      const data = await getSuggestions(searchQuery);
      onResult(data);
    } catch (err: any) {
      onResult({ essential_products: [], common_products: [], utensils: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={placeholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface, marginRight: 8 }]}
          icon={() => <Ionicons name="sparkles-outline" size={24} color={paperTheme.colors.primary} />}
          clearIcon={() => <Ionicons name="close-circle" size={24} color={paperTheme.colors.onSurfaceVariant} />}
          onSubmitEditing={handleSearch} 
          inputStyle={{ color: paperTheme.colors.onSurface }}
          placeholderTextColor={paperTheme.colors.onSurfaceVariant}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          style={[
            styles.searchButton,
            {
              backgroundColor: paperTheme.colors.primary,
              opacity: loading ? 0.6 : 1,
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
  );
};

const styles = StyleSheet.create({
  container: { 
    marginBottom: 16 
  },
  searchContainer: {
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
});

export default SearchItens;
