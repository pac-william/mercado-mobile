import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getSuggestions, SuggestionResponse } from "../../services/suggestionService";

interface SearchItensProps {
  onResult: (data: SuggestionResponse) => void;
}

const SearchItens: React.FC<SearchItensProps> = ({ onResult }) => {
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
      <Searchbar
        placeholder="Digite sua receita ou produto"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        icon={() => <Ionicons name="rocket-outline" size={24} color="#FF4500" />}
        clearIcon={() => <Ionicons name="search" size={24} color="gray" />}
        onSubmitEditing={handleSearch} 
        onIconPress={handleSearch} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  searchbar: {
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

export default SearchItens;
