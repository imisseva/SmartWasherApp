import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  DeviceEventEmitter,
} from "react-native";
import { HistoryController } from "../../controllers/HistoryController";
import { WashHistory } from "../../models/WashHistory";

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
  

  const renderItem = ({ item }: { item: WashHistory }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.machine}>{item.machineName}</Text>
        <Text
          style={[
            styles.status,
            { color: item.cost === 0 ? "#2ecc71" : "#4B8BF5" },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.date}>🕒 {item.date}</Text>
      <Text style={styles.details}>💰 {item.cost.toLocaleString()}đ</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4B8BF5" />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Đang tải lịch sử...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Lịch sử giặt</Text>
      {history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.emptyText}>Chưa có lịch sử giặt nào</Text>
      )}
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
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  machine: {
    fontWeight: "700",
    color: "#3AB0A2",
    fontSize: 16,
  },
  status: {
    fontWeight: "600",
    fontSize: 14,
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
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 60,
  },
});
