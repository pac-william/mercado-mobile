import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Session } from '../types/session';
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
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionString = await SecureStore.getItemAsync('session');
      
      if (sessionString) {
        try {
          const parsedSession = JSON.parse(sessionString) as Session;
          setSession(parsedSession);
        } catch (parseError: unknown) {
          console.error('Erro ao fazer parse da sessão:', parseError);
          setSession(null);
        }
      } else {
        setSession(null);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar sessão:', error);
      setSession(null);
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
      setSession(null);
      setIsLoading(false);
    } catch (error: unknown) {
      console.error('Erro ao limpar sessão:', error);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const user = useMemo<User | null>(() => {
    if (!session?.user) return null;
    return {
      id: session.user.sub,
      name: session.user.name,
      email: session.user.email,
      profilePicture: session.user.picture,
      auth0Id: session.user.sub,
    } as User;
  }, [session?.user]);

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

