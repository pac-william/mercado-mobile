import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme as usePaperTheme } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Header } from "../../components/layout/header";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackParamList } from '../../../App';

type SettingsStackParamListProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {

    const navigation = useNavigation<SettingsStackParamListProp>();
    const { state, logout, restoreToken } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const paperTheme = usePaperTheme();
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
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <Header />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[paperTheme.colors.primary]}
                        tintColor={paperTheme.colors.primary}
                    />
                }
            >
                {state.isAuthenticated && state.user ? (
                    <>
                        <View style={[styles.profileSection, { backgroundColor: paperTheme.colors.surface }]}>
                            <View style={[styles.avatarLarge, { backgroundColor: paperTheme.colors.primary }]}>
                                <Text style={styles.avatarLargeText}>
                                    {state.user.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={[styles.userName, { color: paperTheme.colors.onSurface }]}>{state.user.name}</Text>
                            <Text style={[styles.userEmail, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>{state.user.email}</Text>
                        </View>

                        <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>Conta</Text>

                            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}>
                                <Ionicons name="person-outline" size={24} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Editar perfil</Text>
                                <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}>
                                <Ionicons name="notifications-outline" size={24} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Notificações</Text>
                                <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate('AddressesMain')}
                            >
                                <Ionicons name="location-outline" size={24} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Endereços</Text>
                                <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]} 
                                onPress={() => navigation.navigate("Orders")}
                            >
                                <Ionicons name="receipt-outline" size={24} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Meus pedidos</Text>
                                <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>Preferências</Text>

                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={toggleTheme}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={isDark ? "moon" : "moon-outline"} 
                                    size={24} 
                                    color={paperTheme.colors.onSurface} 
                                />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>
                                    Tema escuro
                                </Text>
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: paperTheme.colors.outline, true: paperTheme.colors.primary }}
                                    thumbColor={paperTheme.colors.surface}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}>
                                <Ionicons name="language-outline" size={24} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Idioma</Text>
                                <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.logoutButton, { 
                                backgroundColor: paperTheme.colors.surface,
                                borderColor: paperTheme.colors.error 
                            }]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color={paperTheme.colors.error} />
                            <Text style={[styles.logoutButtonText, { color: paperTheme.colors.error }]}>Sair da conta</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.notLoggedIn}>
                        <Ionicons name="person-circle-outline" size={80} color={paperTheme.colors.outline} />
                        <Text style={[styles.notLoggedInTitle, { color: paperTheme.colors.onBackground }]}>Você não está logado</Text>
                        <Text style={[styles.notLoggedInText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
                            Faça login para acessar suas configurações e aproveitar todos os recursos do app.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    section: {
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
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 32,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "bold",
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
        marginTop: 16,
        marginBottom: 8,
    },
    notLoggedInText: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});