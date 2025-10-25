import db from "../db.js";

export const HistoryController = {
  // Lấy lịch sử giặt cuối cùng của một máy giặt
  async getLastWashHistory(req, res) {
    const { washer_id } = req.params;
    try {
      // Dynamically include status/notes if columns exist in DB
      const [cols] = await db.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wash_history' AND COLUMN_NAME IN ('status','notes')`
      );
      const hasStatus = cols.some(c => c.COLUMN_NAME === 'status');
      const hasNotes = cols.some(c => c.COLUMN_NAME === 'notes');

      const selectCols = [
        "h.id",
        "h.user_id",
        "h.washer_id",
        "h.cost",
        "DATE_FORMAT(h.requested_at, '%Y-%m-%d %H:%i') as requested_at",
        "DATE_FORMAT(h.start_time, '%Y-%m-%d %H:%i') as start_time",
        "DATE_FORMAT(h.end_time, '%Y-%m-%d %H:%i') as end_time",
      ];
      if (hasStatus) selectCols.push("h.status");
      if (hasNotes) selectCols.push("h.notes");
      selectCols.push("w.name as washer_name");

      const sql = `SELECT ${selectCols.join(', ')} FROM wash_history h JOIN washer w ON w.id = h.washer_id WHERE h.washer_id = ? ORDER BY h.requested_at DESC LIMIT 1`;
      const [rows] = await db.execute(sql, [washer_id]);

      if (rows.length === 0) {
        return res.json({ 
          success: true, 
          history: null 
        });
      }

      res.json({ 
        success: true, 
        history: rows[0] 
      });
    } catch (err) {
      console.error("❌ Lỗi khi lấy lịch sử giặt cuối:", err);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi server khi lấy lịch sử" 
      });
    }
  },
  // Helper function: Trả lại lượt giặt và ghi nhận lỗi
  async refundWashForError(washer_id, user_id = null) {
    const conn = await db.getConnection();
    let refundedUserId = null;
    try {
      await conn.beginTransaction();

      // 1. Tìm lịch sử giặt gần nhất của máy này và user này (nếu có user_id)
      const [history] = await conn.execute(
        `SELECT * FROM wash_history 
         WHERE washer_id = ? 
         AND end_time IS NULL
         ${user_id ? 'AND user_id = ?' : ''}
         ORDER BY requested_at DESC 
         LIMIT 1`,
        user_id ? [washer_id, user_id] : [washer_id]
      );

      if (history && history.length > 0) {
        const lastWash = history[0];
        
        // 2. Hoàn trả lượt giặt miễn phí (nếu đã dùng lượt miễn phí)
        if (lastWash.cost === 0) {
          // Kiểm tra xem lượt giặt này đã được refund chưa
          const [refunded] = await conn.execute(
            `SELECT status FROM wash_history WHERE id = ? AND status = 'refunded'`,
            [lastWash.id]
          );

          if (!refunded.length) {
            await conn.execute(
              `UPDATE user 
               SET free_washes_left = IFNULL(free_washes_left, 0) + 1,
                   total_washes = GREATEST(IFNULL(total_washes, 0) - 1, 0)
               WHERE id = ?`,
              [lastWash.user_id]
            );
            refundedUserId = lastWash.user_id;
            console.log(`💰 Đã hoàn lại lượt giặt miễn phí cho user ${lastWash.user_id}`);
          }
        }

        // 3. Cập nhật trạng thái lượt giặt
        await conn.execute(
          `UPDATE wash_history 
           SET status = 'refunded',
               notes = 'Máy giặt gặp lỗi - Đã hoàn lại lượt giặt',
               end_time = NOW()
           WHERE id = ?`,
          [lastWash.id]
        );
      }

      await conn.commit();
      
      // Emit sự kiện qua socket nếu có refund
      if (refundedUserId) {
        const { emitRefundEvent } = await import('../socket.js');
        const io = req.app.get('io');
        emitRefundEvent(io, refundedUserId, washer_id);
      }
      
      // Trả về thông tin về user được refund
      return {
        success: true,
        userId: refundedUserId,
        message: `Đã hoàn lại lượt giặt cho user ${refundedUserId}`
      };
    } catch (err) {
      await conn.rollback();
      console.error("❌ Lỗi khi hoàn trả lượt giặt:", err);
      return {
        success: false,
        error: err.message
      };
    } finally {
      conn.release();
    }
  },

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
            WHEN h.status = 'refunded' THEN 'Hoàn tiền'
            WHEN h.status = 'error' THEN 'Lỗi'
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
  // duplicate/refactor placeholder - refundWashForError implemented above; no-op here
};


