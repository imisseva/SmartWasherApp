import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

interface WashHistory {
  id: number;
  machineName: string;
  date: string;
  duration: number;
  cost: number;
  status: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<WashHistory[]>([]);

  useEffect(() => {
    // 🚀 Lấy dữ liệu thật từ server (chưa có thì mô phỏng)
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.1.81:5000/api/history");
        setHistory(res.data);
      } catch (err) {
        console.warn("Không thể kết nối server, hiển thị dữ liệu giả lập");
        setHistory([
          {
            id: 1,
            machineName: "Máy giặt 1",
            date: "2025-10-12 20:30",
            duration: 45,
            cost: 15000,
            status: "Hoàn thành",
          },
          {
            id: 2,
            machineName: "Máy giặt 2",
            date: "2025-10-10 18:15",
            duration: 50,
            cost: 15000,
            status: "Hoàn thành",
          },
        ]);
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: WashHistory }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.machine}>{item.machineName}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.date}>🕒 {item.date}</Text>
      <Text style={styles.details}>
        ⏱ {item.duration} phút • 💰 {item.cost.toLocaleString()}đ
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử giặt</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#ccc",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  machine: {
    fontWeight: "700",
    color: "#3AB0A2",
  },
  status: {
    fontWeight: "600",
    color: "#4B8BF5",
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#666",
  },
});
