import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// export const API_BASE_URL = "http://192.168.88.139:5000"; // ⚠️ đúng địa chỉ IP máy chạy Node
export const API_BASE_URL = "http://192.168.1.81:5000"; // ⚠️ đúng địa chỉ IP máy chạy Node

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
