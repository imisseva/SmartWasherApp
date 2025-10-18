import {  listAdminUsers,
  createUserWithAccount,
  updateAdminUser,
  deleteAdminUser, } from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const items = await listAdminUsers();
    res.json({ success: true, items });
  } catch (e) {
    console.error("getUsers:", e);
    res.status(500).json({ success: false, message: e.message || "Failed to list users" });
  }
};

export const postUser = async (req, res) => {
  try {
    const { username, password, role, name, email, phone } = req.body;

    if (!username || !password || !role || !name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu: username, password, role, name là bắt buộc",
      });
    }
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "role không hợp lệ" });
    }

    const vm = await createUserWithAccount({
      username: String(username).trim(),
      password: String(password),
      role,
      name: String(name).trim(),
      email: email?.trim?.() || null,
      phone: phone?.trim?.() || null,
    });

    return res.json({ success: true, user: vm });
  } catch (e) {
    // 🔎 LOG ra console để thấy nguyên nhân thật
    console.error("❌ postUser error:", e);

    // Trả message thân thiện (vẫn giữ 500 nếu không phân loại được)
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Username đã tồn tại" });
    }
    if (e?.code === "ER_BAD_FIELD_ERROR" || e?.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
      return res.status(400).json({ success: false, message: e.sqlMessage || "Dữ liệu không hợp lệ" });
    }
    if (e?.code === "ER_NO_REFERENCED_ROW_2" || e?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({ success: false, message: "Lỗi ràng buộc khoá ngoại" });
    }

    return res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

export const putUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, password, role, name, email, phone } = req.body;
    const user = await updateAdminUser({ id, username, password, role, name, email, phone });
    res.json({ success: true, user });
  } catch (e) {
    const code =
      /not found/i.test(e.message) ? 404 :
      /exists/i.test(e.message) ? 409 : 500;
    res.status(code).json({ success: false, message: e.message || "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteAdminUser(id);
    res.json({ success: true });
  } catch (e) {
    const code = /not found/i.test(e.message) ? 404 : 500;
    res.status(code).json({ success: false, message: e.message || "Failed to delete user" });
  }
};