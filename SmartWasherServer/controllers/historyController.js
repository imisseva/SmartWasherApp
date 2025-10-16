import db from "../db.js";

export const HistoryController = {
  async getUserHistory(req, res) {
    const { userId } = req.params;
    try {
      const [rows] = await db.execute(
        `
        SELECT 
          h.id,
          h.user_id,
          h.washer_id,
          w.name AS machineName,
          DATE_FORMAT(h.requested_at, '%Y-%m-%d %H:%i') AS date,
          h.cost,
          CASE 
            WHEN h.cost = 0 THEN 'Miễn phí'
            ELSE 'Hoàn thành'
          END AS status
        FROM wash_history h
        JOIN washer w ON w.id = h.washer_id
        WHERE h.user_id = ?
        ORDER BY h.requested_at DESC
        `,
        [userId]
      );

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Lỗi truy vấn lịch sử:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
};
