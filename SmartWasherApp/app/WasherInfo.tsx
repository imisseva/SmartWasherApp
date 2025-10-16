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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function WasherInfo() {
  const router = useRouter();
  const { washerId } = useLocalSearchParams(); // nhận id máy nếu được truyền
  const [washer, setWasher] = useState<any>(null);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWasher = async () => {
      try {
        const id = washerId || 1; // nếu không có param thì mặc định id=1
        const res = await axios.get(`http://192.168.1.81:5000/api/washer/${id}`);
        if (res.data.success) {
          setWasher(res.data.washer);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy máy giặt!");
        }
      } catch (err) {
        console.warn("❌ Không thể kết nối server:", err);
        Alert.alert("Lỗi", "Không thể tải thông tin máy giặt");
      } finally {
        setLoading(false);
      }
    };
    fetchWasher();
  }, []);

  const handleCalculate = async () => {
    if (!weight) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số ký cần giặt");
      return;
    }

    const kg = parseFloat(weight);
    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Sai định dạng", "Số ký phải là số hợp lệ");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (!user) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      // Giả định free_washes_left còn 4 lượt miễn phí
      const freeWashes = user.free_washes_left ?? 0;
      let totalCost = 0;

      if (freeWashes > 0) {
        totalCost = 0;
      } else {
        totalCost = Math.round((washer?.price / washer?.weight) * kg);
      }

      // Lưu lịch sử lên server
      await axios.post("http://192.168.1.81:5000/api/wash-history", {
        user_id: user.id,
        washer_id: washer.id,
        cost: totalCost,
      });

      Alert.alert(
        "✅ Thành công",
        `Tổng tiền: ${totalCost.toLocaleString()}đ\nLịch sử giặt đã được lưu.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.error("❌ Lỗi khi lưu lịch sử:", err);
      Alert.alert("Lỗi", "Không thể lưu lịch sử giặt");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>Đang tải thông tin máy giặt...</Text>
      </View>
    );
  }

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
            {/* 🔙 Nút quay lại */}
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Quay lại</Text>
            </TouchableOpacity>

            {/* 🧺 Tiêu đề */}
            <Text style={styles.title}>🧺 Thông tin máy giặt</Text>

            {/* Thông tin máy */}
            <View style={styles.infoBox}>
              <Text style={styles.label}>Tên máy:</Text>
              <Text style={styles.value}>{washer?.name || "-"}</Text>

              <Text style={styles.label}>Vị trí:</Text>
              <Text style={styles.value}>{washer?.location || "-"}</Text>

              <Text style={styles.label}>Cân nặng tối đa:</Text>
              <Text style={styles.value}>{washer?.weight} kg</Text>

              <Text style={styles.label}>Giá mỗi lượt:</Text>
              <Text style={styles.value}>
                {washer?.price?.toLocaleString()}đ
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

            {/* Nhập cân nặng */}
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

            {/* Nút tính tiền */}
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
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f7fb",
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    color: "#4B8BF5",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
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
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#4B8BF5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
