import axios from "axios";
import { getToken, getIdToken } from "../utils/storage";

const api = axios.create({
  baseURL: "http://10.0.0.180:8080/api/v1", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
 
      let token = await getIdToken();

      
      
      if (!token) {
        token = await getToken();
      }
      
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Não foi possível buscar token:', error);
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
