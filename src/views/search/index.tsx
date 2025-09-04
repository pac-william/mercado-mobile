import React, { useState, useEffect } from "react";
import { FlatList, View, Image, SafeAreaView ,ScrollView} from "react-native";
import { Text } from "react-native-paper";
import SearchItens from "../../components/ui/SearchItens";
import HeroBanner from "../../components/ui/Hero";
import CategoriesGrid from "../../components/ui/CategoriesGrid";

export default function Search() {

  return (
    <SafeAreaView className="flex-1 bg-black p-4">

       <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View>
            <View style={{ marginBottom: 12 }}>
            <SearchItens />
            </View>
        </View>

        <View>
            <View style={{ alignItems: "center", marginBottom: 20, paddingHorizontal: 16 }}>
            <HeroBanner />
            </View>
        </View>

        <View >
            <CategoriesGrid />
        </View>

       </ScrollView>

    </SafeAreaView>
  );
}
