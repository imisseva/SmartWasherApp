// controllers/washerController.js
import db from "../db.js";
import { HistoryController } from "./historyController.js";
import {
  listWashers,
  createWasher,
  updateWasherLimited,
  deleteWasher,
  findWasherByName,
  getWasherById as getWasherByIdModel,
  startWasherById,
  stopWasherById,
} from "../models/Washer.js";

// 🧠 Lệnh hiện tại cho ESP. ESP GET /api/washers/command sẽ nhận lệnh này.
let currentCommand = null;


import { Washer } from "../models/Washer.js";

export const WasherController = {
  getAll: async (req, res) => {
    try {
      const washers = await Washer.getAll();
      res.json({ success: true, data: washers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const washer = await Washer.getById(req.params.id);
      if (!washer) {
        return res.status(404).json({ success: false, message: "Không tìm thấy máy" });
      }
      res.json({ success: true, washer });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// ===== CRUD CƠ BẢN =====
export const getWasherByName = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tên máy giặt" });
    const washer = await findWasherByName(name.trim());
    if (!washer)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy máy giặt" });
    res.json({ success: true, washer });
  } catch (err) {
    console.error("getWasherByName error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getWashers = async (_req, res) => {
  try {
    const items = await listWashers();
    res.json({ success: true, items });
  } catch (e) {
    console.error("getWashers error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to list washers" });
  }
};

export const postWasher = async (req, res) => {
  try {
    const { id, name, location, weight, price, status, ip_address } = req.body;
    if (!name || !status)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu name/status" });

    const washer = await createWasher({
      id: typeof id === "number" ? id : undefined,
      name: String(name).trim(),
      location: location ?? null,
      weight: Number(weight ?? 0),
      price: Number(price ?? 0),
      status,
      ip_address: ip_address ?? null,
    });
    res.json({ success: true, washer });
  } catch (e) {
    console.error("postWasher error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to create washer" });
  }
};

export const putWasher = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });

    const current = await getWasherByIdModel(id);
    if (!current)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy máy giặt" });

    const body = req.body || {};
    const washer = await updateWasherLimited({
      id,
      name: body.name ?? current.name,
      location: body.location ?? current.location,
      price: body.price ?? current.price,
      status: body.status ?? current.status,
    });

    res.json({ success: true, washer });
  } catch (e) {
    console.error("putWasher error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to update washer" });
  }
};

export const deleteWasherCtrl = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteWasher(id);
    res.json({ success: true });
  } catch (e) {
    console.error("deleteWasher error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete washer" });
  }
};

export const getWasherById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });

    const washer = await getWasherByIdModel(id);
    if (!washer)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy máy giặt" });
    res.json({ success: true, washer });
  } catch (e) {
    console.error("getWasherById error:", e);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tìm máy giặt" });
  }
};

// ====== PHẦN NHÚNG ESP32 ======

