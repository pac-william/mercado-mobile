import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSession } from '../hooks/useSession';
import api from '../services/api';
import { getUserMe } from '../services/userService';
import { User } from '../types/user';

const PROFILE_CACHE_KEY = '@user_profile_cache_v1';
const PROFILE_CACHE_TS_KEY = '@user_profile_cache_ts_v1';
const PROFILE_LOCAL_PHOTO_KEY = '@user_profile_local_photo_v1';
const PROFILE_LOCAL_PHOTO_TS_KEY = '@user_profile_local_photo_ts_v1';

const PROFILE_CACHE_TTL = 1000 * 60 * 5; // 5 minutos
const LOCAL_PHOTO_TTL = 1000 * 60 * 60 * 12; // 12 horas

interface UserProfileContextValue {
  profile: User | null;
  displayPhoto: string | null;
  localPhoto: string | null;
  loading: boolean;
  refreshProfile: (force?: boolean) => Promise<void>;
  setLocalPhoto: (photo: string | null) => Promise<void>;
  applyProfileUpdate: (updatedUser: User) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

const removeStorageKeys = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {

  }
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user: sessionUser, isAuthenticated } = useSession();
  const [profile, setProfile] = useState<User | null>(null);
  const [localPhoto, setLocalPhotoState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const loadCachedData = useCallback(async () => {
    try {
      const entries = await AsyncStorage.multiGet([
        PROFILE_CACHE_KEY,
        PROFILE_CACHE_TS_KEY,
        PROFILE_LOCAL_PHOTO_KEY,
        PROFILE_LOCAL_PHOTO_TS_KEY,
      ]);

      const cacheMap = Object.fromEntries(entries);
      if (cacheMap[PROFILE_CACHE_KEY]) {
        try {
          setProfile(JSON.parse(cacheMap[PROFILE_CACHE_KEY] as string));
        } catch {
          setProfile(null);
        }
      }

      if (cacheMap[PROFILE_CACHE_TS_KEY]) {
        lastFetchRef.current = Number(cacheMap[PROFILE_CACHE_TS_KEY]);
      }

      if (cacheMap[PROFILE_LOCAL_PHOTO_KEY]) {
        const ts = Number(cacheMap[PROFILE_LOCAL_PHOTO_TS_KEY]);
        if (!ts || Date.now() - ts < LOCAL_PHOTO_TTL) {
          setLocalPhotoState(cacheMap[PROFILE_LOCAL_PHOTO_KEY] as string);
        } else {
          await removeStorageKeys([PROFILE_LOCAL_PHOTO_KEY, PROFILE_LOCAL_PHOTO_TS_KEY]);
        }
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  const setLocalPhoto = useCallback(async (photo: string | null) => {
    setLocalPhotoState(photo);
    if (photo) {
      const now = Date.now().toString();
      await AsyncStorage.multiSet([
        [PROFILE_LOCAL_PHOTO_KEY, photo],
        [PROFILE_LOCAL_PHOTO_TS_KEY, now],
      ]);
    } else {
      await removeStorageKeys([PROFILE_LOCAL_PHOTO_KEY, PROFILE_LOCAL_PHOTO_TS_KEY]);
    }
  }, []);

  const applyProfileUpdate = useCallback(
    async (updatedUser: User) => {
      setProfile(updatedUser);
      const now = Date.now();
      lastFetchRef.current = now;
      await AsyncStorage.multiSet([
        [PROFILE_CACHE_KEY, JSON.stringify(updatedUser)],
        [PROFILE_CACHE_TS_KEY, now.toString()],
      ]);
    },
    [],
  );

  const fetchProfile = useCallback(async () => {
    const backendUser = await getUserMe();
    await applyProfileUpdate(backendUser);
  }, [applyProfileUpdate]);

  const refreshProfile = useCallback(
    async (force = false) => {
      if (!isAuthenticated) {
        setProfile(null);
        setLocalPhotoState(null);
        lastFetchRef.current = 0;
        await removeStorageKeys([
          PROFILE_CACHE_KEY,
          PROFILE_CACHE_TS_KEY,
          PROFILE_LOCAL_PHOTO_KEY,
          PROFILE_LOCAL_PHOTO_TS_KEY,
        ]);
        return;
      }

      const now = Date.now();
      if (!force && lastFetchRef.current && now - lastFetchRef.current < PROFILE_CACHE_TTL) {
        return;
      }

      setLoading(true);
      try {
        await fetchProfile();
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404 && session?.user) {
          const payload = {
            name: session.user.name || session.user.email || '',
            email: session.user.email,
            auth0Id: session.user.sub,
            profilePicture: session.user.picture || undefined,
          };
          try {
            await api.post('/users', payload);
            await fetchProfile();
          } catch {

          }
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchProfile, isAuthenticated, session?.user],
  );

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        refreshProfile(true);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setProfile(null);
      setLocalPhotoState(null);
      lastFetchRef.current = 0;
    }
  }, [isAuthenticated, refreshProfile]);

  const displayPhoto = useMemo(() => {
    const sessionPhoto =
      session?.user?.picture ||
      (sessionUser?.profilePicture ? sessionUser.profilePicture : undefined);
    return localPhoto || profile?.profilePicture || sessionPhoto || null;
  }, [localPhoto, profile?.profilePicture, session?.user?.picture, sessionUser?.profilePicture]);

  const value = useMemo(
    () => ({
      profile,
      displayPhoto,
      localPhoto,
      loading,
      refreshProfile,
      setLocalPhoto,
      applyProfileUpdate,
    }),
    [applyProfileUpdate, displayPhoto, localPhoto, loading, profile, refreshProfile, setLocalPhoto],
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = (): UserProfileContextValue => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile deve ser usado dentro de UserProfileProvider');
  }
  return context;
};


