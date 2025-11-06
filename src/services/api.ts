import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { Session } from "../types/session";
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
      // Busca o session e extrai o idToken
      const sessionString = await SecureStore.getItemAsync('session');


      if (sessionString) {
        try {
          const session = JSON.parse(sessionString) as Session;
          const idToken = session.tokenSet?.idToken;

          console.log('idToken', idToken);

          if (idToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${idToken}`;
          }
        } catch (parseError) {
          // Erro ao fazer parse do session
        }
      }
    } catch (error) {
      // Erro ao buscar session
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
