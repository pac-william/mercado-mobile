import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { HomeStackParamList } from "../../../App";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";
import { Session, SessionUser } from "../../types/session";

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
      extraParams: {
        prompt: 'login',
      },
    },
    discovery
  );

  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);


  // Função para buscar informações do usuário e atualizar a sessão
  const fetchUserInfo = useCallback(async (accessToken: string, sessionData?: Partial<Session>) => {
    try {
      const response = await axios.get(`https://${auth0Domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = response.data as SessionUser;
      setUserInfo(userData);

      // Se já temos uma sessão parcial, atualiza com os dados do usuário
      if (sessionData) {
        const updatedSession: Session = {
          ...sessionData,
          user: userData,
        } as Session;
        await SecureStore.setItemAsync('session', JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  // Função para carregar token e informações do usuário
  const loadToken = useCallback(async () => {
    const sessionString = await SecureStore.getItemAsync('session');

    let idToken: string | null = null;
    let accessToken: string | null = null;
    let user: SessionUser | null = null;

    if (sessionString) {
      try {
        const session = JSON.parse(sessionString) as Session;
        idToken = session.tokenSet?.idToken || null;
        accessToken = session.tokenSet?.accessToken || null;
        user = session.user || null;
      } catch (error) {
        console.error('Erro ao parsear session:', error);
      }
    }

    if (idToken) {
      setToken(idToken);
      if (user) {
        setUserInfo(user);
      } else {
        // Buscar informações do usuário se não estiverem salvas
        // Usa access_token do session se disponível, senão usa o id_token
        const tokenToUse = accessToken || idToken;
        if (tokenToUse) {
          await fetchUserInfo(tokenToUse);
        }
      }
    } else {
      // Se não há token, limpa o estado e a sessão
      setToken(null);
      setUserInfo(null);
      // Não chamar clearSession aqui para evitar loops - será detectado pelo hook useSession
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
          const authResponse = response;
          const tokenResponse = await axios.post(`https://${auth0Domain}/oauth/token`, {
            grant_type: 'authorization_code',
            client_id: clientId,
            code: authResponse.params.code,
            redirect_uri: redirectUri,
            code_verifier: request?.codeVerifier,
          }, {
            headers: { 'Content-Type': 'application/json' },
          });

          const data = tokenResponse.data;

          if (data.id_token) {
            setToken(data.id_token);

            // Construir a estrutura de sessão
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = data.expires_in ? now + data.expires_in : now + 3600;
            const sid = data.id_token ? data.id_token.substring(0, 32) : `sid_${now}`;

            const session: Partial<Session> = {
              tokenSet: {
                accessToken: data.access_token || '',
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

            // Salvar sessão parcial primeiro
            await SecureStore.setItemAsync('session', JSON.stringify(session));

            // Usa access_token para buscar userInfo (Auth0 requer access_token para /userinfo)
            if (data.access_token) {
              await fetchUserInfo(data.access_token, session);
            }
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      };

      fetchToken();
    }
  }, [response, request?.codeVerifier, fetchUserInfo]);

  const handlePress = async () => {
    const sessionString = await SecureStore.getItemAsync('session');
    let currentToken: string | null = null;
    let currentUser: SessionUser | null = null;

    if (sessionString) {
      try {
        const session = JSON.parse(sessionString) as Session;
        currentToken = session.tokenSet?.idToken || null;
        currentUser = session.user || null;
      } catch (error) {
        // Erro ao parsear session
      }
    }

    await loadToken();

    if (currentToken && currentUser) {
      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.navigate('SettingsStack' as never);
      }
    } else {
      if (!request) {
        return;
      }

      try {
        const result = await promptAsync();

        if (result?.type === 'success' && 'params' in result && result.params && 'code' in result.params) {
          const code = (result.params as any).code;

          try {
            const tokenResponse = await axios.post(`https://${auth0Domain}/oauth/token`, {
              grant_type: 'authorization_code',
              client_id: clientId,
              code: code,
              redirect_uri: redirectUri,
              code_verifier: request?.codeVerifier,
            }, {
              headers: { 'Content-Type': 'application/json' },
            });

            const data = tokenResponse.data;

            if (data.id_token) {
              setToken(data.id_token);

              // Construir a estrutura de sessão
              const now = Math.floor(Date.now() / 1000);
              const expiresAt = data.expires_in ? now + data.expires_in : now + 3600;
              const sid = data.id_token ? data.id_token.substring(0, 32) : `sid_${now}`;

              const session: Partial<Session> = {
                tokenSet: {
                  accessToken: data.access_token || '',
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

              // Salvar sessão parcial primeiro
              await SecureStore.setItemAsync('session', JSON.stringify(session));

              // Usa access_token para buscar userInfo (Auth0 requer access_token para /userinfo)
              if (data.access_token) {
                await fetchUserInfo(data.access_token, session);
              }
            }
          } catch (error) {
            console.error('Error fetching token:', error);
          }
        }
      } catch (error) {
        console.error('Error calling promptAsync:', error);
      }
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
          {userInfo.picture ? <Image source={{ uri: userInfo.picture }} style={styles.userAvatar} /> : (
            <Text style={styles.userAvatarText}>
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          )}
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

