import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import client from "../constants/api";
import { useRouter } from "expo-router";

export default function EnterWasherCode() {
  const [washerId, setWasherId] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    const trimmedId = washerId.trim();
    if (!trimmedId) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập mã máy giặt!");
      return;
    }

    try {
      let washer = null;
      if (/^\d+$/.test(trimmedId)) {
        const res = await client.get(`/api/washer/${trimmedId}`);
        if (res.data?.success) washer = res.data.washer;
      } else {
        const res = await client.get(`/api/washer`, { params: { name: trimmedId } });
        console.log("🔍 name-search response:", res.data);
        // Accept either { success: true, washer } or { success: true, washers: [...] }
        if (res.data?.success && res.data.washer) washer = res.data.washer;
        if (!washer && Array.isArray(res.data?.washers) && res.data.washers.length > 0) washer = res.data.washers[0];
      }
      if (washer) {
        router.push({ pathname: "/WasherInfo", params: { washerId: String(washer.id) } });
      } else {
        Alert.alert("❌ Không tìm thấy", "Không có máy giặt nào với tên hoặc mã này!");
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tìm máy giặt:", error.message || error);
      Alert.alert("Lỗi", "Không thể kết nối đến server. Kiểm tra mạng hoặc địa chỉ API.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔢 Nhập mã máy giặt</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên hoặc ID máy giặt (ví dụ: Máy giặt 1 hoặc 1)"
        keyboardType="default"
        value={washerId}
        onChangeText={setWasherId}
      />

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>🔍 Xem thông tin máy</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4B8BF5",
    borderRadius: 10,
    padding: 14,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: { marginTop: 20 },
  backText: { color: "#4B8BF5", fontWeight: "600" },
});
