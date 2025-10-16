import { getUserById } from "../models/UserModel.js";

export const getUser = (req, res) => {
  const { id } = req.params;
  getUserById(id, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const row = results[0];
    const user = {
      id: row.id,
      account_id: row.account_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      total_washes: row.total_washes,
      free_washes_left: row.free_washes_left,
      created_at: row.created_at,
      account: {
        id: row.account_id,
        username: row.username,
        role: row.role,
        created_at: row.account_created,
      },
    };
    res.json({ success: true, user });
  });
};
