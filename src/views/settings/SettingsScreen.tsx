import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { SettingsStackParamList } from '../../../App';
import { Header } from "../../components/layout/header";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";
import { useTheme } from "../../contexts/ThemeContext";
import { useSession } from "../../hooks/useSession";
import api from "../../services/api";
import { Session, SessionUser } from "../../types/session";

type SettingsStackParamListProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {

    const navigation = useNavigation<SettingsStackParamListProp>();
    const { isDark, toggleTheme } = useTheme();
    const paperTheme = usePaperTheme();
    const { user, isAuthenticated, isLoading, refreshSession, clearSession } = useSession();
    const [refreshing, setRefreshing] = useState(false);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: clientId,
            scopes: ['openid', 'profile', 'email', 'offline_access'],
            responseType: AuthSession.ResponseType.Code,
            redirectUri: redirectUri,
            usePKCE: true,
            extraParams: {
                prompt: 'login',
            },
        },
        discovery
    );

    const processedCodesRef = useRef<Set<string>>(new Set());

    const fetchOrCreateUser = useCallback(async (auth0User: SessionUser) => {
        try {
            const auth0Id = auth0User.sub;
            
            try {
                await api.get(`/users/auth0/${auth0Id}`);
            } catch (error: any) {
                if (error.response?.status === 500 || error.response?.status === 404) {
                    const createData = {
                        name: auth0User.name || auth0User.email || '',
                        email: auth0User.email,
                        auth0Id: auth0Id,
                        profilePicture: auth0User.picture || undefined,
                    };

                    await api.post('/users', createData);
                }
            }
        } catch (error) {
        }
    }, []);

    const fetchUserInfo = useCallback(async (accessToken: string, sessionData?: Partial<Session>) => {
        try {
            const response = await axios.get(`https://${auth0Domain}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userData = response.data as SessionUser;

            if (userData.sub) {
                await fetchOrCreateUser(userData);
            }

            if (sessionData) {
                const updatedSession: Session = {
                    ...sessionData,
                    user: userData,
                } as Session;
                await SecureStore.setItemAsync('session', JSON.stringify(updatedSession));
            }
        } catch (error) {
        }
    }, [fetchOrCreateUser]);

    useEffect(() => {
        if (response?.type === 'success' && 'params' in response && response.params && 'code' in response.params) {
            const code = (response.params as any).code;
            
            if (processedCodesRef.current.has(code)) {
                return;
            }

            processedCodesRef.current.add(code);

            const fetchToken = async () => {
                try {
                    const tokenResponse = await axios.post(
                        `https://${auth0Domain}/oauth/token`,
                        new URLSearchParams({
                            grant_type: 'authorization_code',
                            client_id: clientId,
                            code: code,
                            redirect_uri: redirectUri,
                            code_verifier: request?.codeVerifier || '',
                        }).toString(),
                        {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        }
                    );

                    const data = tokenResponse.data;

                    if (data.id_token && data.access_token) {
                        const now = Math.floor(Date.now() / 1000);
                        const expiresAt = data.expires_in ? now + data.expires_in : now + 3600;
                        const sid = data.id_token ? data.id_token.substring(0, 32) : `sid_${now}`;

                        const session: Partial<Session> = {
                            tokenSet: {
                                accessToken: data.access_token,
                                idToken: data.id_token,
                                scope: data.scope || 'openid profile email offline_access',
                                requestedScope: data.scope || 'openid profile email offline_access',
                                refreshToken: data.refresh_token || '',
                                expiresAt: expiresAt,
                            },
                            internal: {
                                sid: sid,
                                createdAt: now,
                            },
                            exp: expiresAt,
                        };

                        await fetchUserInfo(data.access_token, session);
                        await refreshSession();
                    }
                } catch (error) {
                }
            };

            fetchToken();
        }
    }, [response, request?.codeVerifier, fetchUserInfo, refreshSession]);

    // Verificar autenticação quando a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            refreshSession();
        }, [refreshSession])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshSession();
        setRefreshing(false);
    };

    const handleLogin = async () => {
        if (!request) {
            return;
        }

        try {
            const result = await promptAsync();

            if (result?.type === 'success' && 'params' in result && result.params && 'code' in result.params) {
                const code = (result.params as any).code;

                if (processedCodesRef.current.has(code)) {
                    return;
                }

                processedCodesRef.current.add(code);

                try {
                    const tokenResponse = await axios.post(
                        `https://${auth0Domain}/oauth/token`,
                        new URLSearchParams({
                            grant_type: 'authorization_code',
                            client_id: clientId,
                            code: code,
                            redirect_uri: redirectUri,
                            code_verifier: request?.codeVerifier || '',
                        }).toString(),
                        {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        }
                    );

                    const data = tokenResponse.data;

                    if (data.id_token && data.access_token) {
                        const now = Math.floor(Date.now() / 1000);
                        const expiresAt = data.expires_in ? now + data.expires_in : now + 3600;
                        const sid = data.id_token ? data.id_token.substring(0, 32) : `sid_${now}`;

                        const session: Partial<Session> = {
                            tokenSet: {
                                accessToken: data.access_token,
                                idToken: data.id_token,
                                scope: data.scope || 'openid profile email offline_access',
                                requestedScope: data.scope || 'openid profile email offline_access',
                                refreshToken: data.refresh_token || '',
                                expiresAt: expiresAt,
                            },
                            internal: {
                                sid: sid,
                                createdAt: now,
                            },
                            exp: expiresAt,
                        };

                        await fetchUserInfo(data.access_token, session);
                        await refreshSession();
                    }
                } catch (error) {
                }
            }
        } catch (error) {
        }
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
                            // Limpar a sessão usando o hook
                            await clearSession();

                            // Tentar fazer logout no Auth0 (opcional, pode falhar se não houver conexão)
                            try {
                                const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(redirectUri)}`;
                                await WebBrowser.openBrowserAsync(logoutUrl);
                            } catch (logoutError) {
                                // Ignora erro do logout do Auth0, o importante é limpar localmente
                                console.warn("Erro ao fazer logout no Auth0:", logoutError);
                            }

                            // Navegar para a página principal (Home)
                            try {
                                // Tenta navegar via tab navigator (pai direto)
                                const tabNavigator = navigation.getParent();
                                if (tabNavigator) {
                                    tabNavigator.dispatch(
                                        CommonActions.navigate({
                                            name: 'HomeStack',
                                            params: {
                                                screen: 'HomeMain',
                                            },
                                        })
                                    );
                                }
                            } catch (navError) {
                                console.warn("Erro ao navegar para Home:", navError);
                            }

                            // Recarregar para atualizar a UI
                            await refreshSession();
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
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                        <Text style={[styles.loadingText, { color: paperTheme.colors.onSurface }]}>
                            Verificando autenticação...
                        </Text>
                    </View>
                ) : isAuthenticated && user ? (
                    <>
                        <View style={[styles.profileSection, { backgroundColor: paperTheme.colors.surface }]}>
                            <View style={[styles.avatarLarge, { backgroundColor: paperTheme.colors.primary }]}>
                                <Text style={styles.avatarLargeText}>
                                    {user.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={[styles.userName, { color: paperTheme.colors.onSurface }]}>{user.name}</Text>
                            <Text style={[styles.userEmail, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>{user.email}</Text>
                        </View>

                        <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>Conta</Text>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
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
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: paperTheme.colors.primary }]}
                            onPress={handleLogin}
                            disabled={!request}
                        >
                            <Ionicons name="log-in-outline" size={24} color="white" />
                            <Text style={styles.loginButtonText}>Fazer login</Text>
                        </TouchableOpacity>
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
        marginBottom: 24,
    },
    loginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
});