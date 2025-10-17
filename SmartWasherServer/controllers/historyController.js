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
  async createWashHistory(req, res) {
    try {
      const { user_id, washer_id, cost } = req.body;
      if (!user_id || !washer_id) {
        return res.status(400).json({ success: false, message: "Thiếu user_id hoặc washer_id" });
      }

      // Use transaction to insert history and update user counters when needed
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [insRes] = await conn.execute(
          `INSERT INTO wash_history (user_id, washer_id, cost, requested_at) VALUES (?, ?, ?, NOW())`,
          [user_id, washer_id, cost ?? 0]
        );

        // If cost is zero, decrement free_washes_left; always increment total_washes
        if ((cost ?? 0) === 0) {
          await conn.execute(
            `UPDATE user SET free_washes_left = GREATEST(IFNULL(free_washes_left,0) - 1, 0), total_washes = IFNULL(total_washes,0) + 1 WHERE id = ?`,
            [user_id]
          );
        } else {
          await conn.execute(
            `UPDATE user SET total_washes = IFNULL(total_washes,0) + 1 WHERE id = ?`,
            [user_id]
          );
        }

        // Fetch updated user to return to client
        const [rows] = await conn.execute(
          `SELECT u.*, a.username, a.role FROM user u JOIN account a ON a.id = u.account_id WHERE u.id = ?`,
          [user_id]
        );

        await conn.commit();

        const updatedUser = rows[0];
        return res.json({ success: true, id: insRes.insertId, user: updatedUser });
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu lịch sử giặt:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
};
