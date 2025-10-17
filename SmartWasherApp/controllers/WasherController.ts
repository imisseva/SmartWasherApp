import client from "../constants/api";
import { Washer } from "../models/Washer";
import AsyncStorage from "@react-native-async-storage/async-storage";
export type WasherStatus = "available" | "running" | "error";
// export const WasherController = {
  
//   // Tính tiền & lưu lịch sử giặt

// };
export interface CreateWasherDto {
  // id cho phép truyền vào khi tạo (nếu bạn muốn tự đặt), có thể bỏ nếu dùng AUTO_INCREMENT
  id?: number;
  name: string;
  location?: string | null;
  weight: number;
  price: number;
  status: WasherStatus;
  ip_address?: string | null;
}
export interface UpdateWasherDto {
  id: number;
  name: string;
  location?: string | null;
  price: number;
  status: WasherStatus;
}

const normalize = (it: any): Washer => ({
  id: Number(it.id),
  name: it.name ?? "",
  location: it.location ?? "",
  weight: Number(it.weight ?? 0),
  price: Number(it.price ?? 0),
  status: (it.status ?? "available") as WasherStatus,
  ip_address: it.ip_address ?? null,
  last_used: it.last_used ?? null,
});

export const WasherController = {
  async list(): Promise<Washer[]> {
    const res = await client.get("/api/admin/washers");
    const items = res.data?.items ?? res.data ?? [];
    return (items as any[]).map(normalize);
  },

  async create(input: CreateWasherDto): Promise<Washer> {
    const res = await client.post("/api/admin/washers", input);
    const item = res.data?.washer ?? res.data;
    return normalize(item);
  },

  async getWasherById(id: number): Promise<Washer | null> {
    try {
      const res = await client.get(`/api/washer/${id}`);
      if (res.data?.success && res.data?.washer) {
        return normalize(res.data.washer);
      }
      return null;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin máy giặt:", err);
      return null;
    }
  },

  async update(input: UpdateWasherDto): Promise<Washer> {
    const { id, ...payload } = input;
    const res = await client.put(`/api/admin/washers/${id}`, payload);
    const item = res.data?.washer ?? res.data;
    return normalize(item);
  },

  async remove(id: number): Promise<void> {
    await client.delete(`/api/admin/washers/${id}`);
  },
  async calculateAndSaveWash(weight: number, washer: Washer): Promise<number> {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) throw new Error("Không tìm thấy người dùng");
    const user = JSON.parse(userData);

    const freeWashes = user.free_washes_left ?? 0;
    let totalCost = 0;

    if (freeWashes > 0) {
      totalCost = 0;
    } else {
      totalCost = Math.round((washer.price / washer.weight) * weight);
    }

    // Gọi API lưu lịch sử
    try {
      const res = await client.post("/api/wash-history", {
        user_id: user.id,
        washer_id: washer.id,
        cost: totalCost,
      });

      // If server returned updated user info, persist it locally
      if (res?.data?.user) {
        try {
          const stored = await AsyncStorage.getItem("user");
          const cur = stored ? JSON.parse(stored) : {};
          const updated = { ...cur, ...res.data.user };
          await AsyncStorage.setItem("user", JSON.stringify(updated));
        } catch (e) {
          console.warn("Không thể cập nhật user cục bộ:", e);
        }
      }
    } catch (err: any) {
      // Log detailed axios error to help debugging
      if (err.response) {
        console.error("❌ Lỗi lưu lịch sử - response:", err.response.status, err.response.data);
      } else if (err.request) {
        console.error("❌ Lỗi lưu lịch sử - no response, request:", err.request);
      } else {
        console.error("❌ Lỗi lưu lịch sử - setup:", err.message);
      }
      throw err;
    }

    return totalCost;
  },
};

