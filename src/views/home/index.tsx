import React, { useState, useEffect } from "react";
import { FlatList, View, Image, SafeAreaView ,ScrollView} from "react-native";
import { Text } from "react-native-paper";
import ProductCard from "../../components/ui/ProductCard";
import SearchItens from "../../components/ui/SearchItens";
import FilterButton from "../../components/ui/FilterButton";

const mockProducts = [
  {
    id: 1,
    name: "Bahamas",
    logo: "https://bahamas.com.br/wp-content/uploads/2024/09/Logo-Grupo-Bahamas.png",
    products: [
      {
        id: 1,
        title: "Pizza Calabresa",
        subtitle: "Grande • 8 fatias",
        price: "49,90",
        imageUrl: "https://picsum.photos/200/300",
      },
      {
        id: 2,
        title: "Hambúrguer Artesanal",
        subtitle: "200g carne Angus",
        price: "29,90",
        imageUrl: "https://picsum.photos/200/301",
      },
      {
        id: 3,
        title: "Hambúrguer Artesanal",
        subtitle: "200g carne Angus",
        price: "29,90",
        imageUrl: "https://picsum.photos/200/302",
      },
    ],
  },
  {
    id: 2,
    name: "BH",
    logo: "https://www.supermercadosbh.com.br/wp-content/themes/supermercadosbh/assets/images/logo-bh-white.png",
    products: [
      {
        id: 3,
        title: "Açaí na Tigela",
        subtitle: "500ml com granola",
        price: "19,90",
        imageUrl: "https://picsum.photos/200/302",
      },
      {
        id: 4,
        title: "Coxinha de Frango",
        subtitle: "6 unidades",
        price: "15,90",
        imageUrl: "https://picsum.photos/200/303",
      },
      {
        id: 5,
        title: "Coxinha de Frango",
        subtitle: "6 unidades",
        price: "15,90",
        imageUrl: "https://picsum.photos/200/303",
      },
    ],
  },
  {
    id: 3,
    name: "EXTRA",
    logo: "https://static.gpa.digital/images/ex/logo-ex-new.png",
    products: [
      {
        id: 6,
        title: "Açaí na Tigela",
        subtitle: "500ml com granola",
        price: "19,90",
        imageUrl: "https://picsum.photos/200/304",
      },
      {
        id: 7,
        title: "Coxinha de Frango",
        subtitle: "6 unidades",
        price: "15,90",
        imageUrl: "https://picsum.photos/200/305",
      },
      {
        id: 8,
        title: "Coxinha de Frango",
        subtitle: "6 unidades",
        price: "15,90",
        imageUrl: "https://picsum.photos/200/306",
      },
    ],
  },
];

export default function Home() {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    setMarkets(mockProducts);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white p-4">

       <ScrollView contentContainerStyle={{ padding: 16 }}>

      <View>
        <View style={{ alignItems: "flex-end", marginBottom: 20, paddingHorizontal: 16 }}>
          <FilterButton title="Filtra por..." onPress={() => console.log("Botão de filtro pressionado")} />
        </View>
      </View>

      {markets.map((market) => (
        <View key={market.id} style={{ marginBottom: 20 }}>
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
                title={item.title}
                subtitle={item.subtitle}
                price={item.price}
                imageUrl={item.imageUrl}
                onPress={() => console.log("Selecionado:", item.title)}
                style={{ marginRight: index === market.products.length - 1 ? 0 : 12 }} // último sem margem
              />
            )}
            contentContainerStyle={{ paddingLeft: 4, paddingRight: 16 }} // espaço no início e final
          />
        </View>
      ))}

       </ScrollView>

    </SafeAreaView>
  );
}
