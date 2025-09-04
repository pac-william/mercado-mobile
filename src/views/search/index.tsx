import React, { useState, useEffect } from "react";
import { FlatList, View, Image, SafeAreaView ,ScrollView} from "react-native";
import { Text } from "react-native-paper";
import SearchItens from "../../components/ui/SearchItens";

export default function Search() {

  return (
    <SafeAreaView className="flex-1 bg-black p-4">

       <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View>
            <View style={{ marginBottom: 12 }}>
            <SearchItens />
            </View>
        </View>

       </ScrollView>

    </SafeAreaView>
  );
}
