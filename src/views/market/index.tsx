import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getMarketById } from '../../services/marketService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import ProductCard from '../../components/ui/ProductCard';
import { Header } from '../../components/layout/header';
import { Market } from '../../domain/marketDomain';
import { Product } from '../../domain/productDomain';
import { Category } from '../../domain/categoryDomain';
import { HomeStackParamList } from '../../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native-paper';

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
  const { marketId } = route.params as MarketDetailsRouteParams;

  const [market, setMarket] = useState<Market | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorizedProducts, setCategorizedProducts] = useState<CategoryGroup[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      } catch (error) {
        console.error('Erro ao buscar dados do mercado:', error);
        setError(true);
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
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.marketInfoContainer}>
          <Image source={{ uri: market.profilePicture }} style={styles.marketImage} />
          <View style={styles.textContainer}>
            <Text style={styles.marketName}>{market.name}</Text>
            <Text style={styles.marketAddress}>{market.address}</Text>
          </View>
        </View>

        {categorizedProducts.length > 0 ? (
          categorizedProducts.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
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
          <Text style={styles.noProductsText}>Nenhum produto cadastrado</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeeeff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#333',
  },
  marketAddress: {
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});
