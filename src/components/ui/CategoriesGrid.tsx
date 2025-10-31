import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import CategorySmallCard from "./CategorySmallCard";
import { getMarkets } from "../../services/marketService";
import { Market } from "../../domain/marketDomain";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../App";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const { width } = Dimensions.get('window');
const cardMargin = 16;
const numColumns = 2;
const cardWidth = (width - cardMargin * (numColumns + 1)) / numColumns;

const CategoriesGrid = () => {
    const paperTheme = useTheme();
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation<HomeScreenNavigationProp>();

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                setLoading(true);
                const response = await getMarkets(1, 50); // Fetch up to 50 markets
                setMarkets(response.markets);
            } catch (error) {
                console.error("Erro ao buscar mercados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={markets}
                numColumns={numColumns}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CategorySmallCard
                        name={item.name}
                        image={item.profilePicture}
                        subtitle={item.address}
                        onPress={() => navigation.navigate("MarketDetails", { marketId: item.id })}
                        style={styles.card}
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
        flex: 1,
    },
    list: {
        paddingBottom: 100,
        justifyContent: 'center',
    },
    loadingContainer: {
        marginTop: 16,
        alignItems: "center",
        justifyContent: 'center',
        flex: 1,
    },
    card: {
        width: cardWidth,
        margin: cardMargin / 2,
    }
});

export default CategoriesGrid;