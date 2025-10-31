import React, { useState, useEffect } from "react";
import { FlatList, View, Image, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../App';
import ProductCard from "../../components/ui/ProductCard";
import FilterButton from "../../components/ui/FilterButton";
import HeroBanner from "../../components/ui/Hero";
import { Header } from "../../components/layout/header";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { getProducts } from "../../services/productService";
import { getMarkets, getMarketById } from "../../services/marketService";
import { Market } from "../../domain/marketDomain";
import { isNetworkError } from "../../utils/networkUtils";


type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const paperTheme = useTheme();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarketsWithProducts = async () => {
    try {
      const resMarkets = await getMarkets(1, 20);
      const marketsWithDetails = await Promise.all(
        resMarkets.markets.map(async (marketFromList: Market) => {
          try {
            setLoading(true);
            const marketDetails = await getMarketById(marketFromList.id);
            const resProducts = await getProducts(1, 20, marketDetails.id);
            return {
              ...marketDetails,
              products: resProducts.products
            };
          } catch (err: any) {
            console.error(`Erro ao buscar dados completos do mercado ${marketFromList.name}:`, err);
            if (isNetworkError(err)) {
              setOffline(true);
            } else {
              setError(true);
            }
            return { ...marketFromList, products: [] };
          }finally {
            setLoading(false); 
          }
        })
      );
      
      setMarkets(marketsWithDetails);
      setOffline(false);
    } catch (error: any) {
      console.error("Erro ao buscar mercados:", error);
      if (isNetworkError(error)) {
        setOffline(true);
      }
    }
  };

  useEffect(() => {
    fetchMarketsWithProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMarketsWithProducts();
    setRefreshing(false);
  };

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
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <HeroBanner />
        </View>
        <View
          style={{
            alignItems: "flex-end",
            marginBottom: 20,
            paddingHorizontal: 16,
          }}
        >
          <FilterButton
            title="Filtra por..."
            onPress={() => console.log("Botão de filtro pressionado")}
          />
        </View>

        {markets
          .filter((market) => market.products && market.products.length > 0)
          .map((market) => (
            <View key={market.id} style={{ marginBottom: 5 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MarketDetails", { marketId: market.id })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Image
                  source={{ uri: market.profilePicture }}
                  style={styles.marketImage}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>

                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", fontSize: 18, color: paperTheme.colors.onBackground }}
                  >
                    {market.name}
                  </Text>
                  
                  <Text style={[styles.marketAddress, { color: paperTheme.colors.onSurface, opacity: 0.7 }]} numberOfLines={1} ellipsizeMode="tail">
                    {market.address}
                  </Text>

                </View>
              </TouchableOpacity>

              <FlatList
                data={market.products}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productList}
                renderItem={({ item, index }) => (
                  <ProductCard
                    marketLogo={market.profilePicture}
                    marketName={market.name}
                    marketAddress={market.address}
                    title={item.name}
                    subtitle={item.name}
                    price={item.price}
                    imageUrl={item.image}
                    onPress={() =>
                      navigation.navigate("ProductDetail", { product: { ...item, marketName: market.name } })
                    }
                    style={{
                      marginRight:
                        index === market.products.length - 1 ? 0 : 12,
                    }}
                  />
                )}
                contentContainerStyle={{ paddingLeft: 4, paddingRight: 16 }}
              />
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor será aplicado dinamicamente via props
    },
    scrollViewFlex: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 16,
        paddingBottom: 200, 
    },
    marketImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    marketAddress: {
      fontSize: 12,
      // color será aplicado dinamicamente via props
    },
    productList: {
        minHeight: 250,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
});