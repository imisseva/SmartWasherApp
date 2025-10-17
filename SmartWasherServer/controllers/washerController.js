import { listWashers, createWasher, updateWasherLimited, deleteWasher } from "../models/Washer.js";

export const getWashers = async (_req, res) => {
  try {
    const items = await listWashers();
    res.json({ success: true, items });
  } catch (e) {
    console.error("getWashers error:", e);
    res.status(500).json({ success: false, message: "Failed to list washers" });
  }
};

export const postWasher = async (req, res) => {
  try {
    const { id, name, location, weight, price, status, ip_address } = req.body;
    if (!name || !status) return res.status(400).json({ success: false, message: "Thiếu name/status" });

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
    res.status(500).json({ success: false, message: "Failed to create washer" });
  }
};

export const putWasher = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, location, price, status } = req.body;
    const washer = await updateWasherLimited({
      id,
      name: String(name).trim(),
      location: location ?? null,
      price: Number(price ?? 0),
      status,
    });
    res.json({ success: true, washer });
  } catch (e) {
    console.error("putWasher error:", e);
    res.status(500).json({ success: false, message: "Failed to update washer" });
  }
};

export const deleteWasherCtrl = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteWasher(id);
    res.json({ success: true });
  } catch (e) {
    console.error("deleteWasher error:", e);
    res.status(500).json({ success: false, message: "Failed to delete washer" });
  }
};
