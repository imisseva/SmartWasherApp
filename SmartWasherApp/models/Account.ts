// models/Account.ts

export interface Account {
  id: number;
  username: string;
  password?: string; // thường không cần gửi ra frontend, nhưng có thể giữ nếu cần đăng nhập
  role: "user" | "admin";
  created_at: string;
}
