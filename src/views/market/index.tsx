import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
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
        <View style={styles.marketInfoContainer}>
          <Image source={{ uri: market.profilePicture }} style={styles.marketImage} />
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
                renderItem={({ item }) => (
                  <ProductCard
                    marketLogo={market.profilePicture}
                    marketName={market.name}
                    marketAddress={market.address}
                    title={item.name}
                    subtitle={item.unit}
                    price={item.price}
                    imageUrl={item.image}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        product: { ...item, marketName: market.name },
                      })
                    }
                    style={{ marginRight: 16 }}
                  />
                )}
              />
            </View>
          ))
        ) : (
          <Text style={[styles.noProductsText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Nenhum produto cadastrado
          </Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor será aplicado dinamicamente via props
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor será aplicado dinamicamente via props
  },
  scrollContent: {
    padding: 16,
  },
  marketInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  marketImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  marketName: {
    fontSize: 24,
    fontWeight: 'bold',
    // color será aplicado dinamicamente via props
  },
  marketAddress: {
    fontSize: 16,
    // color será aplicado dinamicamente via props
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    // color será aplicado dinamicamente via props
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    // color será aplicado dinamicamente via props
  },
});