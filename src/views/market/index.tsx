import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar, useTheme } from 'react-native-paper';
import { getMarketById } from '../../services/marketService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import ProductCard from '../../components/ui/ProductCard';
import { Header } from '../../components/layout/header';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { Market } from '../../domain/marketDomain';
import { Product } from '../../domain/productDomain';
import { Category } from '../../domain/categoryDomain';
import { HomeStackParamList } from '../../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native-paper';
import { isNetworkError } from '../../utils/networkUtils';
import { isValidImageUri } from '../../utils/imageUtils';
import { normalizeString } from '../../utils/stringUtils';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type MarketDetailsRouteParams = {
  marketId: string;
};

interface CategoryGroup {
  id: string;
  name: string;
  products: Product[];
  isVirtual?: boolean;
}

export default function MarketDetailsScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { marketId } = route.params as MarketDetailsRouteParams;

  const [market, setMarket] = useState<Market | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const marketResponse = await getMarketById(marketId);
        setMarket(marketResponse);

        const productsResponse = await getProducts(1, 100, marketId);
        setProducts(productsResponse?.products ?? []);

        const categoriesResponse = await getCategories(1, 100);
        setCategories(categoriesResponse?.category ?? []);
        setOffline(false);
      } catch (error: any) {
        console.error('Erro ao buscar dados do mercado:', error);
        if (isNetworkError(error)) {
          setOffline(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (marketId) {
      fetchMarketData();
    }
  }, [marketId]);

  const filteredAndCategorizedProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const categoryMap: Record<string, { name: string; normalizedName: string }> = categories.reduce((map, category) => {
      map[category.id] = {
        name: category.name,
        normalizedName: normalizeString(category.name),
      };
      return map;
    }, {} as Record<string, { name: string; normalizedName: string }>);

    let filteredProducts = products;

    if (searchQuery.trim()) {
      const normalizedQuery = normalizeString(searchQuery.trim());

      const matchingCategoryIds = Object.keys(categoryMap).filter(categoryId =>
        categoryMap[categoryId].normalizedName.includes(normalizedQuery)
      );

      filteredProducts = products.filter(product => {
        const normalizedProductName = normalizeString(product.name);
        const normalizedCategoryName = product.category?.name ? normalizeString(product.category.name) : '';
        
        const productNameMatch = normalizedProductName.includes(normalizedQuery);
        const categoryMatch = product.categoryId && matchingCategoryIds.includes(product.categoryId);
        const categoryNameMatch = normalizedCategoryName.includes(normalizedQuery);
        
        return productNameMatch || categoryMatch || categoryNameMatch;
      });
    }

    if (filteredProducts.length === 0) {
      return [];
    }

    const groupedProducts = filteredProducts.reduce((acc, product) => {
      const categoryId = product.categoryId || 'sem-categoria';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryMap[categoryId]?.name || product.category?.name || "Outros Produtos",
          products: [],
          isVirtual: !product.categoryId,
        };
      }

      acc[categoryId].products.push(product);

      return acc;
    }, {} as Record<string, CategoryGroup>);

    return Object.values(groupedProducts);
  }, [products, categories, searchQuery]);

  if (!market) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <Text style={{ color: paperTheme.colors.onBackground }}>Carregando...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.onBackground, marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      {market && (
        <ScreenHeader 
          title={market.name}
          icon="storefront"
          iconColor={paperTheme.colors.primary}
        />
      )}
      {offline && (
        <OfflineBanner message="Sem conexão com a internet. Alguns recursos podem estar limitados." />
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 120) }
        ]}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        <View style={[styles.marketInfoCard, { backgroundColor: paperTheme.colors.surface }]}>
          {isValidImageUri(market.profilePicture) ? (
            <Image source={{ uri: market.profilePicture }} style={styles.marketImage} />
          ) : (
            <View style={[styles.marketImage, styles.marketImagePlaceholder, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
              <Ionicons name="storefront-outline" size={32} color={paperTheme.colors.onSurfaceVariant} />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]}>
              {market.name}
            </Text>
            <Text style={[styles.marketAddress, { color: paperTheme.colors.onSurfaceVariant }]}>
              {market.address}
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar produtos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: paperTheme.colors.surface }]}
            icon={() => <Ionicons name="search-outline" size={24} color={paperTheme.colors.primary} />}
            clearIcon={() => <Ionicons name="close-circle" size={24} color={paperTheme.colors.onSurfaceVariant} />}
            inputStyle={{ color: paperTheme.colors.onSurface }}
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
          />
        </View>

        {filteredAndCategorizedProducts.length > 0 ? (
          filteredAndCategorizedProducts.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                disabled={category.isVirtual}
                onPress={() =>
                  navigation.navigate('MarketCategoryProducts', {
                    marketId: market.id,
                    categoryId: category.isVirtual ? undefined : category.id,
                    categoryName: category.name,
                    marketName: market.name,
                    marketLogo: market.profilePicture,
                  })
                }
                activeOpacity={category.isVirtual ? 1 : 0.7}
              >
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: paperTheme.colors.onSurface }]}>
                    {category.name}
                  </Text>
                  {!category.isVirtual && (
                    <View style={styles.categoryLink}>
                      <Text style={[styles.categoryLinkText, { color: paperTheme.colors.primary }]}>
                        Ver todos
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={paperTheme.colors.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <FlatList
                data={category.products}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsListContent}
                renderItem={({ item }) => (
                  <ProductCard
                    marketLogo={market.profilePicture || ''}
                    marketName={market.name}
                    title={item.name}
                    subtitle={item.unit || ''}
                    price={item.price}
                    imageUrl={item.image}
                    productId={item.id}
                    marketId={market.id}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        product: { ...item, marketName: market.name },
                      })
                    }
                    style={styles.productCard}
                  />
                )}
              />
            </View>
          ))
        ) : searchQuery.trim() ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={paperTheme.colors.onSurfaceVariant} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={[styles.noProductsText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nenhum produto encontrado
            </Text>
            <Text style={[styles.noProductsSubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
              Tente buscar com outro termo
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.noProductsText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nenhum produto cadastrado
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  marketInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  searchContainer: {
    marginBottom: SPACING.xl,
  },
  searchbar: {
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  marketImage: {
    width: SPACING.xxxl * 2,
    height: SPACING.xxxl * 2,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.lg,
  },
  marketImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  marketName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  marketAddress: {
    fontSize: FONT_SIZE.md,
    lineHeight: SPACING.xlBase,
  },
  categoryContainer: {
    marginBottom: SPACING.xxl,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  categoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  categoryLinkText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  productsListContent: {
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.lg,
  },
  productCard: {
    marginRight: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxxl + SPACING.xlBase,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  noProductsSubtext: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.7,
  },
});