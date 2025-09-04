import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import CategorySmallCard from "./CategorySmallCard";

const categories = [
  {
    id: "1",
    name: "BH",
    image: "https://www.supermercadosbh.com.br/wp-content/themes/supermercadosbh/assets/images/logo-bh-white.png",
  },
  {
    id: "2",
    name: "EXTRA",
    image: "https://static.gpa.digital/images/ex/logo-ex-new.png",
  },
  {
    id: "3",
    name: "BAHAMAS",
    image: "https://bahamas.com.br/wp-content/uploads/2024/09/Logo-Grupo-Bahamas.png",
  },
  {
    id: "4",
    name: "ARMAÇÃO",
    image: "https://tse4.mm.bing.net/th/id/OIP.U92d4Od0ac2gwsNdDXRpHgHaHa?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "5",
    name: "ECONOMART",
    image: "https://tse3.mm.bing.net/th/id/OIP.j0Qiu-2fN0HaAG_L5BqUZwHaBo?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "6",
    name: "ASSAÍ",
    image: "https://th.bing.com/th/id/R.d99168730bf190bede3fb14e9faf7fb8?rik=%2bOTrsDJnh5%2b4sQ&riu=http%3a%2f%2f3.bp.blogspot.com%2f_f2gyqDwRrOA%2fS6ZmTxgbNBI%2fAAAAAAAADH8%2fNAXIZdLwIr4%2fw1200-h630-p-k-no-nu%2fAssai_mktmais_logo.png&ehk=2KHAO8LYEY%2btWfwjHe3eVNuhjfa6d%2frS%2bIIYhgCAY%2fs%3d&risl=&pid=ImgRaw&r=0",
  },
  {
    id: "5",
    name: "BET 365",
    image: "https://logos-world.net/wp-content/uploads/2024/10/Bet365-Logo.png",
  },
  {
    id: "5",
    name: "LEVATE",
    image: "https://tse1.mm.bing.net/th/id/OIP.MBMsK8xrCiQkQplvPEhUDgHaHa?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

const CategoriesGrid = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        numColumns={2} // garante 2 cards por linha
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategorySmallCard
            name={item.name}
            image={item.image}
            onPress={() => console.log("Clicou em", item.name)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  list: {
    paddingBottom: 100,
  },
});

export default CategoriesGrid;
