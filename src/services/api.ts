import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { apiBaseUrl } from "../utils/server";

const api = axios.create({
  baseURL: `${apiBaseUrl}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Busca ID token primeiro (se disponível)
      let token = await SecureStore.getItemAsync('mercado_mobile_id_token');

      // Se não tiver ID token, busca o token normal
      if (!token) {
        token = await SecureStore.getItemAsync('mercado_mobile_token');
      }

      // Se ainda não tiver, tenta buscar do authToken (compatibilidade com ProfileButton)
      if (!token) {
        token = await SecureStore.getItemAsync('authToken');
      }

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.request && !error.response) {
      error.isNetworkError = true;
      error.networkError = true;
      if (!error.message || error.message.includes('axios')) {
        error.message = 'Network Error - Sem conexão com a internet';
      }
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      error.isNetworkError = true;
      error.networkError = true;
      if (!error.message || error.message.includes('axios')) {
        error.message = 'Network Error - Timeout na conexão';
      }
    }

    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      error.isNetworkError = true;
      error.networkError = true;
      if (!error.message || error.message.includes('axios')) {
        error.message = 'Network Error - Não foi possível conectar ao servidor';
      }
    }

    return Promise.reject(error);
  }
);

// para testar a api no mobile a URL tem que ser a http://10.0.2.2:8080 não pode ser http://localhost:8080

export default api;
