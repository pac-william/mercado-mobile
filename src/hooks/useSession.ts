import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Session, SessionUser } from '../types/session';

interface UseSessionReturn {
  user: SessionUser | null;
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
        } catch (parseError) {
          console.error('Erro ao fazer parse da sessão:', parseError);
          setSession(null);
        }
      } else {
        setSession(null);
      }
    } catch (error) {
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
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    user: session?.user || null,
    token: session?.tokenSet?.idToken || null,
    session,
    isLoading,
    isAuthenticated: !!(session?.user && session?.tokenSet?.idToken),
    refreshSession,
    clearSession,
  };
};

