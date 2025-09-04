import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

const SearchItens: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        icon={() => <Ionicons name="rocket-outline" size={24} color="#FF4500" />} // IA icon
        clearIcon={() => <Ionicons name="search" size={24} color="gray" />} // lupa
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  searchbar: {
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 3, // sombra no Android
    shadowColor: "#000", // sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

export default SearchItens;
