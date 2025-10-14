import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@mercado_mobile:token";
const USER_KEY = "@mercado_mobile:user";

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
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return token;
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

export const saveUser = async (user: { id: string; name: string; email: string }): Promise<void> => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Erro ao salvar dados do usuário:", error);
        throw error;
    }
};

export const getUser = async (): Promise<{ id: string; name: string; email: string } | null> => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
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

export const clearStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
        console.error("Erro ao limpar storage:", error);
        throw error;
    }
};



