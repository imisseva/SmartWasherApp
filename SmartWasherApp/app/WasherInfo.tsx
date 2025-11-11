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
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Import SafeAreaView
import { useRouter, useLocalSearchParams } from "expo-router";
import { Washer } from "../models/Washer"; // Giả định import này tồn tại
import { WasherController } from "../controllers/WasherController"; // Giả định import này tồn tại
import { Ionicons } from "@expo/vector-icons";

export default function WasherInfo() {
  const router = useRouter();
  const { washerId } = useLocalSearchParams<{ washerId?: string }>();
  const [washer, setWasher] = useState<Washer | null>(null);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);

  // ... (Giữ nguyên logic loadWasher và handleCalculate)

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
        if (data) setWasher(data);

        if (data?.status === 'available' || data?.status === 'error') {
          clearInterval(statusInterval);
          
          const history = await WasherController.getLastWashHistory(washer.id);
          const isFinished = data?.status === 'available';
          const isError = data?.status === 'error';

          const explicitError = history && (history.status === 'error' || (history.notes && /hoàn|hoan|hoàn lại|hoan lai/i.test(history.notes)));

          if (isError || (isFinished && (explicitError || (history && history.cost === 0 && history.end_time)))) {
            // Trường hợp lỗi/hoàn tiền
            const note = history?.notes 
              ? `\nGhi chú: ${history.notes}` 
              : isError
                ? "Vui lòng liên hệ nhân viên để được hỗ trợ."
                : "\nLượt giặt miễn phí đã được hoàn lại vào tài khoản của bạn.";
            
            Alert.alert(
              "❌ Giặt không thành công",
              `${data.name || 'Máy giặt'} gặp lỗi trong quá trình giặt.${note}`,
              [{ text: "OK" }]
            );
          } else if (isFinished) {
            // Trường hợp thành công
            Alert.alert(
              "✅ Giặt thành công!",
              `${data.name || 'Máy giặt'} đã giặt xong, bạn có thể lấy quần áo.`,
              [{ text: "OK" }]
            );
          }
          
          // Refresh user info
          try {
            const resp = await (await import('../constants/api')).default.get('/api/auth/me');
            if (resp.data?.success) {
              DeviceEventEmitter.emit('userUpdated', { user: resp.data.user, isRefund: explicitError || (history && history.cost === 0) });
            } else {
              DeviceEventEmitter.emit('userUpdated');
            }
          } catch {
            DeviceEventEmitter.emit('userUpdated');
          }
        }
      };

      const statusInterval = setInterval(checkWasherStatus, 5000);

      // 3. Hiển thị thông báo và theo dõi trạng thái
      Alert.alert(
        "✅ Đã bắt đầu giặt",
        `- Máy giặt ${washer.name} đang hoạt động\n- Tổng tiền: ${totalCost.toLocaleString()}đ\n- Lịch sử giặt đã được lưu.`,
        [
          {
            text: "OK",
            onPress: () => {
              DeviceEventEmitter.emit("historyUpdated");
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
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#4B8BF5" />
          <Text style={{ marginTop: 12 }}>Đang tải thông tin máy giặt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lấy trạng thái và màu sắc
  let statusText = "";
  let statusColor = "#999"; // Default
  if (washer?.status === "available") {
    statusText = "Sẵn sàng";
    statusColor = "#2ecc71"; // Xanh lá
  } else if (washer?.status === "running") {
    statusText = "Đang chạy";
    statusColor = "#f39c12"; // Cam
  } else {
    statusText = "Bị lỗi";
    statusColor = "#e74c3c"; // Đỏ
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#4B8BF5" />
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>

              <Text style={styles.title}>🧺 Thông tin máy giặt</Text>

              {/* Thông tin chung */}
              <View style={styles.infoBox}>
                <Text style={styles.machineName}>{washer?.name ?? "Không rõ"}</Text>
                
                <InfoRow label="Vị trí" icon="locate-outline" value={washer?.location} />
                <InfoRow label="Tải tối đa" icon="color-fill-outline" value={`${washer?.weight} kg`} />
                <InfoRow label="Giá mỗi lượt" icon="cash-outline" value={`${washer?.price.toLocaleString()}đ`} />

                {/* Trạng thái nổi bật */}
                <View style={[styles.statusRow, { borderColor: statusColor }]}>
                  <Text style={styles.statusLabel}>Trạng thái:</Text>
                  <Text style={[styles.statusValue, { color: statusColor }]}>
                    <Ionicons name="pulse-outline" size={16} color={statusColor} /> {statusText}
                  </Text>
                </View>
              </View>

              {/* Nhập trọng lượng */}
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nhập số ký cần giặt:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 3.5"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                  editable={washer?.status === "available"}
                />
                <Text style={styles.inputHelper}>* Giới hạn: {washer?.weight} kg</Text>
              </View>

              {/* Nút bấm */}
              <TouchableOpacity 
                style={[
                    styles.button, 
                    washer?.status !== "available" && styles.disabledButton
                ]} 
                onPress={handleCalculate}
                disabled={washer?.status !== "available"}
              >
                <Text style={styles.buttonText}>💰 Tính tiền & Bắt đầu giặt</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string | number | null; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#4B8BF5" />
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value ?? "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fb" },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: "#4B8BF5",
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  machineName: {
      fontSize: 20,
      fontWeight: '900',
      color: '#3AB0A2',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontWeight: "500",
    color: "#555",
    flexGrow: 0,
    minWidth: 90,
  },
  value: {
    fontWeight: "700",
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontWeight: "700",
    color: "#333",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  inputHelper: {
      fontSize: 12,
      color: '#888',
      marginTop: 8,
      fontStyle: 'italic',
  },
  button: {
    backgroundColor: "#4B8BF5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4B8BF5",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});