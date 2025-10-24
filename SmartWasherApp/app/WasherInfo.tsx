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
  ActivityIndicator,
  DeviceEventEmitter,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Washer } from "../models/Washer";
import { WasherController } from "../controllers/WasherController";

export default function WasherInfo() {
  const router = useRouter();
  const { washerId } = useLocalSearchParams<{ washerId?: string }>();
  const [washer, setWasher] = useState<Washer | null>(null);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWasher = async () => {
      try {
        const id = washerId && !isNaN(Number(washerId)) ? Number(washerId) : null;
        if (!id) {
          Alert.alert("Lỗi", "Không có ID máy giặt hợp lệ!");
          router.back();
          return;
        }

        const data = await WasherController.getWasherById(id);
        if (!data) {
          Alert.alert("❌ Không tìm thấy", "Máy giặt không tồn tại hoặc bị xoá.");
          router.back();
        } else {
          setWasher(data);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy máy giặt:", err);
        Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadWasher();
  }, [washerId, router]);

  const handleCalculate = async () => {
    const kg = parseFloat(weight);

    if (!washer) {
      Alert.alert("Lỗi", "Chưa tải thông tin máy giặt");
      return;
    }

    if (washer.status !== "available") {
      Alert.alert("⚠️ Máy bận", "Máy này hiện đang bận hoặc không hoạt động.");
      return;
    }

    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Sai định dạng", "Vui lòng nhập số ký hợp lệ, ví dụ: 2.5");
      return;
    }

    try {
      // 1. Gửi lệnh START đến máy giặt
      const startRes = await WasherController.startWasher(washer.id);
      if (!startRes?.success) {
        throw new Error(startRes?.message || "Không thể bắt đầu giặt");
      }

      // 2. Tính tiền và lưu lịch sử
      const totalCost = await WasherController.calculateAndSaveWash(kg, washer);
      
      // 3. Bắt đầu polling để kiểm tra trạng thái máy giặt
      const checkWasherStatus = async () => {
        const data = await WasherController.getWasherById(washer.id);
        
        // Nếu máy giặt xong (available) hoặc gặp lỗi
        if (data?.status === 'available') {
          Alert.alert(
            "Máy giặt đã hoàn thành! 🧺",
            `${data.name || 'Máy giặt'} đã giặt xong, bạn có thể lấy quần áo.`,
            [{ text: "OK" }]
          );
          clearInterval(statusInterval);
        } else if (data?.status === 'error') {
          Alert.alert(
            "❌ Máy giặt gặp sự cố",
            "Vui lòng liên hệ nhân viên để được hỗ trợ.",
            [{ text: "OK" }]
          );
          clearInterval(statusInterval);
        }
      };

      // Kiểm tra mỗi 5 giây
      const statusInterval = setInterval(checkWasherStatus, 5000);

      // 3. Hiển thị thông báo và theo dõi trạng thái
      Alert.alert(
        "✅ Đã bắt đầu giặt",
        `- Máy giặt ${washer.name} đang hoạt động\n- Tổng tiền: ${totalCost.toLocaleString()}đ\n- Lịch sử giặt đã được lưu.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Notify listeners (HistoryScreen) to refresh
              try {
                DeviceEventEmitter.emit("historyUpdated");
              } catch (e: any) {
                console.warn("Emit historyUpdated failed:", e?.message || e);
              }
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("❌ Lỗi khi giặt:", err);
      Alert.alert("Lỗi", err.message || "Không thể bắt đầu giặt.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B8BF5" />
        <Text style={{ marginTop: 12 }}>Đang tải thông tin máy giặt...</Text>
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
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Quay lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}>🧺 Thông tin máy giặt</Text>

            <View style={styles.infoBox}>
              <InfoRow label="Tên máy" value={washer?.name} />
              <InfoRow label="Vị trí" value={washer?.location} />
              <InfoRow label="Tải tối đa" value={`${washer?.weight} kg`} />
              <InfoRow label="Giá mỗi lượt" value={`${washer?.price.toLocaleString()}đ`} />

              <Text style={styles.label}>Trạng thái:</Text>
              <Text
                style={[
                  styles.value,
                  { color: washer?.status === "available" ? "green" : "red" },
                ]}
              >
                {washer?.status === "available"
                  ? "Sẵn sàng"
                  : washer?.status === "running"
                  ? "Đang chạy"
                  : "Bị lỗi"}
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

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value ?? "—"}</Text>
    </>
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
