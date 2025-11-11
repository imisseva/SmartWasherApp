import React, { useState } from "react";
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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useAuth } from "../hooks/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("⚠️", "Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    try {
      setBusy(true);
      const res = await signIn(username, password);
      if (!res.ok) {
        Alert.alert("🚫 Lỗi", "Tên đăng nhập hoặc mật khẩu không đúng.");
        return;
      }
      const user = res.user as any;
      const role = (user?.role || "user").toString().toLowerCase();

      if (role === "admin") {
        router.replace("/admin" as Href);
      } else {
        router.replace("/(tabs)/HomeScreen" as Href);
      }
    } catch (err: any) {
      Alert.alert("🚫 Lỗi", err?.message || "Đăng nhập thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          
          {/* Logo/Header */}
          <View style={styles.logo}>
            <Text style={styles.title}>Đăng nhập</Text>
            {/* ✅ SỬA: Thay "trở lại" bằng "đến với" và bỏ xuống dòng */}
            <Text style={styles.subtitleSingleLine}>Chào mừng đến với dịch vụ giặt ủi thông minh!</Text>
          </View>

          {/* Username */}
          <View style={styles.inputCard}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color="#444" />
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#777"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputCard}>
            <Text style={styles.label}>Mật khẩu</Text>
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
              <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeButton}>
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
              <Text style={styles.loginText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/Register")}>
              <Text style={[styles.footerText, { color: "#4B8BF5", fontWeight: "700" }]}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Quên mật khẩu", "Vui lòng liên hệ admin để đặt lại mật khẩu.") }>
              <Text style={styles.footerText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f8" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    width: "88%",
    gap: 20,
    alignItems: "center",
  },
  logo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
      fontSize: 28, 
      fontWeight: '900',
      color: '#333',
      marginTop: 10,
  },
  // Style ban đầu (vẫn giữ lại phòng trường hợp muốn xuống dòng)
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 10,
  },
  // ✅ Style mới cho 1 dòng duy nhất
  subtitleSingleLine: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    // Đảm bảo không xuống dòng trừ khi hết không gian vật lý
    // Dùng fontSize nhỏ và width rộng hơn nếu vẫn bị xuống dòng
  },
  inputCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    color: "#444",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 5,
  },
  eyeButton: {
    padding: 5,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#4B8BF5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4B8BF5",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
    marginTop: 10,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
  },
});