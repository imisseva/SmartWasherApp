import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  DeviceEventEmitter,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Import SafeAreaView
import { Ionicons } from "@expo/vector-icons"; // ✅ Thêm Ionicons
import { HistoryController } from "../../controllers/HistoryController";
import { WashHistory } from "../../models/WashHistory"; // Giả định import này tồn tại

export default function HistoryScreen() {
  const [history, setHistory] = useState<WashHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await HistoryController.getUserHistory();
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
    // subscribe to history updates
    const sub = DeviceEventEmitter.addListener("historyUpdated", () => {
      setLoading(true);
      loadHistory();
    });

    return () => sub.remove();
  }, []);
  

  const renderItem = ({ item }: { item: WashHistory }) => {
    const isRefunded = item.status === 'refunded';
    const isError = item.status.includes("Lỗi");
    const isFree = item.cost === 0 && !isRefunded && !isError;
      
    // Định nghĩa màu sắc và icon theo trạng thái (đồng bộ với bản cập nhật trước)
    let statusStyle = styles.paidStatus;
    let iconName: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
    let statusText = item.status;
      
    if (isRefunded) {
        statusStyle = styles.refundedStatus;
        iconName = "return-down-back-outline";
        statusText = "Đã hoàn tiền";
    } else if (isError) {
        statusStyle = styles.errorStatus;
        iconName = "alert-circle-outline";
        statusText = "Lỗi/Thất bại";
    } else if (isFree) {
        statusStyle = styles.freeStatus;
        iconName = "gift-outline";
        statusText = "Miễn phí";
    } else {
        statusStyle = styles.paidStatus;
        iconName = "checkmark-circle-outline";
        statusText = "Hoàn thành";
    }

    return (
      <View style={[styles.card, { borderLeftColor: statusStyle.color }]}>
        <View style={styles.rowBetween}>
          <View style={styles.machineInfo}>
            <Text style={styles.machine}>{item.machineName}</Text>
          </View>
          <View style={styles.statusBox}>
              <Ionicons name={iconName} size={18} color={statusStyle.color} />
              <Text style={[styles.statusText, statusStyle]}>
                  {statusText}
              </Text>
          </View>
        </View>
        
        {/* Hàng thứ hai: Thời gian */}
        <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#777" />
            <Text style={styles.date}>{item.date}</Text>
        </View>
        
        {/* Hàng thứ ba: Chi phí */}
        <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={16} color="#777" />
            <Text style={styles.details}>
                {item.cost === 0 ? "Miễn phí" : `${item.cost.toLocaleString()}đ`}
            </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center", alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4B8BF5" />
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            Đang tải lịch sử...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // ✅ Sử dụng SafeAreaView để tránh Safe Zone
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.container}>
        <Text style={styles.title}>📜 Lịch sử giặt</Text>
        {history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 4 }}
          />
        ) : (
          <Text style={styles.emptyText}>Chưa có lịch sử giặt nào</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ Đảm bảo Safe Area: Nền chung cho toàn bộ màn hình
  safeArea: { flex: 1, backgroundColor: "#f0f4f8" }, 
  container: { flex: 1, paddingHorizontal: 16 },
  title: {
    fontSize: 24, 
    fontWeight: "800", 
    marginVertical: 20, 
    textAlign: "center",
    color: "#2c3e50", 
  },
  card: {
    backgroundColor: "#fff",
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08, 
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 6, // Đường viền màu trạng thái nổi bật
    borderLeftColor: '#ccc',
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center', 
    marginBottom: 10, 
  },
  machineInfo: {
      flex: 1,
      marginRight: 10, 
  },
  machine: {
    fontWeight: "900", 
    color: "#333",
    fontSize: 17, 
  },
  statusBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6, 
      paddingHorizontal: 10, 
      paddingVertical: 5,
      borderRadius: 10, 
      backgroundColor: '#f8f9fa', 
  },
  statusText: {
    fontWeight: "700",
    fontSize: 15, 
  },
  // --- STYLES TRẠNG THÁI MỚI ---
  errorStatus: {
    color: "#dc3545", // Đỏ cảnh báo
  },
  freeStatus: {
    color: "#ffc107", // Cam cho miễn phí
  },
  paidStatus: {
    color: "#28a745", // Xanh lá cho hoàn thành
  },
  refundedStatus: {
    color: "#6c757d", // Xám cho hoàn tiền
  },
  // --------------------------
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, 
    marginBottom: 6,
  },
  date: {
    fontSize: 15, 
    color: "#555",
  },
  details: {
    fontSize: 15,
    color: "#333", 
    fontWeight: '600',
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 60,
  },
});