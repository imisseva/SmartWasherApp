import client from "../constants/api";
import { Washer } from "../models/Washer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const WasherController = {
  // Lấy thông tin 1 máy giặt theo ID
  async getWasherById(id: number): Promise<Washer | null> {
    try {
      const res = await client.get(`/api/washer/${id}`);
      if (res.data?.success) return res.data.washer as Washer;
      return null;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin máy giặt:", err);
      return null;
    }
  },

  // Tính tiền & lưu lịch sử giặt
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
    await client.post("/api/wash-history", {
      user_id: user.id,
      washer_id: washer.id,
      cost: totalCost,
    });

    return totalCost;
  },
};
