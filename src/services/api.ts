import axios from "axios";

const api = axios.create({
  baseURL: "https://eeb941b2d0e9.ngrok-free.app/api/v1", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
