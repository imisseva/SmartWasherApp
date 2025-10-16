import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function EnterWasherCode() {
  const [washerId, setWasherId] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    if (!washerId) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập mã máy giặt!");
      return;
    }

    try {
      const res = await axios.get(`http://192.168.1.81:8081/api/washer/${washerId}`);
      if (res.data.success) {
        router.push({
          pathname: "/HomeScreen",
          params: { washer: JSON.stringify(res.data.washer) },
        });
      } else {
        Alert.alert("❌", "Không tìm thấy máy giặt!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến server!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔢 Nhập mã máy giặt</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập ID máy giặt..."
        keyboardType="numeric"
        value={washerId}
        onChangeText={setWasherId}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Xem thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7fb", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 30 },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  button: { backgroundColor: "#4B8BF5", borderRadius: 10, padding: 14, width: "100%" },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" },
  backButton: { marginTop: 20 },
  backText: { color: "#4B8BF5", fontWeight: "600" },
});
