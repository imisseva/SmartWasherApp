import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../constants/api";

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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await client.post("/api/login", { username, password });
      if (res.data?.success) {
        const { user, token } = res.data;
        await AsyncStorage.setItem("user", JSON.stringify(user));
        if (token) await AsyncStorage.setItem("token", token);
        setUser(user);
        return { ok: true, user };
      }
      return { ok: false };
    } catch {
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
