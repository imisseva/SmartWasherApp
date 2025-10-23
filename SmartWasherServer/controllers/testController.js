import { resetWeeklyFreeWashes } from "../models/User.js";

export const TestController = {
  // Reset lượt giặt miễn phí thủ công để test
  async resetFreeWashes(req, res) {
    try {
      const count = Number(req.query.count || 7);
      const result = await resetWeeklyFreeWashes(count);
      res.json({ 
        success: true, 
        message: `Đã reset ${result.affectedRows} tài khoản về ${count} lượt giặt miễn phí` 
      });
    } catch (err) {
      console.error("❌ Lỗi khi reset lượt giặt:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};