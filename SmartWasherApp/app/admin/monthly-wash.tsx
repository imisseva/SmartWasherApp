import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { HistoryController, MonthlyWashStats } from "../../controllers/HistoryController";

export default function MonthlyWashScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<MonthlyWashStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    const data = await HistoryController.getMonthlyWashStats(selectedYear, selectedMonth);
    setList(data);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch {
        Alert.alert("Lỗi", "Không lấy được thống kê lượt giặt.");
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  const renderItem = ({ item }: { item: MonthlyWashStats }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.username}</Text>
        <Text style={styles.rowSub}>{item.name || "-"}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Miễn phí: {item.free_washes}</Text>
          <Text style={styles.statText}>Có phí: {item.paid_washes}</Text>
          <Text style={styles.statText}>Tổng: {item.total_washes}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eaf0ff" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2a44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lượt giặt tháng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
          <Ionicons name="chevron-back" size={20} color="#1f2a44" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedMonth}/{selectedYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
          <Ionicons name="chevron-forward" size={20} color="#1f2a44" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(it) => String(it.user_id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ padding: 16, textAlign: "center", color: "#555" }}>
            Chưa có dữ liệu lượt giặt cho tháng này.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "hsl(218, 50%, 91%)",
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "hsl(213, 85%, 97%)",
    borderBottomColor: "hsl(231, 62%, 94%)",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1f2a44" },
  backBtn: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "hsl(213, 85%, 97%)",
    borderBottomColor: "hsl(231, 62%, 94%)",
    borderBottomWidth: 1,
  },
  monthBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#f2f4ff",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2a44",
    marginHorizontal: 20,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderColor: "hsl(231, 62%, 94%)",
    borderWidth: 1,
  },
  rowTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  rowSub: { marginTop: 4, color: "#4b5563" },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0b8650",
  },
});