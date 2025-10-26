import db from "../db.js";

export async function getUserByAccountId(accountId) {
  const [rows] = await db.execute("SELECT * FROM user WHERE account_id = ?", [accountId]);
  return rows[0];
}

/** Chuẩn hoá 1 row JOIN */
export function mapRow(r) {
  return {
    id: Number(r.id),
    account_id: Number(r.account_id),
    name: r.name,
    email: r.email,
    phone: r.phone,
    total_washes: Number(r.total_washes || 0),
    free_washes_left: Number(r.free_washes_left || 0),
    created_at: r.created_at,
    username: r.username,   // từ account
    role: r.role,           // từ account
  };
}

/** Lấy danh sách người dùng (JOIN account) */
export async function listAdminUsers() {
  const [rows] = await db.execute(
    `SELECT u.*, a.username, a.role
     FROM user u
     JOIN account a ON a.id = u.account_id
     ORDER BY u.created_at DESC`
  );
  return rows.map(mapRow);
}

/** Tạo account + user (transaction) */
export async function createUserWithAccount({ username, password, role, name, email, phone }) {
  const conn = await db.getConnection();     // ✅ Bây giờ có function này
  try {
    await conn.beginTransaction();

    // 1) Tạo account
    const [accRes] = await conn.execute(
      `INSERT INTO account (username, password, role) VALUES (?, ?, ?)`,
      [username, password, role]
    );
    const accountId = accRes.insertId;

    // 2) Tạo user profile
    const [userRes] = await conn.execute(
      `INSERT INTO user (account_id, name, email, phone)
       VALUES (?, ?, ?, ?)`,
      [accountId, name, email ?? null, phone ?? null]
    );
    const userId = userRes.insertId;

    await conn.commit();

    // 3) Trả về view model (tuỳ bạn)
    return {
      id: userId,
      account_id: accountId,
      name,
      email: email ?? null,
      phone: phone ?? null,
      total_washes: 0,
      free_washes_left: 4,
      created_at: new Date().toISOString(),
      username,
      role,
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Cập nhật account + user (transaction) */
export async function updateAdminUser({ id, username, password, role, name, email, phone }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // lấy account_id
    const [urows] = await conn.execute(`SELECT account_id FROM user WHERE id=?`, [id]);
    if (!urows.length) throw new Error("User not found");
    const accountId = urows[0].account_id;

    // check trùng username nếu đổi
    if (username) {
      const [dups] = await conn.execute(
        `SELECT id FROM account WHERE username=? AND id<>?`,
        [username, accountId]
      );
      if (dups.length) throw new Error("Username already exists");
    }

    await conn.execute(
      `UPDATE account
       SET username = COALESCE(?, username),
           role     = COALESCE(?, role)
       WHERE id = ?`,
      [username || null, role || null, accountId]
    );

    if (password && String(password).trim()) {
      await conn.execute(`UPDATE account SET password=? WHERE id=?`, [password, accountId]);
    }

    await conn.execute(
      `UPDATE user
       SET name = COALESCE(?, name),
           email = ?,
           phone = ?
       WHERE id = ?`,
      [name || null, email ?? null, phone ?? null, id]
    );

    const [rows] = await conn.execute(
      `SELECT u.*, a.username, a.role
       FROM user u JOIN account a ON a.id = u.account_id
       WHERE u.id = ?`,
      [id]
    );

    await conn.commit();
    return mapRow(rows[0]);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Xoá user + account (transaction) */
export async function deleteAdminUser(id) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [urows] = await conn.execute(`SELECT account_id FROM user WHERE id=?`, [id]);
    if (!urows.length) throw new Error("User not found");
    const accountId = urows[0].account_id;

    // Delete dependent records that reference this user first to avoid FK constraint errors
    // 1) wash_history entries
    await conn.execute(`DELETE FROM wash_history WHERE user_id = ?`, [id]);

    // 2) any admin row that references this account (rare, but safe)
    await conn.execute(`DELETE FROM admin WHERE account_id = ?`, [accountId]);

    // 3) delete user and account
    await conn.execute(`DELETE FROM user WHERE id=?`, [id]);
    await conn.execute(`DELETE FROM account WHERE id=?`, [accountId]);

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Reset số lượt giặt miễn phí về mặc định */
export async function resetWeeklyFreeWashes(defaultWashes = 7) {
  const [result] = await db.execute(
    "UPDATE user SET free_washes_left = ?",
    [defaultWashes]
  );
  return result.affectedRows;
}
