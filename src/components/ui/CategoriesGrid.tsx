import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import CategorySmallCard from "./CategorySmallCard";
import { getMarkets } from "../../services/marketService";
import { Market } from "../../domain/marketDomain";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../App";
import { SPACING } from "../../constants/styles";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useResponsive } from "../../hooks/useResponsive";
import { useLoading } from "../../hooks/useLoading";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const cardMargin = SPACING.lg;
const numColumns = 2;

const CategoriesGrid = () => {
    const paperTheme = useCustomTheme();
    const { width } = useResponsive();
    const [markets, setMarkets] = useState<Market[]>([]);
    const { loading, execute } = useLoading({ initialValue: true });
    const cardWidth = (width - cardMargin * (numColumns + 1)) / numColumns;

    const navigation = useNavigation<HomeScreenNavigationProp>();

    useEffect(() => {
        const fetchMarkets = async () => {
            execute(async () => {
                try {
                    const response = await getMarkets(1, 50);
                    setMarkets(response.markets);
                } catch (error) {
                    console.error("Erro ao buscar mercados:", error);
                }
            });
        };

        fetchMarkets();
    }, [execute]);

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
                    <View style={[styles.card, { width: cardWidth }]}>
                        <CategorySmallCard
                            name={item.name}
                            image={item.profilePicture || ""}
                            subtitle={item.address}
                            onPress={() => navigation.navigate("MarketDetails", { marketId: item.id })}
                        />
                    </View>
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.lg,
        flex: 1,
    },
    list: {
        paddingBottom: SPACING.xxxl * 2 + SPACING.xlBase,
        justifyContent: 'center',
    },
    loadingContainer: {
        marginTop: SPACING.lg,
        alignItems: "center",
        justifyContent: 'center',
        flex: 1,
    },
    card: {
        margin: cardMargin / 2,
    }
});

export default CategoriesGrid;