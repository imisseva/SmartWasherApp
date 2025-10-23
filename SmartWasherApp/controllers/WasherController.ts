import client from "../constants/api";
import { Washer } from "../models/Washer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WasherStatus = "available" | "running" | "error";

export interface CreateWasherDto {
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

  /** ================== 💰 TÍNH TIỀN & LƯU LỊCH SỬ ================== */
  async calculateAndSaveWash(weight: number, washer: Washer): Promise<number> {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) throw new Error("Không tìm thấy người dùng");
    const user = JSON.parse(userData);

    // 1️⃣ Kiểm tra trạng thái máy
    console.log(`📡 [App → Server] Yêu cầu khởi động máy giặt #${washer.id}`);
    const startRes = await client.put(`/api/washers/${washer.id}/start`);

    if (!startRes.data?.success) {
      const msg = startRes.data?.message || "Máy đang có người sử dụng";
      console.warn("⚠️ Không thể khởi động máy:", msg);
      throw new Error(msg);
    }

    // 2️⃣ Tính tiền
    const freeWashes = user.free_washes_left ?? 0;
    let totalCost = 0;
    if (freeWashes > 0) totalCost = 0;
    else totalCost = Math.round((washer.price / washer.weight) * weight);

    // 3️⃣ Gửi lịch sử lên server
    try {
      const res = await client.post("/api/wash-history", {
        user_id: user.id,
        washer_id: washer.id,
        cost: totalCost,
      });

      // Cập nhật thông tin user cục bộ nếu có trả về
      if (res?.data?.user) {
        const cur = JSON.parse(await AsyncStorage.getItem("user") || "{}");
        const updated = { ...cur, ...res.data.user };
        await AsyncStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err: any) {
      if (err.response) console.error("❌ Lỗi lưu lịch sử:", err.response.data);
      else console.error("❌ Lỗi lưu lịch sử:", err);
    }

    return totalCost;
  },

  // ================== ⚙️ PHẦN NHÚNG ESP32 ==================
  async startWasher(id: number): Promise<void> {
    console.log(`📡 [App → Server] Bắt đầu giặt máy #${id}`);
    await client.put(`/api/washers/${id}/start`);
  },

  async stopWasher(id: number): Promise<void> {
    console.log(`🛑 [App → Server] Dừng máy giặt #${id}`);
    await client.put(`/api/washers/${id}/stop`);
  },

  async updateWasherStatus(id: number, status: WasherStatus, ip?: string): Promise<void> {
    console.log(`📶 [ESP32 → Server] Cập nhật trạng thái máy #${id}: ${status} (${ip || "no IP"})`);
    await client.put("/api/washers/update-status", {
      washer_id: id,
      status,
      ip,
    });
  },

  async getWasherCommand(id: number): Promise<{ command: string }> {
    const res = await client.get(`/api/washers/${id}/command`);
    console.log(`📨 [ESP32 ← Server] Lấy lệnh của máy #${id}:`, res.data.command);
    return res.data;
  },
};
