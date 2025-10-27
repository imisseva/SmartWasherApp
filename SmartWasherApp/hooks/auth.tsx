import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthController } from "../controllers/AuthController";
import { DeviceEventEmitter } from 'react-native';

export type AppUser = {
  id: number;
  username: string;
  role: "user" | "admin";
  name?: string;
  email?: string;
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ ok: boolean; user?: AppUser }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => ({ ok: false }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên từ AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) setUser(JSON.parse(raw));
        // Notify socket (or other listeners) that we have restored the user session
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            DeviceEventEmitter.emit('userIdentified', { user: parsed });
          } catch {
            /* ignore parse errors */
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // Reuse client-side controller to normalize user shape and persist token
      const user = await AuthController.login(username, password);
      // Chuẩn hoá thành shape dùng trong app: có top-level username và role
      const normalized = {
        ...user,
        username: user?.account?.username ?? (user as any)?.username ?? "",
        role: (user?.account?.role ?? (user as any)?.role ?? "user") as "user" | "admin",
      } as AppUser & { account?: any };

      // Ghi đè AsyncStorage với object đã chuẩn hoá để các phần khác dùng chung shape
  try { await AsyncStorage.setItem("user", JSON.stringify(normalized)); } catch { /* ignore */ }

      setUser(normalized as any);
      try { DeviceEventEmitter.emit('userIdentified', { user: normalized }); } catch {}
      return { ok: true, user: normalized };
    } catch (err) {
      console.error("signIn error:", err);
      return { ok: false };
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(["user", "token"]);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
