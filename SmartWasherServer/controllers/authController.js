// controllers/authController.js
import { getAccountByUsername } from "../models/account.js";
import { getUserByAccountId, createUserWithAccount } from "../models/User.js";
import jwt from "jsonwebtoken";
import { getUserByAccountIdJoined } from "../models/User.js"; // import ở đầu file cùng import hiện có

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

export async function register(req, res) {
  const { username, password, name, email, phone } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin đăng ký" });
  }

  try {
    // create user + account with default role = 'user'
    const vm = await createUserWithAccount({ username, password, role: "user", name, email, phone });

    // generate token for the created account (account_id is present)
    const token = jwt.sign(
      { id: vm.account_id, username: username, role: "user" },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1d" }
    );

    return res.json({ success: true, user: vm, token });
  } catch (err) {
    // detailed logging for debugging
    console.error("❌ Lỗi đăng ký:", err && err.stack ? err.stack : err);
    try {
      const safe = { ...req.body };
      if (safe.password) safe.password = "<redacted>";
      console.error("Request body:", safe);
    } catch (e) {}
    // If duplicate username, model may throw; send 409
    const message = err?.message || "Lỗi server";
    const status = /exists/i.test(message) ? 409 : 500;
    return res.status(status).json({ success: false, message });
  }
}
export async function me(req, res) {
  try {
    const h = req.headers.authorization || "";
    const [typ, token] = h.split(" ");
    if (typ !== "Bearer" || !token) return res.status(401).json({ success: false, message: "Missing token" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const accountId = payload.id;
    if (!accountId) return res.status(400).json({ success: false, message: "Invalid token payload" });

    const user = await getUserByAccountIdJoined(accountId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}