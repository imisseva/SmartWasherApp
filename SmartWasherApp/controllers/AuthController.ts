// controllers/AuthController.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../constants/api";
import { User } from "../models/User";

export const AuthController = {
  async login(username: string, password: string) {
    try {
      const res = await client.post("/api/login", { username, password });
      if (!res.data?.success) throw new Error(res.data?.message || "Sai tài khoản hoặc mật khẩu");

      const { user, token } = res.data;

      // ✅ Lưu user & token
      await AsyncStorage.setItem("user", JSON.stringify(user));
      if (token) await AsyncStorage.setItem("token", token);

      return user as User;
    } catch (err: any) {
      console.error("❌ Lỗi đăng nhập:", err.message);
      throw err;
    }
  },

  async logout() {
    await AsyncStorage.multiRemove(["user", "token"]);
  },
};
