import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  DeviceEventEmitter,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import client from "../../constants/api"; // ✅ dùng axios client chung

export default function HomeScreen() {
  // Hàm test reset lượt giặt (chỉ cho admin)
  const handleTestReset = async () => {
    try {
      const res = await client.post("/api/test/reset-washes");
      if (res.data?.success) {
        Alert.alert("✅ Reset thành công", res.data.message);
        // Refresh user data
        const data = await AsyncStorage.getItem("user");
        if (data) setUser(JSON.parse(data));
      } else {
        Alert.alert("❌ Lỗi", res.data?.message || "Không thể reset");
      }
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err?.message || "Không thể kết nối tới server");
    }
  };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [machineCode, setMachineCode] = useState("");
  const [currentDay, setCurrentDay] = useState(1); // 1 = Thứ 2, 7 = Chủ nhật

  // Hàm để tính số ngày còn lại đến thứ 2 tiếp theo
  const getDaysUntilNextMonday = (currentDayOfWeek: number) => {
    // Nếu là chủ nhật (7), trả về 1 vì ngày mai là thứ 2
    // Nếu là các ngày khác, tính số ngày còn lại đến thứ 2
    return currentDayOfWeek === 7 ? 1 : 8 - currentDayOfWeek;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        const userData = JSON.parse(data);
        console.log("User data in HomeScreen:", userData); // Debug log
        setUser(userData);
      }
      setLoading(false);
    };
    fetchUser();
    const sub = DeviceEventEmitter.addListener("historyUpdated", async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    });
    return () => sub.remove();
  }, []);

  // ===== Đăng xuất =====
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          router.replace("/Login");
        },
      },
    ]);
  };

  // (Removed Alert.prompt helper — using modal for cross-platform input)

  // ===== Modal nhập mã máy =====
  const handleConfirmMachine = async () => {
    const input = machineCode.trim();
    if (!input) {
      Alert.alert("⚠️", "Vui lòng nhập mã máy giặt!");
      return;
    }

    try {
      const isNumeric = /^\d+$/.test(input);
      let res;
      if (isNumeric) {
        res = await client.get(`/api/washer/${input}`);
      } else {
        res = await client.get(`/api/washer?name=${encodeURIComponent(input)}`);
      }

      const washer = res?.data?.washer ?? (Array.isArray(res?.data?.washers) && res.data.washers[0]);

      if (washer) {
        setModalVisible(false);
        setMachineCode("");
        router.push({ pathname: "/WasherInfo", params: { washerId: String(washer.id) } });
      } else {
        Alert.alert("❌", res?.data?.message || "Không tìm thấy máy giặt với mã này!");
      }
    } catch (error: any) {
      console.warn(error);
      Alert.alert("❌ Lỗi", "Không thể kết nối tới server.");
    }
  };

  // ===== Quét QR (chưa dùng) =====
  const handleScanQR = () => {
    Alert.alert("📷 Quét mã QR", "Tính năng quét QR đang được phát triển!");
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4B8BF5" />
      </View>
    );
  }
  const displayName =
  (user?.name && user.name.trim()) ||  // ưu tiên họ tên
  user?.account?.username ||           // fallback username
  "Người dùng";
  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.username}>{displayName}</Text>
            {typeof user?.free_washes_left === "number" && (
              <>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeText}>
                    {user.free_washes_left} lượt miễn phí
                  </Text>
                </View>
                <Text style={styles.resetNote}>
                  {getDaysUntilNextMonday(currentDay) === 0 
                    ? "Reset hôm nay lúc 00:00"
                    : `Reset sau ${getDaysUntilNextMonday(currentDay)} ngày`}
                </Text>
                {/* Thanh chọn ngày để test */}
                <View style={styles.daySelector}>
                  {[1,2,3,4,5,6,7].map(day => (
                    <TouchableOpacity 
                      key={day}
                      style={[
                        styles.dayButton,
                        currentDay === day && styles.selectedDay
                      ]}
                      onPress={() => setCurrentDay(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        currentDay === day && styles.selectedDayText
                      ]}>
                        {day === 7 ? "CN" : `T${day + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Nút test reset (chỉ hiện cho admin) */}
                {user?.account?.role === 'admin' && (
                  <TouchableOpacity 
                    style={styles.testButton}
                    onPress={handleTestReset}
                  >
                    <Text style={styles.testButtonText}>
                      🧪 Test Reset
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.headerButtons}>
          {/* Nút test reset cho admin */}
          {user?.account?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={handleTestReset}
            >
              <Ionicons name="refresh-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          
          {/* Nút đăng xuất */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Nội dung chính ===== */}
      <Text style={styles.title}>Chọn cách bắt đầu chu trình giặt</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.optionButton, styles.leftButton]}
          onPress={() => setModalVisible(true)} // mở modal thay vì Alert.prompt
        >
          <Ionicons name="pricetag-outline" size={50} color="#fff" />
          <Text style={styles.optionText}>Nhập mã máy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.rightButton]}
          onPress={handleScanQR}
        >
          <Ionicons name="qr-code-outline" size={50} color="#fff" />
          <Text style={styles.optionText}>Quét mã QR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>Hoặc</Text>
      <Text style={styles.note}>Chọn một trong hai cách để bắt đầu giặt</Text>

      {/* ===== Modal nhập mã máy ===== */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🔢 Nhập mã máy giặt</Text>
            <TextInput
              placeholder="VD: 1 hoặc Máy giặt 1"
              style={styles.input}
              value={machineCode}
              onChangeText={setMachineCode}
              keyboardType="default"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4B8BF5" }]}
                onPress={handleConfirmMachine}
              >
                <Text style={{ color: "#fff" }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 30,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#eee" },
  greeting: { fontSize: 14, color: "#666" },
  username: { fontSize: 18, fontWeight: "700", color: "#333" },
  logoutButton: { backgroundColor: "#4B8BF5", padding: 8, borderRadius: 20 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },
  buttonRow: { flexDirection: "row", gap: 16, justifyContent: "center" },
  optionButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  leftButton: { backgroundColor: "#3AB0A2" },
  rightButton: { backgroundColor: "#4B8BF5" },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  orText: {
    fontSize: 16,
    marginVertical: 30,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  note: { fontSize: 14, color: "#777", textAlign: "center" },

  // ===== Modal nhập mã =====
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  freeBadge: {
    marginTop: 6,
    backgroundColor: "#e6fffa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  freeText: { fontSize: 12, color: "#047857", fontWeight: "700" },
  resetNote: { 
    fontSize: 11, 
    color: "#666",
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic'
  },
  daySelector: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: '#4B8BF5',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  testButton: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    fontSize: 12,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    backgroundColor: '#047857', // màu xanh lá đậm
    padding: 8,
    borderRadius: 20,
  },
});
