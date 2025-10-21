import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/layout/header";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../../App";

export default function SettingsScreen() {
    const { state, logout, restoreToken } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await restoreToken();
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            "Sair da conta",
            "Deseja realmente sair da sua conta?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sair",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error("Erro ao fazer logout:", error);
                            Alert.alert("Erro", "Não foi possível sair da conta.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#FF4500"]}
                        tintColor="#FF4500"
                    />
                }
            >
                {state.isAuthenticated && state.user ? (
                    <>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarLarge}>
                                <Text style={styles.avatarLargeText}>
                                    {state.user.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.userName}>{state.user.name}</Text>
                            <Text style={styles.userEmail}>{state.user.email}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Conta</Text>
                            
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Ionicons name="person-outline" size={24} color="#666" />
                                <Text style={styles.menuItemText}>Editar perfil</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="notifications-outline" size={24} color="#666" />
                                <Text style={styles.menuItemText}>Notificações</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="location-outline" size={24} color="#666" />
                                <Text style={styles.menuItemText}>Endereços</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Preferências</Text>
                            
                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="moon-outline" size={24} color="#666" />
                                <Text style={styles.menuItemText}>Tema escuro</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="language-outline" size={24} color="#666" />
                                <Text style={styles.menuItemText}>Idioma</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
                            <Text style={styles.logoutButtonText}>Sair da conta</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.notLoggedIn}>
                        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
                        <Text style={styles.notLoggedInTitle}>Você não está logado</Text>
                        <Text style={styles.notLoggedInText}>
                            Faça login para acessar suas configurações e aproveitar todos os recursos do app.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 32,
        backgroundColor: "white",
        marginTop: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FF4500",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    avatarLargeText: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
    },
    section: {
        backgroundColor: "white",
        marginTop: 16,
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#999",
        textTransform: "uppercase",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        marginTop: 24,
        marginBottom: 32,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#d32f2f",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#d32f2f",
        marginLeft: 8,
    },
    notLoggedIn: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 100,
    },
    notLoggedInTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#666",
        marginTop: 16,
        marginBottom: 8,
    },
    notLoggedInText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        lineHeight: 20,
    },
});

