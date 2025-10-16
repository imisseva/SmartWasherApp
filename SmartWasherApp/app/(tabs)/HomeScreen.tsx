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
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    };
    fetchUser();
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

  // ===== Nhập mã máy giặt (dùng Alert.prompt — chỉ chạy trên iOS) =====
  const handleEnterMachine = async () => {
    Alert.prompt(
      "Nhập mã máy giặt",
      "Vui lòng nhập ID máy (ví dụ: 1 hoặc 2)",
      async (machineId) => {
        if (!machineId) return;
        try {
          const res = await client.get(`/api/washer/${machineId}`); // ✅ dùng client
          if (res.data.success) {
            router.push({
              pathname: "/WasherInfo",
              params: { washer: JSON.stringify(res.data.washer) },
            });
          } else {
            Alert.alert("Không tìm thấy máy", res.data.message);
          }
        } catch (err) {
          Alert.alert("Lỗi", "Không thể kết nối tới server.");
        }
      }
    );
  };

  // ===== Modal nhập mã máy =====
  const handleConfirmMachine = async () => {
    if (!machineCode.trim()) {
      Alert.alert("⚠️", "Vui lòng nhập mã máy giặt!");
      return;
    }

    try {
      const res = await client.get(`/api/washer/${machineCode}`); // ✅ dùng client
      if (res.data && res.data.success) {
        setModalVisible(false);
        setMachineCode("");
        router.push({
          pathname: "/WasherInfo",
          params: { washer: JSON.stringify(res.data.washer) },
        });
      } else {
        Alert.alert("❌", "Không tìm thấy máy giặt với mã này!");
      }
    } catch (err) {
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
            <Text style={styles.username}>{user?.username || "Người dùng"}</Text>
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
              placeholder="VD: 1 hoặc 2"
              style={styles.input}
              value={machineCode}
              onChangeText={setMachineCode}
              keyboardType="numeric"
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
});
