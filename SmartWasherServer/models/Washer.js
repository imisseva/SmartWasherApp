// models/Washer.js
import db from "../db.js";

const mapRow = (r) => ({
  id: Number(r.id),
  name: r.name,
  location: r.location,
  weight: Number(r.weight ?? 0),
  price: Number(r.price ?? 0),
  status: r.status,
  ip_address: r.ip_address ?? null,
  last_used: r.last_used ?? null,
});

export async function listWashers() {
  const [rows] = await db.execute(`SELECT * FROM washer ORDER BY id DESC`);
  return rows.map(mapRow);
}

// ⬇️ Cho phép: id (optional), weight, ip_address khi tạo mới
export async function createWasher({ id, name, location, weight, price, status, ip_address }) {
  // xây INSERT động để chèn id nếu có
  const cols = ["name", "location", "weight", "price", "status", "ip_address"];
  const vals = [name, location ?? null, weight ?? 0, price ?? 0, status, ip_address ?? null];
  let sql = `INSERT INTO washer (${cols.join(",")}) VALUES (?,?,?,?,?,?)`;

  if (typeof id === "number" && !Number.isNaN(id)) {
    cols.unshift("id");
    vals.unshift(id);
    sql = `INSERT INTO washer (${cols.join(",")}) VALUES (${Array(cols.length).fill("?").join(",")})`;
  }

  const [res] = await db.execute(sql, vals);
  const insertedId = res.insertId || id;
  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [insertedId]);
  return mapRow(rows[0]);
}

// Sửa: CHỈ cho sửa name, location, price, status
export async function updateWasherLimited({ id, name, location, price, status }) {
  await db.execute(
    `UPDATE washer SET name=?, location=?, price=?, status=? WHERE id=?`,
    [name, location ?? null, price ?? 0, status, id]
  );
  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [id]);
  return mapRow(rows[0]);
}

export async function deleteWasher(id) {
  await db.execute(`DELETE FROM washer WHERE id=?`, [id]);
  return true;
}
