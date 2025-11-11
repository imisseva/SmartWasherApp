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
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Import SafeAreaView
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import client from "../../constants/api"; 

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [machineCode, setMachineCode] = useState("");
  const [isRefunding, setIsRefounding] = useState(false);

  // ... (Giữ nguyên logic fetchUser, handleLogout, handleConfirmMachine, handleScanQR)

  useEffect(() => {
    // Logic fetchUser, DeviceEventEmitter...
    // Tạm bỏ qua phần logic để tập trung vào UI
    const fetchUser = async () => {
      // ... (Giữ nguyên logic fetchUser từ file gốc)
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const userData = JSON.parse(data);
          try {
            const response = await client.get(`/api/auth/me`);
            if (response.data?.success) {
              const updatedUser = response.data.user;
              if (user && updatedUser.free_washes_left > user.free_washes_left) {
                setIsRefounding(true);
                setTimeout(() => setIsRefounding(false), 2000);
              }
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } catch {
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
    
    const subUser = DeviceEventEmitter.addListener("userUpdated", async (payload) => {
        if (payload && payload.user) {
          setUser(payload.user);
          if (payload.isRefund) {
            setIsRefounding(true);
            setTimeout(() => setIsRefounding(false), 2000);
          }
        } else {
          await fetchUser();
        }
    });
    
    const refreshInterval = setInterval(fetchUser, 10000);
    return () => { subUser.remove(); clearInterval(refreshInterval); };
  }, [user]);

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
  
  const handleScanQR = () => {
    Alert.alert("📷 Quét mã QR", "Tính năng quét QR đang được phát triển!");
  };
  
  // ... (Kết thúc giữ nguyên logic)

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B8BF5" />
          <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const displayName =
    (user?.name && user.name.trim()) ||
    user?.account?.username ||
    user?.username ||
    "Người dùng";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ===== Header (Giữ nguyên phong cách tối giản) ===== */}
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
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* ===== Free Washes Badge (Tách ra thành block lớn hơn) ===== */}
        {typeof user?.free_washes_left === "number" && (
            <View style={[
                styles.freeBadgeBlock,
                isRefunding && styles.refundingBadge
            ]}>
                <Ionicons name="gift-outline" size={24} color={isRefunding ? "#f39c12" : "#047857"} />
                <Text style={[styles.freeText, isRefunding && styles.refundingText]}>
                    Bạn còn <Text style={{fontWeight: '900', fontSize: 22}}>{user.free_washes_left}</Text> lượt giặt miễn phí
                </Text>
            </View>
        )}

        {/* ===== Nội dung chính ===== */}
        <Text style={styles.title}>Bắt đầu chu trình giặt</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.optionButton, styles.leftButton]}
            onPress={() => setModalVisible(true)}
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

        <Text style={styles.note}>Chọn một trong hai cách trên để xem thông tin máy và bắt đầu giặt.</Text>

        {/* ===== Modal nhập mã máy (Không đổi) ===== */}
        <Modal transparent visible={modalVisible} animationType="fade">
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
                  style={[styles.modalBtn, { backgroundColor: "#eee" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{color: '#444', fontWeight: '600'}}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#4B8BF5" }]}
                  onPress={handleConfirmMachine}
                >
                  <Text style={{ color: "#fff", fontWeight: '700' }}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fb" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#eee", borderWidth: 2, borderColor: '#fff' },
  greeting: { fontSize: 14, color: "#666" },
  username: { fontSize: 18, fontWeight: "700", color: "#333" },
  logoutButton: { backgroundColor: "#4B8BF5", padding: 10, borderRadius: 24, elevation: 3, shadowOpacity: 0.2 },

  // Free Washes Badge (Block mới)
  freeBadgeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: "#e6fffa",
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 5,
    borderLeftColor: '#3AB0A2',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  freeText: { fontSize: 16, color: "#047857", fontWeight: "600" },
  refundingBadge: {
    backgroundColor: "#fff3e6",
    borderLeftColor: "#f39c12",
  },
  refundingText: {
    color: "#f39c12",
  },

  // Main Content
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },
  buttonRow: { flexDirection: "row", gap: 20, justifyContent: "center" },
  optionButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    minHeight: 160,
  },
  leftButton: { backgroundColor: "#3AB0A2" },
  rightButton: { backgroundColor: "#4B8BF5" },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    textAlign: 'center',
  },
  note: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 40 },

  // Modal (Giữ nguyên)
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20, color: '#333' },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
});