// controllers/washerController.js
import db from "../db.js";
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
// ESP hỏi lệnh
export const getWasherCommand = async (req, res) => {
  try {
    let result = "0";

    if (currentCommand === "START_1") {
      result = "1";
    } else if (currentCommand === "START_2") {
      result = "2";
    }

    console.log("🤖 ESP hỏi lệnh ->", result);
    res.send(result);

    // ❗️Ngay sau khi gửi command, tự reset về 0 để ESP tự động tắt
    currentCommand = null;

  } catch (err) {
    console.error("getWasherCommand error:", err);
    res.status(500).send("0");
  }
};


// ESP báo trạng thái thực tế
export const updateWasherStatus = async (req, res) => {
  console.log("📥 ESP body:", req.body, "params:", req.params);
  try {
    const washer_id_raw = req.params.id ?? req.body?.washer_id ?? req.body?.id;
    const washer_id = Number(washer_id_raw);
    const status = req.body?.status;
    const ip = req.body?.ip ?? null;

    if (!washer_id || isNaN(washer_id)) {
      return res
        .status(400)
        .json({ success: false, message: `ID không hợp lệ: ${washer_id_raw}` });
    }
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu trạng thái (status)" });
    }

    const [rows] = await db.execute(
      "UPDATE washer SET status=?, ip_address=?, last_used=NOW() WHERE id=?",
      [status, ip, washer_id]
    );
    if (!rows?.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy máy giặt" });
    }

    console.log(
      `📡 ESP cập nhật Washer ${washer_id} → ${status} (${ip || "no ip"})`
    );

    // ✅ Reset command sau khi ESP báo trạng thái
    currentCommand = null;

    res.json({ success: true, washer_id, status });
  } catch (err) {
    console.error("updateWasherStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
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
