import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const data = await getSuggestions(searchQuery);
      onResult(data);
    } catch (err: any) {
      console.error(err);
      onResult({ essential_products: [], common_products: [], utensils: [] });
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
          style={[
            styles.searchButton,
            {
              backgroundColor: paperTheme.colors.primary,
            }
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={paperTheme.colors.onPrimary} />
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
