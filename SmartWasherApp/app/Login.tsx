import React, { useState } from "react";
import type { Href } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import client from "../constants/api"; // <-- dùng axios instance

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("⚠️", "Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    try {
      setBusy(true);
      const res = await client.post("/api/login", {
        username,
        password,
      });

      if (res.data?.success) {
        const { user, token } = res.data;

        // Lưu user + token (nếu có)
        await AsyncStorage.setItem("user", JSON.stringify(user));
        if (token) await AsyncStorage.setItem("token", token);

        // Điều hướng theo rolep
        if (user?.role === "admin") {
          router.replace("/admin" as Href);
        } else {
          router.replace("/(tabs)/HomeScreen");
        }
      } else {
        Alert.alert("❌", res.data?.message || "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (e?.message?.includes("Network") ? "Không thể kết nối tới server." : "Đăng nhập thất bại.");
      Alert.alert("🚫 Lỗi", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.screen}>
        {/* Logo */}
        <View style={styles.logo}>
          <Ionicons name="water-outline" size={80} color="#3D4785" />
        </View>

        {/* Username */}
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color="#444" />
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#777"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.card}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#444" />
            <TextInput
              style={styles.input}
              placeholder="············"
              placeholderTextColor="#777"
              secureTextEntry={!show}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShow(!show)}>
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#444"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginBtn, busy && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sign up</Text>
          <Text style={styles.footerText}>Forgot Password?</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(218, 50%, 91%)",
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    backgroundColor: "hsl(213, 85%, 97%)",
    padding: 24,
    borderRadius: 30,
    shadowColor: "hsl(231, 62%, 94%)",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    width: "85%",
    gap: 24,
    alignItems: "center",
  },
  logo: {
    marginTop: -20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    width: "100%",
    shadowColor: "hsl(231, 62%, 94%)",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  label: {
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "hsl(233, 36%, 38%)",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "hsl(0, 0%, 37%)",
  },
});
