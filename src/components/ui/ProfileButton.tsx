import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { HomeStackParamList } from "../../../App";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";

interface ProfileButtonProps {
  buttonStyle?: any;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ buttonStyle }) => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const paperTheme = usePaperTheme();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      usePKCE: true,
    },
    discovery
  );

  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Função para buscar informações do usuário
  const fetchUserInfo = useCallback(async (accessToken: string) => {
    try {
      const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = await userInfoResponse.json();
      setUserInfo(userData);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  // Função para carregar token e informações do usuário
  const loadToken = useCallback(async () => {
    const savedToken = await SecureStore.getItemAsync('authToken') || 
                      await SecureStore.getItemAsync('mercado_mobile_token');
    const savedUserInfo = await SecureStore.getItemAsync('userInfo') || 
                         await SecureStore.getItemAsync('mercado_mobile_user');

    if (savedToken) {
      setToken(savedToken);
      if (savedUserInfo) {
        try {
          setUserInfo(JSON.parse(savedUserInfo));
        } catch (error) {
          console.error('Erro ao parsear userInfo:', error);
          setUserInfo(null);
        }
      } else {
        // Buscar informações do usuário se não estiverem salvas
        await fetchUserInfo(savedToken);
      }
    } else {
      // Se não há token, limpa o estado
      setToken(null);
      setUserInfo(null);
    }
  }, [fetchUserInfo]);

  // Carregar token salvo ao iniciar o app
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Verificar autenticação quando a tela ganha foco (para detectar logout)
  useFocusEffect(
    useCallback(() => {
      loadToken();
    }, [loadToken])
  );

  // Listener de navegação para detectar mudanças (incluindo após logout)
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      // Verificar autenticação quando há mudanças na navegação
      loadToken();
    });

    return unsubscribe;
  }, [navigation, loadToken]);

  // Manipular resposta do login
  useEffect(() => {
    if (response?.type === 'success') {
      const fetchToken = async () => {
        try {
          const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'authorization_code',
              client_id: clientId,
              code: response.params.code,
              redirect_uri: redirectUri,
              code_verifier: request?.codeVerifier,
            }),
          });

          const data = await tokenResponse.json();

          if (data.access_token) {
            setToken(data.access_token);
            await SecureStore.setItemAsync('authToken', data.access_token);
            console.log('Token data:', data);
            // Buscar informações do usuário
            await fetchUserInfo(data.access_token);
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      };

      fetchToken();
    }
  }, [response, request?.codeVerifier, fetchUserInfo]);

  const handlePress = async () => {
    // Verificar diretamente no SecureStore para garantir estado atualizado
    const currentToken = await SecureStore.getItemAsync('authToken') || 
                        await SecureStore.getItemAsync('mercado_mobile_token');
    const currentUserInfo = await SecureStore.getItemAsync('userInfo') || 
                           await SecureStore.getItemAsync('mercado_mobile_user');
    
    // Atualizar estado local
    await loadToken();
    
    if (currentToken && currentUserInfo) {
      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.navigate('SettingsStack' as never);
      }
    } else {
      promptAsync();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, { backgroundColor: paperTheme.colors.surfaceVariant }]}
      onPress={handlePress}
      disabled={!request}
    >
      {token && userInfo ? (
        <View style={[styles.userAvatar, { backgroundColor: paperTheme.colors.primary }]}>
          <Text style={styles.userAvatarText}>
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      ) : (
        <Ionicons name="person-outline" size={24} color={paperTheme.colors.tertiary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
    position: 'relative',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

