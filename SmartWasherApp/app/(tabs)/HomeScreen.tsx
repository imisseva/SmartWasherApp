import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy thông tin user từ AsyncStorage khi mở trang
  useEffect(() => {
    const fetchUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        setUser(JSON.parse(data));
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // 🔹 Xử lý nút đăng xuất
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

  // 🔹 Các nút chính
  const handleEnterMachine = () => {
    Alert.alert("🧺 Nhập mã máy giặt", "Bạn sẽ nhập số máy thủ công.");
  };

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
      {/* 🔹 Thanh header hiển thị avatar, tên và nút đăng xuất */}
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

      {/* 🔹 Nội dung chính */}
      <Text style={styles.title}>Chọn cách bắt đầu chu trình giặt</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.optionButton, styles.leftButton]}
          onPress={handleEnterMachine}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 24,
  },

  /* --- Header (Avatar + Tên + Logout) --- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#4B8BF5",
    padding: 8,
    borderRadius: 20,
  },

  /* --- Main UI --- */
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  optionButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  leftButton: {
    backgroundColor: "#3AB0A2",
  },
  rightButton: {
    backgroundColor: "#4B8BF5",
  },
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
  note: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});
