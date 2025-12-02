import * as React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, Product } from "../../services/productService";
import { getMarkets } from "../../services/marketService";
import { Market } from "../../domain/marketDomain";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useLoading } from "../../hooks/useLoading";
import { SPACING, BORDER_RADIUS, ICON_SIZES, SHADOWS } from "../../constants/styles";

export interface SearchResults {
  products: Product[];
  markets: Market[];
}

interface SearchItensProps {
  onResult: (data: SearchResults) => void;
  placeholder?: string;
}

const SearchItens: React.FC<SearchItensProps> = ({ onResult, placeholder = "Digite produto ou mercado" }) => {
  const { styles, theme: paperTheme } = useThemedStyles((theme) => ({
    container: {
      marginBottom: SPACING.lg,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchbar: {
      flex: 1,
      marginRight: SPACING.xs,
      borderRadius: BORDER_RADIUS.xl,
      elevation: SHADOWS.medium.elevation,
      shadowColor: theme.colors.modalShadow,
      shadowOffset: SHADOWS.medium.shadowOffset,
      shadowOpacity: SHADOWS.medium.shadowOpacity,
      shadowRadius: SHADOWS.medium.shadowRadius,
      backgroundColor: theme.colors.surface,
    },
    searchButton: {
      width: SPACING.jumbo,
      height: SPACING.jumbo,
      borderRadius: BORDER_RADIUS.xl,
      justifyContent: "center",
      alignItems: "center",
      elevation: SHADOWS.medium.elevation,
      shadowColor: theme.colors.modalShadow,
      shadowOffset: SHADOWS.medium.shadowOffset,
      shadowOpacity: SHADOWS.medium.shadowOpacity,
      shadowRadius: SHADOWS.medium.shadowRadius,
      backgroundColor: theme.colors.primary,
    },
  }));
  const [searchQuery, setSearchQuery] = React.useState("");
  const { loading, execute } = useLoading();

  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;

    execute(async () => {
      try {
        const [productsResponse, marketsResponse] = await Promise.all([
          getProducts(1, 20, undefined, searchQuery.trim()).catch(() => ({ products: [] })),
          getMarkets(1, 20, searchQuery.trim()).catch(() => ({ markets: [] })),
        ]);

        onResult({
          products: productsResponse?.products || [],
          markets: marketsResponse?.markets || [],
        });
      } catch (err: unknown) {
        onResult({ products: [], markets: [] });
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={placeholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon={() => <Ionicons name="sparkles-outline" size={ICON_SIZES.xl} color={paperTheme.colors.primary} />}
          clearIcon={() => <Ionicons name="close-circle" size={ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />}
          onSubmitEditing={handleSearch} 
          inputStyle={{ color: paperTheme.colors.onSurface }}
          placeholderTextColor={paperTheme.colors.onSurfaceVariant}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          style={[styles.searchButton, loading && { opacity: 0.6 }]}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={paperTheme.colors.onPrimary} />
          ) : (
            <Ionicons name="search" size={ICON_SIZES.lg} color={paperTheme.colors.onPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchItens;
