// controllers/authController.js
import { getAccountByUsername } from "../models/account.js";
import { getUserByAccountId } from "../models/User.js";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { username, password } = req.body;

  // 🔹 Kiểm tra dữ liệu đầu vào
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin đăng nhập",
    });
  }

  try {
    // 🔹 1. Lấy thông tin tài khoản từ DB
    const account = await getAccountByUsername(username);

    if (!account || account.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Sai tài khoản hoặc mật khẩu",
      });
    }

    // 🔹 2. Lấy thông tin user tương ứng
    const user = await getUserByAccountId(account.id);

    // 🔹 3. Tạo JWT token (hạn 1 ngày)
    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        role: account.role,
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1d" }
    );

    // 🔹 4. Trả về user + token
    return res.json({
      success: true,
      user: {
        ...user,
        account: {
          id: account.id,
          username: account.username,
          role: account.role,
          created_at: account.created_at,
        },
      },
      token, // ✅ FE sẽ nhận token này và lưu
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
}
