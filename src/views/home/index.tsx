import React, { useState, useEffect } from "react";
import { FlatList, View, Image, SafeAreaView, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Importe os tipos de App.tsx para usar com useNavigation
import { HomeStackParamList } from '../../../App'; 
import ProductCard from "../../components/ui/ProductCard";
import FilterButton from "../../components/ui/FilterButton";
import HeroBanner from "../../components/ui/Hero";
import { Header } from "../../components/layout/header";
import { getProducts } from "../../services/productService";
import { getMarkets } from "../../services/marketService";
import { Market } from "../../domain/marketDomain"

// Defina o tipo de navegação
type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

 const [markets, setMarkets] = useState<Market[]>([]);

 const fetchMarketsWithProducts = async () => {
  try {
   const resMarkets = await getMarkets(1, 20);

   const marketsWithProducts: Market[] = await Promise.all(
    resMarkets.markets.map(async (market: Market) => {
     try {
      const resProducts = await getProducts(1, 20, market.id);
      return { ...market, products: resProducts.products };
     } catch (err) {
      console.error(`Erro ao buscar produtos do mercado ${market.name}:`, err);
      return { ...market, products: [] };
     }
    })
   );

   setMarkets(marketsWithProducts);
  } catch (error) {
   console.error("Erro ao buscar mercados:", error);
  }
 };

 useEffect(() => {
  fetchMarketsWithProducts();
 }, []);

 return (
  <SafeAreaView className="flex-1 bg-white">
   <Header />
   <ScrollView contentContainerStyle={{ padding: 16 }}>
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

    {markets.map((market) => (
     <View key={market.id} style={{ marginBottom: 5 }}>
      <View
       style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
       }}
      >
       <Image
        source={{ uri: market.logo }}
        style={{
         width: 60,
         height: 60,
         resizeMode: "contain",
         borderRadius: 8,
         marginRight: 12,
        }}
       />
       <Text
        variant="titleMedium"
        style={{ fontWeight: "bold", fontSize: 18 }}
       >
        {market.name}
       </Text>
      </View>

      <FlatList
       data={market.products}
       keyExtractor={(item) => item.id.toString()}
       horizontal
       showsHorizontalScrollIndicator={false}
       renderItem={({ item, index }) => (
        <ProductCard
         marketLogo={market.logo}
         marketName={market.name}
         marketAddress="Av. Maestro Sansão, 123"
         title={item.name}
         subtitle={item.name}
         price={item.price}
         imageUrl={item.image}
         onPress={() =>
          // Agora, a navegação funciona corretamente
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