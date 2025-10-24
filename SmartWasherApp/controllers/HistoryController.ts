import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../constants/api";
import { WashHistory } from "../models/WashHistory";

export const HistoryController = {
  async getUserHistory(): Promise<WashHistory[]> {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) throw new Error("Chưa đăng nhập");
      const user = JSON.parse(userData);

      // Gọi endpoint /api/wash-history/:userId
      let res;
      try {
        res = await client.get(`/api/wash-history/${user.id}`);
      } catch (err: any) {
        // Fallback về query param nếu cần
        if (err.response && err.response.status === 404) {
          console.warn("⚠️ Thử fallback sang query param...");
          res = await client.get(`/api/wash-history?user_id=${user.id}`);
        } else {
          throw err;
        }
      }

      // Server may return either { success: true, data: [...] } or a raw array depending on which server file is running.
      if (res && res.data) {
        if (res.data.success && Array.isArray(res.data.data)) {
          return res.data.data as WashHistory[];
        }

        if (Array.isArray(res.data)) {
          // server returned raw array
          return res.data as WashHistory[];
        }

        console.warn("⚠️ API không trả về đúng định dạng (không phải array):", res.data);
        return [];
      }
      return [];
    } catch (err: any) {
      // Try to print more details for network/axios errors
      if (err.response) {
        console.error("❌ Lỗi trả về từ server:", err.response.status, err.response.data);
      } else if (err.request) {
        console.error("❌ Yêu cầu đã gửi nhưng không có phản hồi:", err.request);
      } else {
        console.error("❌ Lỗi khi thiết lập yêu cầu:", err.message);
      }
      return [];
    }
  },
};
