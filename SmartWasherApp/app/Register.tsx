import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthController } from "../controllers/AuthController";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !password || !name) {
      Alert.alert("⚠️", "Vui lòng nhập username, password và tên đầy đủ");
      return;
    }
    try {
      setBusy(true);
  await AuthController.register({ username, password, name, email, phone });
      Alert.alert("✅", "Đăng ký thành công", [{ text: "OK", onPress: () => router.replace("/(tabs)/HomeScreen") }]);
    } catch (err: any) {
      Alert.alert("❌", err?.message || "Đăng ký thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.screen}>
        <View style={styles.logo}>
          <Ionicons name="person-add-outline" size={64} color="#3D4785" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tên đầy đủ</Text>
          <TextInput style={styles.input} placeholder="Họ và tên" value={name} onChangeText={setName} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} placeholder="username" autoCapitalize="none" value={username} onChangeText={setUsername} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Email (tuỳ chọn)" keyboardType="email-address" value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} placeholder="Số điện thoại (tuỳ chọn)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </View>

        <TouchableOpacity style={[styles.loginBtn, busy && { opacity: 0.6 }]} onPress={handleRegister} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Đăng ký</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn đã có tài khoản? Đăng nhập</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "hsl(218, 50%, 91%)", justifyContent: "center", alignItems: "center" },
  screen: {
    backgroundColor: "hsl(213, 85%, 97%)",
    padding: 24,
    borderRadius: 30,
    shadowColor: "hsl(231, 62%, 94%)",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    width: "85%",
    gap: 16,
    alignItems: "center",
  },
  logo: { marginTop: -10, marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 10, width: "100%" },
  label: { color: "#444", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { fontSize: 15, color: "#000" },
  loginBtn: { width: "100%", backgroundColor: "hsl(233, 36%, 38%)", padding: 12, borderRadius: 20, alignItems: "center" },
  loginText: { color: "#fff", fontWeight: "700" },
  footer: { marginTop: 12 },
  footerText: { color: "#666" },
});
