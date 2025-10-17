import db from "../db.js";

// ✅ Lấy danh sách máy giặt (nếu app muốn hiển thị tất cả)
export const getAllWashers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, location, weight, price, status, ip_address, last_used
       FROM washer
       ORDER BY id ASC`
    );
    res.json({ success: true, washers: rows });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách máy giặt:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ✅ Lấy thông tin chi tiết của một máy giặt theo ID
export const getWasherById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT id, name, location, weight, price, status, ip_address, last_used
       FROM washer
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy máy giặt" });
    }

    res.json({ success: true, washer: rows[0] });
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin máy giặt:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
