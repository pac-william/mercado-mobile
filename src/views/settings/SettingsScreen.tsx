import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SettingsStackParamList } from '../../../App';
import { Header } from "../../components/layout/header";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";
import { useTheme } from "../../contexts/ThemeContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useSession } from "../../hooks/useSession";
import api from "../../services/api";
import { Session, SessionUser } from "../../types/session";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";

type SettingsStackParamListProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {

    const navigation = useNavigation<SettingsStackParamListProp>();
    const { isDark, toggleTheme } = useTheme();
    const paperTheme = useCustomTheme();
    const { user, isAuthenticated, isLoading, refreshSession, clearSession } = useSession();
    const { profile, displayPhoto, loading: loadingProfile, refreshProfile } = useUserProfile();
    const permissions = usePermissions();
    const [refreshing, setRefreshing] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

    const NOTIFICATION_PREFERENCE_KEY = '@notification_preference';

    const loadNotificationPreference = useCallback(async () => {
        try {
            const savedPreference = await AsyncStorage.getItem(NOTIFICATION_PREFERENCE_KEY);
            if (savedPreference !== null) {
                const preference = JSON.parse(savedPreference);
                return preference.enabled === true;
            }
        } catch (error) {
        }
        return false;
    }, []);

    const saveNotificationPreference = useCallback(async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem(NOTIFICATION_PREFERENCE_KEY, JSON.stringify({ enabled }));
        } catch (error) {
        }
    }, []);

    const checkNotificationStatus = useCallback(async () => {
        await permissions.notifications.check();
        const userPreference = await loadNotificationPreference();
        
        if (permissions.notifications.granted && userPreference) {
            setNotificationsEnabled(true);
        } else {
            setNotificationsEnabled(false);
        }
    }, [permissions.notifications, loadNotificationPreference]);

    useEffect(() => {
        if (isAuthenticated) {
            checkNotificationStatus();
            refreshProfile(false);
        }
    }, [isAuthenticated, checkNotificationStatus, refreshProfile]);

    const registerNotificationToken = async (token: string) => {
        try {
            await api.post('/users/notification-token', { token });
        } catch (error) {
        }
    };

    const handleToggleNotifications = async () => {
        if (notificationsEnabled) {
            setNotificationsEnabled(false);
            await saveNotificationPreference(false);
        } else {
            setNotificationsEnabled(true);
            
            const granted = await permissions.notifications.request();
            if (granted) {
                try {
                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    if (tokenData.data) {
                        await registerNotificationToken(tokenData.data);
                    }
                    await saveNotificationPreference(true);
                } catch (error) {
                    setNotificationsEnabled(false);
                    await saveNotificationPreference(false);
                    Alert.alert('Erro', 'Não foi possível registrar o token de notificações.');
                }
            } else {
                setNotificationsEnabled(false);
                await saveNotificationPreference(false);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            refreshSession();
            if (isAuthenticated) {
                refreshProfile(false);
            }
        }, [refreshSession, isAuthenticated, refreshProfile])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshSession();
        if (isAuthenticated) {
            await refreshProfile(true);
        }
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
                            await AsyncStorage.removeItem(NOTIFICATION_PREFERENCE_KEY);
                            await clearSession();
                            await refreshProfile(true);

                            const tabNavigator = navigation.getParent();
                            if (tabNavigator) {
                                tabNavigator.dispatch(
                                    CommonActions.navigate({
                                        name: 'SettingsStack',
                                        params: {
                                            screen: 'SettingsMain',
                                        },
                                    })
                                );
                            }

                            await refreshSession();
                        } catch (error) {
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
                showsVerticalScrollIndicator={true}
                indicatorStyle={paperTheme.dark ? 'white' : 'default'}
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
                        <View style={[styles.profileSection, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
                            <View style={[styles.avatarLarge, { backgroundColor: paperTheme.colors.primary }]}>
                                {displayPhoto ? (
                                    <Image
                                        source={{ uri: displayPhoto }}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text style={[styles.avatarLargeText, { color: paperTheme.colors.onPrimary }]}>
                                        {(profile?.name || user.name).charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.userName, { color: paperTheme.colors.onSurface }]}>
                                {profile?.name || user.name}
                            </Text>
                            <Text style={[styles.userEmail, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
                                {profile?.email || user.email}
                            </Text>
                            {loadingProfile && (
                                <ActivityIndicator
                                    style={{ marginTop: 12 }}
                                    size="small"
                                    color={paperTheme.colors.primary}
                                />
                            )}
                        </View>

                        <View style={[styles.section, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>Conta</Text>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Ionicons name="person-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Editar perfil</Text>
                                <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={handleToggleNotifications}
                                activeOpacity={0.7}
                                disabled={permissions.notifications.loading}
                            >
                                {permissions.notifications.loading ? (
                                    <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                                ) : (
                                    <Ionicons 
                                        name={notificationsEnabled ? "notifications" : "notifications-outline"} 
                                        size={ICON_SIZES.xl} 
                                        color={paperTheme.colors.onSurface} 
                                    />
                                )}
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Notificações</Text>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={handleToggleNotifications}
                                    trackColor={{ false: paperTheme.colors.outline, true: paperTheme.colors.primary }}
                                    thumbColor={paperTheme.colors.surface}
                                    disabled={permissions.notifications.loading}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate('AddressesMain')}
                            >
                                <Ionicons name="location-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Endereços</Text>
                                <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate("Cart")}
                            >
                                <Ionicons name="cart-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Carrinho</Text>
                                <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => navigation.navigate("History")}
                            >
                                <Ionicons name="time-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Histórico de sugestões</Text>
                                <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomWidth: 0 }]} 
                                onPress={() => navigation.navigate("Orders")}
                            >
                                <Ionicons name="receipt-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
                                <Text style={[styles.menuItemText, { color: paperTheme.colors.onSurface }]}>Meus pedidos</Text>
                                <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurface} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.section, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, opacity: 0.6 }]}>Preferências</Text>

                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                                onPress={toggleTheme}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={isDark ? "moon" : "moon-outline"} 
                                    size={ICON_SIZES.xl} 
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
                        </View>

                        <TouchableOpacity
                            style={[styles.logoutButton, { 
                                backgroundColor: paperTheme.colors.surface,
                                borderColor: paperTheme.colors.error,
                                shadowColor: paperTheme.colors.modalShadow
                            }]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={ICON_SIZES.xl} color={paperTheme.colors.error} />
                            <Text style={[styles.logoutButtonText, { color: paperTheme.colors.error }]}>Sair da conta</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.notLoggedIn}>
                        <Ionicons name="person-circle-outline" size={SPACING.xxxl * 2} color={paperTheme.colors.outline} />
                        <Text style={[styles.notLoggedInTitle, { color: paperTheme.colors.onBackground }]}>Você não está logado</Text>
                        <Text style={[styles.notLoggedInText, { color: paperTheme.colors.onSurface, opacity: 0.7 }]}>
                            Faça login para acessar suas configurações e aproveitar todos os recursos do app.
                        </Text>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: paperTheme.colors.primary, shadowColor: paperTheme.colors.modalShadow }]}
                            onPress={handleLogin}
                            disabled={!request}
                        >
                            <Ionicons name="log-in-outline" size={ICON_SIZES.xl} color={paperTheme.colors.onPrimary} />
                            <Text style={[styles.loginButtonText, { color: paperTheme.colors.onPrimary }]}>Fazer login</Text>
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
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxxl * 2 + SPACING.xlBase,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: SPACING.xxl,
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.large,
    },
    avatarLarge: {
        width: SPACING.xxxl * 2,
        height: SPACING.xxxl * 2,
        borderRadius: SPACING.xxxl,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.lg,
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarLargeText: {
        fontSize: FONT_SIZE.displayMd,
        fontWeight: "bold",
    },
    userName: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: "bold",
        marginBottom: SPACING.xs,
    },
    userEmail: {
        fontSize: FONT_SIZE.md,
    },
    section: {
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: SPACING.xs,
        ...SHADOWS.large,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "bold",
        textTransform: "uppercase",
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
    },
    menuItemText: {
        flex: 1,
        fontSize: FONT_SIZE.lg,
        marginLeft: SPACING.lg,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 2,
        ...SHADOWS.large,
    },
    logoutButtonText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "bold",
        marginLeft: SPACING.xs,
    },
    notLoggedIn: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.xxxl * 2 + SPACING.xlBase,
    },
    notLoggedInTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "bold",
        marginTop: SPACING.lg,
        marginBottom: SPACING.xs,
    },
    notLoggedInText: {
        fontSize: FONT_SIZE.md,
        textAlign: "center",
        lineHeight: SPACING.xlBase,
        marginBottom: SPACING.xl,
    },
    loginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: SPACING.md + SPACING.micro,
        paddingHorizontal: SPACING.xxl,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.xs,
        ...SHADOWS.large,
    },
    loginButtonText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "bold",
        marginLeft: SPACING.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SPACING.xxxl * 2 + SPACING.xlBase,
    },
    loadingText: {
        marginTop: SPACING.lg,
        fontSize: FONT_SIZE.lg,
    },
});