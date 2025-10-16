import db from "../db.js";

export async function getAccountByUsername(username) {
  const [rows] = await db.execute("SELECT * FROM account WHERE username = ?", [username]);
  return rows[0];
}
