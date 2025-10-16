import client from "../constants/api";
import { User } from "../models/User";

export const UserController = {
  async getUserById(id: number): Promise<User | null> {
    try {
      const res = await client.get(`/api/user/${id}`);
      return res.data.user as User;
    } catch (err) {
      console.error("❌ Lỗi khi lấy user:", err);
      return null;
    }
  },
};
