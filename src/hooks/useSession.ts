import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Session, SessionUser } from '../types/session';
import { User } from '../types/user';

interface UseSessionReturn {
  user: User | null;
  token: string | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionString = await SecureStore.getItemAsync('session');
      const userInfoString = await SecureStore.getItemAsync('userInfo');
      
      if (sessionString) {
        try {
          const parsedSession = JSON.parse(sessionString) as Session;
          setSession(parsedSession);
        } catch (parseError) {
          console.error('Erro ao fazer parse da sessão:', parseError);
          setSession(null);
        }
      } else {
        setSession(null);
      }

      if (userInfoString) {
        try {
          const parsedUser = JSON.parse(userInfoString) as User;
          setBackendUser(parsedUser);
        } catch (parseError) {
          console.error('Erro ao fazer parse do userInfo:', parseError);
          setBackendUser(null);
        }
      } else {
        setBackendUser(null);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      setSession(null);
      setBackendUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const clearSession = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('session');
      await SecureStore.deleteItemAsync('userInfo');
      setSession(null);
      setBackendUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const user = backendUser || (session?.user ? {
    id: session.user.sub,
    name: session.user.name,
    email: session.user.email,
    profilePicture: session.user.picture,
    auth0Id: session.user.sub,
  } as User : null);

  return {
    user: user,
    token: session?.tokenSet?.idToken || null,
    session,
    isLoading,
    isAuthenticated: !!(session?.user && session?.tokenSet?.idToken),
    refreshSession,
    clearSession,
  };
};

