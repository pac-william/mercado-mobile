import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMarketById } from '../../services/marketService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import ProductCard from '../../components/ui/ProductCard';
import { Header } from '../../components/layout/header';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { Market } from '../../domain/marketDomain';
import { Product } from '../../domain/productDomain';
import { Category } from '../../domain/categoryDomain';
import { HomeStackParamList } from '../../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { isNetworkError } from '../../utils/networkUtils';
import { isValidImageUri } from '../../utils/imageUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type MarketDetailsRouteParams = {
  marketId: string;
};

interface CategoryGroup {
  id: string;
  name: string;
  products: Product[];
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
  const [categorizedProducts, setCategorizedProducts] = useState<CategoryGroup[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (marketId) {
      fetchMarketData();
    }
  }, [marketId]);

  useEffect(() => {
    if (products.length > 0) {
      const categoryMap: Record<string, string> = categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
      }, {} as Record<string, string>);

      const groupedProducts = products.reduce((acc, product) => {
        const categoryId = product.categoryId || 'sem-categoria';

        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            name: product.category?.name || "Outros Produtos", 
            products: [],
          };
        }

        acc[categoryId].products.push(product);
        
        return acc;
      }, {} as Record<string, CategoryGroup>);

      setCategorizedProducts(Object.values(groupedProducts));
    } else {
      setCategorizedProducts([]);
    }
  }, [products, categories]);

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

        {categorizedProducts.length > 0 ? (
          categorizedProducts.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <Text style={[styles.categoryTitle, { color: paperTheme.colors.onSurface }]}>
                {category.name}
              </Text>
              <FlatList
                data={category.products}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsListContent}
                renderItem={({ item }) => (
                  <ProductCard
                    marketLogo={market.profilePicture}
                    marketName={market.name}
                    title={item.name}
                    subtitle={item.unit}
                    price={item.price}
                    imageUrl={item.image}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  marketInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  marketImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  marketImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  marketName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  marketAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoryContainer: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  productsListContent: {
    paddingLeft: 4,
    paddingRight: 16,
  },
  productCard: {
    marginRight: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});