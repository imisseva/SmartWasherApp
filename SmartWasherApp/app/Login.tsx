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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("⚠️", "Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    try {
      const res = await axios.post("http://192.168.1.81:5000/api/login", {
        username: email,
        password,
      });

      if (res.data.success) {
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        router.replace("/(tabs)/HomeScreen");
      } else {
        Alert.alert("❌ Sai tài khoản hoặc mật khẩu!");
      }
    } catch (e) {
      Alert.alert("🚫 Lỗi kết nối", "Không thể kết nối tới server.");
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

        {/* Email */}
        <View style={styles.card}>
          <Text style={styles.label}>username</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#444" />
            <TextInput
              style={styles.input}
              placeholder="Username@gmail.com"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
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
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
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
