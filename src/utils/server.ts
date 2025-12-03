
const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const DEV_IP = "10.0.0.174";
  
  return __DEV__ 
    ? `http://${DEV_IP}:8080`
    : "http://localhost:8080";
};

export const apiBaseUrl = getApiBaseUrl();