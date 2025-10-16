import { getAccountByUsername } from "../models/account.js";
import { getUserByAccountId } from "../models/User.js";

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Thiếu thông tin đăng nhập" });

  try {
    const account = await getAccountByUsername(username);
    if (!account || account.password !== password)
      return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });

    const user = await getUserByAccountId(account.id);

    return res.json({
      success: true,
      user: {
        ...user,
        account: { username: account.username, role: account.role },
      },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
