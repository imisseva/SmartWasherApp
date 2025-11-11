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
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.screen}>
            
            {/* Logo/Header */}
            <View style={styles.logo}>
              <Text style={styles.title}>Đăng ký tài khoản</Text>
              <Text style={styles.subtitle}>Điền thông tin để tham gia dịch vụ.</Text>
            </View>

            {/* Tên đầy đủ */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Tên đầy đủ (*)</Text>
              <TextInput style={styles.input} placeholder="Họ và tên" value={name} onChangeText={setName} />
            </View>
            
            {/* Username */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Username (*)</Text>
              <TextInput style={styles.input} placeholder="Tên đăng nhập" autoCapitalize="none" value={username} onChangeText={setUsername} />
            </View>

            {/* Password */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Password (*)</Text>
              <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            {/* Email */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Email (Tùy chọn)</Text>
              <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>

            {/* Phone */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Số điện thoại (Tùy chọn)</Text>
              <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            <TouchableOpacity 
                style={[styles.registerBtn, busy && { opacity: 0.7 }]} 
                onPress={handleRegister} 
                disabled={busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerText}>Đăng ký</Text>}
            </TouchableOpacity>

            {/* SỬA: Tách và highlight chữ "Đăng nhập" */}
            <TouchableOpacity onPress={() => router.back()} style={styles.footer}>
              <Text style={styles.footerText}>
                Bạn đã có tài khoản?{' '}
                <Text style={[styles.footerText, styles.highlightText]}>
                    Đăng nhập
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f8" },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
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
    gap: 18,
    alignItems: "center",
  },
  logo: { 
      alignItems: 'center',
      marginBottom: 10,
  },
  title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#333',
      marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
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
      marginBottom: 5 
  },
  input: { 
      fontSize: 16, 
      color: "#000",
      paddingVertical: 5,
  },
  registerBtn: { 
    width: "100%", 
    backgroundColor: "#3AB0A2",
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#3AB0A2",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  registerText: { 
      color: "#fff", 
      fontWeight: "700",
      fontSize: 17, 
  },
  footer: { 
      marginTop: 15 
  },
  footerText: { 
      color: "#666",
      fontWeight: '600',
      fontSize: 13,
  },
  // ✅ STYLE MỚI CHO HIGHLIGHT
  highlightText: {
    color: '#000', // Màu đen
    fontWeight: '800', // Thêm độ đậm
  }
});