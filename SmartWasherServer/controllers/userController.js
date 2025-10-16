import {  listAdminUsers,
  createAdminUser,
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
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const user = await createAdminUser({ username, password, role, name, email, phone });
    res.json({ success: true, user });
  } catch (e) {
    const code = /exists/i.test(e.message) ? 409 : 500;
    res.status(code).json({ success: false, message: e.message || "Failed to create user" });
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