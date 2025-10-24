import client from "../constants/api";
import { Washer } from "../models/Washer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export type WasherStatus = "available" | "running" | "error";

export interface WasherInfo {
  id: number;
  name: string;
  location: string;
  price: number;
  status: WasherStatus;
  weight: number;
}

export interface WashHistory {
  id: number;
  user_id: number;
  washer_id: number;
  cost: number;
  requested_at: string;
  start_time?: string;
  end_time?: string;
  // Optional fields added by a DB migration; keep optional to remain backward-compatible
  status?: string | null;
  notes?: string | null;
}

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
    const res = await client.get("/api/washers");
    const items = res.data?.items ?? res.data ?? [];
    return (items as any[]).map(normalize);
  },

  async create(input: CreateWasherDto): Promise<Washer> {
    const res = await client.post("/api/washers", input);
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

  async getWasherInfo(id: number): Promise<WasherInfo | null> {
    try {
      const res = await client.get(`/api/washers/${id}/info`);
      if (res.data?.success && res.data?.data) {
        return res.data.data as WasherInfo;
      }
      return null;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin máy giặt:", err);
      return null;
    }
  },

  async update(input: UpdateWasherDto): Promise<Washer> {
    const { id, ...payload } = input;
    const res = await client.put(`/api/washers/${id}`, payload);
    const item = res.data?.washer ?? res.data;
    return normalize(item);
  },

  async remove(id: number): Promise<void> {
    const res = await client.delete(`/api/washers/${id}`);
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Không thể xóa máy giặt');
    }
  },

  /** ================== 💰 TÍNH TIỀN & LƯU LỊCH SỬ ================== */
  async calculateAndSaveWash(weight: number, washer: Washer): Promise<number> {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) throw new Error("Không tìm thấy người dùng");
    const user = JSON.parse(userData);

    // 1️⃣ Tính tiền
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
  async startWasher(id: number): Promise<{ success: boolean; message?: string }> {
    console.log(`📡 [App → Server] Bắt đầu giặt máy #${id}`);
    try {
      const res = await client.put(`/api/washers/${id}/start`);
      return {
        success: res.data?.success ?? false,
        message: res.data?.message
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Không thể kết nối đến máy giặt"
      };
    }
  },

  async stopWasher(id: number): Promise<void> {
    console.log(`🛑 [App → Server] Dừng máy giặt #${id}`);
    await client.put(`/api/washers/${id}/stop`);
  },

  async updateWasherStatus(id: number, status: WasherStatus, ip?: string): Promise<void> {
    console.log(`📶 [ESP32 → Server] Cập nhật trạng thái máy #${id}: ${status} (${ip || "no IP"})`);
    
    // Lấy thông tin máy giặt trước khi cập nhật
    const oldData = await this.getWasherById(id);
    
    // Gọi API cập nhật trạng thái
    await client.put("/api/washers/update-status", {
      washer_id: id,
      status,
      ip,
    });

    // Nếu trạng thái mới là "available" và trạng thái cũ khác "available" -> máy vừa giặt xong
    if (status === "available" && oldData?.status !== "available") {
      Alert.alert(
        "Máy giặt đã hoàn thành! 🧺",
        `${oldData?.name || 'Máy giặt'} đã giặt xong, bạn có thể lấy quần áo.`,
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
    // Nếu có lỗi xảy ra
    else if (status === "error") {
      Alert.alert(
        "❌ Máy giặt gặp sự cố",
        "Vui lòng liên hệ nhân viên để được hỗ trợ.",
        [{ text: "OK" }]
      );
    }
  },

  async getWasherCommand(id: number): Promise<{ command: string }> {
    const res = await client.get(`/api/washers/${id}/command`);
    console.log(`📨 [ESP32 ← Server] Lấy lệnh của máy #${id}:`, res.data.command);
    return res.data;
  },

  async getLastWashHistory(washer_id: number): Promise<WashHistory | null> {
    try {
      const res = await client.get(`/api/wash-history/last/${washer_id}`);
      // Server will include status/notes only if the DB has those columns; keep them optional
      if (res.data?.success && res.data?.history) {
        return res.data.history;
      }
      return null;
    } catch (err) {
      console.error("❌ Lỗi khi lấy lịch sử giặt:", err);
      return null;
    }
  },
};
