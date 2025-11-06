import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { HomeStackParamList } from "../../../App";
import { auth0Domain, clientId, discovery, redirectUri } from "../../config/auth0";
import api from "../../services/api";
import { Session, SessionUser } from "../../types/session";
import { User } from "../../types/user";

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
  const processedCodesRef = useRef<Set<string>>(new Set());

  const fetchOrCreateUser = useCallback(async (auth0User: SessionUser) => {
    try {
      const auth0Id = auth0User.sub;
      
      try {
        const response = await api.get(`/users/auth0/${auth0Id}`);
        const backendUser = response.data as User;
        await SecureStore.setItemAsync('userInfo', JSON.stringify(backendUser));
      } catch (error: any) {
        if (error.response?.status === 500 || error.response?.status === 404) {
          const createData = {
            name: auth0User.name || auth0User.email || '',
            email: auth0User.email,
            auth0Id: auth0Id,
            profilePicture: auth0User.picture || undefined,
          };

          const createResponse = await api.post('/users', createData);
          const newUser = createResponse.data as User;
          await SecureStore.setItemAsync('userInfo', JSON.stringify(newUser));
        } else {
          console.error('Error fetching/creating user:', error);
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateUser:', error);
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
      setUserInfo(userData);

      if (sessionData) {
        const updatedSession: Session = {
          ...sessionData,
          user: userData,
        } as Session;
        await SecureStore.setItemAsync('session', JSON.stringify(updatedSession));
      }

      if (userData.sub) {
        await fetchOrCreateUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, [fetchOrCreateUser]);

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
        const tokenToUse = accessToken || idToken;
        if (tokenToUse) {
          await fetchUserInfo(tokenToUse);
        }
      }
    } else {
      setToken(null);
      setUserInfo(null);
    }
  }, [fetchUserInfo]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useFocusEffect(
    useCallback(() => {
      loadToken();
    }, [loadToken])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      loadToken();
    });

    return unsubscribe;
  }, [navigation, loadToken]);

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

            await SecureStore.setItemAsync('session', JSON.stringify(session));

            await fetchUserInfo(data.access_token, session);
            setToken(data.id_token);
          }
        } catch (error: any) {
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

              await SecureStore.setItemAsync('session', JSON.stringify(session));

              await fetchUserInfo(data.access_token, session);
              setToken(data.id_token);
            }
          } catch (error: any) {
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

