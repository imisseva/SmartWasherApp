// models/User.ts

import { Account } from "./Account";

export interface User {
  id: number;
  account_id: number;
  name: string;
  email?: string;
  phone?: string;
  total_washes: number;
  free_washes_left: number;
  created_at: string;

  // Quan hệ
  account?: Account; // Optional nếu API JOIN user + account
}
