import db from "../db.js";

export const getWasherInfo = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID máy giặt không hợp lệ" 
      });
    }

    const [rows] = await db.execute(
      `SELECT name, location, price, status, weight
       FROM washer 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy máy giặt"
      });
    }

    const washer = rows[0];
    res.json({
      success: true,
      data: {
        id,
        name: washer.name,
        location: washer.location || "",
        price: Number(washer.price),
        status: washer.status,
        weight: Number(washer.weight || 0)
      }
    });
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin máy giặt:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};