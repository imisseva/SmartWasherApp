// controllers/UserController.ts
import client from "../constants/api";
import { User } from "../models/User";

export type Role = "user" | "admin";

/** ViewModel hiển thị ở Admin: gộp user + account.username/role */
export interface AdminUserVM extends User {
  username: string;
  role: Role;
}

/** Tạo mới: cần account + user profile */
export interface CreateUserDto {
  username: string;
  password: string;     // bắt buộc khi tạo
  role: Role;           // 'user' | 'admin'
  name: string;
  email?: string | null;
  phone?: string | null;
}

/** Sửa: password là tuỳ chọn */
export interface UpdateUserDto {
  id: number;               // user.id
  username: string;
  role: Role;
  name: string;
  email?: string | null;
  phone?: string | null;
  password?: string;        // nếu đổi
}

/** Chuẩn hoá response từ API về AdminUserVM[] */
function normalizeList(items: any[]): AdminUserVM[] {
  return (items ?? []).map((it) => ({
    // user fields
    id: Number(it.id),
    account_id: Number(it.account_id),
    name: it.name ?? "",
    email: it.email ?? null,
    phone: it.phone ?? null,
    total_washes: Number(it.total_washes ?? 0),
    free_washes_left: Number(it.free_washes_left ?? 0),
    created_at: it.created_at ?? "",

    // account fields (joined)
    username: it.username ?? it.account?.username ?? "",
    role: (it.role ?? it.account?.role ?? "user") as Role,
  }));
}

export const UserController = {
  /** GET /api/admin/users -> { items: [...] } */
  async list(): Promise<AdminUserVM[]> {
    const res = await client.get("/api/admin/users");
    console.log("User list response:", res.status, res.data);
    return normalizeList(res.data?.items ?? []);
  },

  /** POST /api/admin/users -> { user: {...} }  (server tạo account + user) */
  async create(input: CreateUserDto): Promise<AdminUserVM> {
    const res = await client.post("/api/admin/users", input);
    const item = res.data?.user ?? res.data; // tuỳ backend
    return normalizeList([item])[0];
  },

  /** PUT /api/admin/users/:id -> { user: {...} } */
  async update(input: UpdateUserDto): Promise<AdminUserVM> {
    const payload: any = {
      username: input.username,
      role: input.role,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
    };
    if (input.password && input.password.trim()) {
      payload.password = input.password.trim();
    }
    const res = await client.put(`/api/admin/users/${input.id}`, payload);
    const item = res.data?.user ?? res.data;
    return normalizeList([item])[0];
  },

  /** DELETE /api/admin/users/:id -> { success: true } */
  async remove(id: number): Promise<void> {
    await client.delete(`/api/admin/users/${id}`);
  },
};
