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

export async function createWasher({ id, name, location, weight, price, status, ip_address }) {
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

// ✅ Cập nhật an toàn
export async function updateWasherLimited({ id, name, location, price, status }) {
  const safeId = Number(id);
  const safeName = name ?? "";
  const safeLocation = location ?? null;
  const safePrice = Number(price ?? 0);
  const safeStatus = status ?? "available";

  await db.execute(
    `UPDATE washer SET name=?, location=?, price=?, status=? WHERE id=?`,
    [safeName, safeLocation, safePrice, safeStatus, safeId]
  );

  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [safeId]);
  return rows.length ? mapRow(rows[0]) : null;
}

export async function deleteWasher(id) {
  await db.execute(`DELETE FROM washer WHERE id=?`, [id]);
  return true;
}

export async function findWasherByName(name) {
  const [rows] = await db.execute(`SELECT * FROM washer WHERE name=? LIMIT 1`, [name]);
  return rows.length ? mapRow(rows[0]) : null;
}

export async function getWasherById(id) {
  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [id]);
  return rows.length ? mapRow(rows[0]) : null;
}

// ⚠️ Không dùng cho command nữa, nhưng giữ lại để tránh lỗi import
export async function getWasherCommandById(id) {
  const [rows] = await db.execute(`SELECT status FROM washer WHERE id=?`, [id]);
  if (rows.length === 0) return null;
  return { id, command: rows[0].status === "running" ? "START" : "NONE" };
}

export async function startWasherById(id) {
  await db.execute(`UPDATE washer SET status='running', last_used=NOW() WHERE id=?`, [id]);
  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [id]);
  return mapRow(rows[0]);
}

export async function stopWasherById(id) {
  await db.execute(`UPDATE washer SET status='available' WHERE id=?`, [id]);
  const [rows] = await db.execute(`SELECT * FROM washer WHERE id=?`, [id]);
  return mapRow(rows[0]);
}


export const Washer = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM washer", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM washer WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },
};