// App yêu cầu bắt đầu giặt: set DB = running + phát lệnh START_x cho ESP
export const startWasher = async (req, res) => {
  const id = Number(req.params.id);
  if (!id)
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  try {
    const washer = await startWasherById(id);
    currentCommand = `START_${id}`;
    console.log(`🧺 START_${id} — gửi cho ESP, DB đã chuyển 'running'`);
    res.json({ success: true, washer, command: currentCommand });
  } catch (err) {
    console.error("startWasher error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// App yêu cầu dừng giặt
export const stopWasher = async (req, res) => {
  const id = Number(req.params.id);
  if (!id)
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  try {
    const washer = await stopWasherById(id);
    currentCommand = `STOP_${id}`;
    console.log(`⛔ STOP_${id} — gửi cho ESP, DB đã chuyển 'available'`);
    res.json({ success: true, washer, command: currentCommand });
  } catch (err) {
    console.error("stopWasher error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ESP hỏi lệnh
// ESP hỏi lệnh: chỉ gửi START_1 hoặc START_2 1 lần, sau đó reset về 0
// ESP hỏi lệnh: chỉ gửi START_1 hoặc START_2 cho đến khi ESP báo hoàn tất
export const getWasherCommand = async (req, res) => {
  try {
    let result = "0";

    if (currentCommand === "START_1") {
      result = "1";
    } else if (currentCommand === "START_2") {
      result = "2";
    }

    console.log("🤖 ESP hỏi lệnh ->", result);
    // Không reset currentCommand ở đây, chỉ reset khi nhận mã hoàn tất từ ESP
    res.send(result);
  } catch (err) {
    console.error("getWasherCommand error:", err);
    res.status(500).send("0");
  }
};

// ESP báo trạng thái thực tế
export const updateWasherStatus = async (req, res) => {
  console.log("📥 ESP gửi status:", {
    body: req.body,
    params: req.params,
    currentCommand
  });
  try {
    // Lấy washer_id từ nhiều nguồn (theo thứ tự ưu tiên):
    let washer_id = 0;
    // 1. URL param
    if (req.params && req.params.id && !isNaN(Number(req.params.id)) && Number(req.params.id) > 0) {
      washer_id = Number(req.params.id);
    }
    // 2. Body
    if (!washer_id && req.body) {
      if (req.body.washer_id && !isNaN(Number(req.body.washer_id)) && Number(req.body.washer_id) > 0) {
        washer_id = Number(req.body.washer_id);
      } else if (req.body.id && !isNaN(Number(req.body.id)) && Number(req.body.id) > 0) {
        washer_id = Number(req.body.id);
      }
    }
    // 3. currentCommand
    if (!washer_id && currentCommand) {
      const match = currentCommand.match(/START_(\d+)/);
      if (match && !isNaN(Number(match[1])) && Number(match[1]) > 0) {
        washer_id = Number(match[1]);
        console.log(`ℹ️ Lấy ID từ currentCommand: ${washer_id}`);
      }
    }
    const status = req.body?.status;
    const ip = req.body?.ip ?? null;
    // 1. Parse và validate status
    const statusStr = String(status).trim();
    console.log(`📊 Xử lý status cho máy ${washer_id}:`, {
      receivedStatus: statusStr,
      currentCommand,
      washer_id
    });
    // 2. Kiểm tra mã đặc biệt (10/11/20/21)
    const resetCommands = ["10", "11", "20", "21"];
    const isReset = resetCommands.includes(statusStr);
    if (isReset) {
      console.log(`✨ Nhận mã hoàn tất ${statusStr}, tiến hành reset máy ${washer_id}`);
      // Các mã 10/20: lỗi; 11/21: thành công (theo firmware)
      const errorCodes = ["10", "20"];
      const successCodes = ["11", "21"];

      if (washer_id && !isNaN(washer_id) && washer_id > 0) {
        // Reset máy về trạng thái sẵn sàng nếu xác định được ID
        const [rows] = await db.execute(
          "UPDATE washer SET status = 'available', ip_address = ?, last_used = NOW() WHERE id = ?",
          [ip, washer_id]
        );
        if (!rows?.affectedRows) {
          console.error(`❌ Reset thất bại: Không tìm thấy máy ${washer_id}`);
        } else {
          console.log(`✅ Đã reset máy ${washer_id}:`, {
            previousCommand: currentCommand,
            newStatus: 'available'
          });
        }

        // Nếu là mã lỗi, gọi refund logic để hoàn lại lượt giặt và ghi history.status
        if (errorCodes.includes(statusStr)) {
          try {
            console.log(`🔁 Mã ${statusStr} được xác định là LỖI — thực hiện refund cho máy ${washer_id}`);
            await HistoryController.refundWashForError(washer_id);
          } catch (e) {
            console.error(`❌ Refund thất bại cho máy ${washer_id}:`, e);
          }
        } else if (successCodes.includes(statusStr)) {
          console.log(`ℹ️ Mã ${statusStr} được xác định là THÀNH CÔNG`);
        }
      } else {
        // Không xác định được ID, vẫn trả về "0" để ESP dừng
        console.error(`❌ Không thể xác định ID máy giặt khi nhận mã hoàn tất:`, {
          urlParams: req.params,
          body: req.body,
          currentCommand
        });
      }
      // Reset command về null và đảm bảo getWasherCommand trả về "0" cho ESP
      currentCommand = null;
      return res.send("0");
    }
    // 5. Trường hợp status thông thường
    console.log(`ℹ️ Status ${statusStr} không phải mã hoàn tất, cập nhật status bình thường`);
    const [rows] = await db.execute(
      "UPDATE washer SET status = ?, ip_address = ?, last_used = NOW() WHERE id = ?",
      [status, ip, washer_id]
    );
    if (!rows?.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy máy giặt"
      });
    }
    console.log(`📡 ESP cập nhật Máy ${washer_id} → ${status} (${ip || "no ip"})`);
    res.json({ success: true, washer_id, status });
  } catch (err) {
    console.error("updateWasherStatus error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ✅ ESP gửi kết quả giặt (ví dụ: { washer_id: 1, result: 0 })
export const receiveResultFromESP = async (req, res) => {
  try {
    const { washer_id, result } = req.body;
    if (!washer_id || isNaN(Number(washer_id))) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu hoặc ID không hợp lệ" });
    }

    console.log(
      `📬 ESP báo kết quả: Máy ${washer_id} → ${
        result == 0 ? "Hoàn thành" : "Lỗi"
      }`
    );

    await db.execute(
      "UPDATE washer SET status=?, last_used=NOW() WHERE id=?",
      [result == 0 ? "available" : "error", washer_id]
    );

    // ✅ Tự động tắt command sau khi nhận kết quả
    currentCommand = null;

    res.json({ success: true, washer_id, result });
  } catch (err) {
    console.error("receiveResultFromESP error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
