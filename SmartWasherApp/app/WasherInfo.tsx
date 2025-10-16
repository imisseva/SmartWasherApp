import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Washer } from "../models/Washer";
import { WasherController } from "../controllers/WasherController";

export default function WasherInfo() {
  const router = useRouter();
  const { washerId } = useLocalSearchParams();
  const [washer, setWasher] = useState<Washer | null>(null);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWasher = async () => {
      const id = washerId ? Number(washerId) : 1;
      const data = await WasherController.getWasherById(id);
      if (!data) Alert.alert("Lỗi", "Không tìm thấy máy giặt!");
      setWasher(data);
      setLoading(false);
    };
    loadWasher();
  }, []);

  const handleCalculate = async () => {
    const kg = parseFloat(weight);
    if (!washer) {
      Alert.alert("Lỗi", "Chưa tải thông tin máy giặt");
      return;
    }
    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Sai định dạng", "Vui lòng nhập số ký hợp lệ");
      return;
    }

    try {
      const totalCost = await WasherController.calculateAndSaveWash(kg, washer);
      Alert.alert(
        "✅ Thành công",
        `Tổng tiền: ${totalCost.toLocaleString()}đ\nLịch sử giặt đã được lưu.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error("❌ Lỗi khi lưu lịch sử:", err);
      Alert.alert("Lỗi", err.message || "Không thể lưu lịch sử giặt");
    }
  };

  if (loading)
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>Đang tải thông tin máy giặt...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Quay lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}>🧺 Thông tin máy giặt</Text>

            <View style={styles.infoBox}>
              <Text style={styles.label}>Tên máy:</Text>
              <Text style={styles.value}>{washer?.name}</Text>

              <Text style={styles.label}>Vị trí:</Text>
              <Text style={styles.value}>{washer?.location}</Text>

              <Text style={styles.label}>Cân nặng tối đa:</Text>
              <Text style={styles.value}>{washer?.weight} kg</Text>

              <Text style={styles.label}>Giá mỗi lượt:</Text>
              <Text style={styles.value}>
                {washer?.price.toLocaleString()}đ
              </Text>

              <Text style={styles.label}>Trạng thái:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      washer?.status === "available" ? "green" : "red",
                  },
                ]}
              >
                {washer?.status === "available"
                  ? "Sẵn sàng"
                  : "Đang chạy / Lỗi"}
              </Text>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Nhập số ký cần giặt:</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 3.5"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCalculate}>
              <Text style={styles.buttonText}>💰 Tính tiền & Lưu lịch sử</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#f5f7fb", paddingBottom: 50 },
  container: { flex: 1, padding: 20 },
  backButton: { color: "#4B8BF5", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20, color: "#000" },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#ccc",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontWeight: "600", color: "#555" },
  value: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  inputBox: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
  },
  button: { backgroundColor: "#4B8BF5", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
