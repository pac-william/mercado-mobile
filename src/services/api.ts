import axios from "axios";

const api = axios.create({
  baseURL: "http://10.0.2.2:8080/api/v1", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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

    return Promise.reject(error);
  }
);

// para testar a api no mobile a URL tem que ser a http://10.0.2.2:8080 não pode ser http://localhost:8080

export default api;
