// controllers/AuthController.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../constants/api";
import { User } from "../models/User";
import { Account } from "../models/Account";

export const AuthController = {
  async login(username: string, password: string) {
    try {
      // 🔹 1. Gửi request đến API đăng nhập
      const res = await client.post("/api/login", { username, password });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Sai tài khoản hoặc mật khẩu");
      }

      // 🔹 2. Lấy dữ liệu user và token trả về từ server
      const { user: raw, token } = res.data;

      if (!raw) throw new Error("Không có dữ liệu user từ server.");

      // 🔹 3. Lấy role (ưu tiên role từ account, nếu không có thì dùng role của user hoặc default = 'user')
      const role =
        raw?.account?.role ?? raw?.role ?? "user";

      // 🔹 4. Chuẩn hoá object user thống nhất định dạng
      console.log("Raw user data:", raw); // Log để debug
      const user: User & { account: Account } = {
        id: Number(raw.id),
        account_id: Number(raw.account_id),
        name: raw.name ?? "",
        email: raw.email ?? null,
        phone: raw.phone ?? null,
        total_washes: Number(raw.total_washes ?? 0),
        free_washes_left: Number(raw.free_washes_left ?? 4),
        created_at: raw.created_at ?? new Date().toISOString(),
        account: {
          id: Number(raw.account_id),
          username: raw.account?.username ?? raw.username ?? username,
          role: (raw.account?.role ?? raw.role ?? "user").toLowerCase() as "user" | "admin",
          created_at: raw.created_at ?? new Date().toISOString(),
        },
      };
      console.log("Normalized user data:", user); // Log để debug

      // 🔹 5. Lưu vào AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(user));

      if (token) {
        await AsyncStorage.setItem("token", token);
        console.log("✅ Token đã lưu:", token);
      } else {
        console.warn("⚠️ Server không trả token — kiểm tra lại API /api/login!");
      }

      // 🔹 6. Trả lại user để màn login điều hướng
      return user as User;
    } catch (err: any) {
      console.error("❌ Lỗi đăng nhập:", err.message);
      throw err;
    }
  },

  async register(payload: { username: string; password: string; name: string; email?: string; phone?: string }) {
    try {
      const res = await client.post("/api/register", payload);
      if (!res.data?.success) throw new Error(res.data?.message || "Đăng ký thất bại");
      const { user: raw, token } = res.data;
      const user = {
        id: Number(raw.id),
        account_id: Number(raw.account_id),
        name: raw.name ?? "",
        email: raw.email ?? null,
        phone: raw.phone ?? null,
        total_washes: Number(raw.total_washes ?? 0),
        free_washes_left: Number(raw.free_washes_left ?? 4),
        created_at: raw.created_at ?? new Date().toISOString(),
        account: { id: Number(raw.account_id), username: raw.username ?? payload.username, role: raw.role ?? "user", created_at: raw.created_at ?? new Date().toISOString() },
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      if (token) await AsyncStorage.setItem("token", token);
      return user as any;
    } catch (err: any) {
      console.error("❌ Lỗi đăng ký:", err?.message || err);
      throw err;
    }
  },

  async logout() {
    await AsyncStorage.multiRemove(["user", "token"]);
  },
  async fetchProfile() {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await client.get("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success) throw new Error(res.data?.message || "Failed to fetch profile");

      const raw = res.data.user ?? res.data;
      const user = {
        id: Number(raw.id),
        account_id: Number(raw.account_id),
        name: raw.name ?? "",
        email: raw.email ?? null,
        phone: raw.phone ?? null,
        total_washes: Number(raw.total_washes ?? 0),
        free_washes_left: Number(raw.free_washes_left ?? 0),
        created_at: raw.created_at ?? new Date().toISOString(),
        account: {
          id: Number(raw.account_id),
          username: raw.username ?? (raw.account?.username ?? ""),
          role: (raw.role ?? raw.account?.role ?? "user") as "user" | "admin",
          created_at: raw.created_at ?? new Date().toISOString(),
        },
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      console.warn("fetchProfile error:", err?.message || err);
      throw err;
    }
  },
};
