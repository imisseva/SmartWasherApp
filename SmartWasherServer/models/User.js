import db from "../db.js";

export async function getUserByAccountId(accountId) {
  const [rows] = await db.execute("SELECT * FROM user WHERE account_id = ?", [accountId]);
  return rows[0];
}
