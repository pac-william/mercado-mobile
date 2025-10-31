import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../contexts/AuthContext";

const TOKEN_KEY = "@mercado_mobile:token";
const REFRESH_TOKEN_KEY = "@mercado_mobile:refresh_token";
const USER_KEY = "@mercado_mobile:user";

// -------------------- TOKEN --------------------

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao buscar token:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao remover token:", error);
    throw error;
  }
};

// -------------------- REFRESH TOKEN --------------------

export const saveRefreshToken = async (token: string) => {
  await AsyncStorage.setItem("refreshToken", token);
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem("refreshToken");
};

export const removeRefreshToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao remover refresh token:", error);
    throw error;
  }
};

// -------------------- USER --------------------

export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Erro ao salvar dados do usuário:", error);
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    const user = JSON.parse(userData) as User;
    return user;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Erro ao remover dados do usuário:", error);
    throw error;
  }
};

// -------------------- CLEAR --------------------

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.error("Erro ao limpar storage:", error);
    throw error;
  }
};
