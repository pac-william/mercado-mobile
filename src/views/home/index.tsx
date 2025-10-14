import React, { useState, useEffect } from "react";
import { FlatList, View, Image, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../App';
import ProductCard from "../../components/ui/ProductCard";
import FilterButton from "../../components/ui/FilterButton";
import HeroBanner from "../../components/ui/Hero";
import { Header } from "../../components/layout/header";
import { getProducts } from "../../services/productService";
import { getMarkets, getMarketById } from "../../services/marketService";
import { Market } from "../../domain/marketDomain"


type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(false);
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
          } catch (err) {
            console.error(`Erro ao buscar dados completos do mercado ${marketFromList.name}:`, err);
            setError(true);
            return { ...marketFromList, products: [] };
          }finally {
            setLoading(false); 
          }
        })
      );
      console.log(marketsWithDetails);
      
      setMarkets(marketsWithDetails);
    } catch (error) {
      console.error("Erro ao buscar mercados:", error);
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
                <Text>Carregando...</Text>
            </View>
        );
    }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF4500"]}
            tintColor="#FF4500"
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
                    style={{ fontWeight: "bold", fontSize: 18 }}
                  >
                    {market.name}
                  </Text>
                  
                  <Text style={styles.marketAddress} numberOfLines={1} ellipsizeMode="tail">
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeeeff',
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
      color: "gray",
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