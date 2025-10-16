// models/History.js
import db from "../db.js";

// Lấy lịch sử giặt theo user_id
export async function getHistoryByUserId(userId) {
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
  return rows;
}
