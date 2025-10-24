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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [machineCode, setMachineCode] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const userData = JSON.parse(data);
          // Lấy thông tin mới nhất từ API (nếu đã login và token có trong AsyncStorage)
          try {
            const response = await client.get(`/api/auth/me`);
            if (response.data?.success) {
              const updatedUser = response.data.user;
              // Cập nhật vào AsyncStorage
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } catch {
            // Nếu API /me thất bại, fallback về dữ liệu cục bộ
            setUser(userData);
          }
        }
      } catch (error) {
        console.warn("Không thể cập nhật thông tin user:", error);
        const data = await AsyncStorage.getItem("user");
        if (data) setUser(JSON.parse(data));
      }
      setLoading(false);
    };

    fetchUser();

    // Lắng nghe sự kiện historyUpdated và userUpdated để cập nhật thông tin ngay lập tức
    const subHistory = DeviceEventEmitter.addListener("historyUpdated", fetchUser);
    const subUser = DeviceEventEmitter.addListener("userUpdated", fetchUser);

    // Auto-refresh thông tin user mỗi 10 giây (để cập nhật sau refund nếu client không ở màn WasherInfo)
    const refreshInterval = setInterval(fetchUser, 10000);

    return () => {
      subHistory.remove();
      subUser.remove();
      clearInterval(refreshInterval);
    };
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
              <View style={styles.freeBadge}>
                <Text style={styles.freeText}>{user.free_washes_left} lượt miễn phí</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
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
});
