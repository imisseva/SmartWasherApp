import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Washer } from "../../models/Washer";
import { WasherController } from "../../controllers/WasherController";
import WasherForm from "../../components/WasherForm";

export default function WashersScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<Washer[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Washer | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await WasherController.list();
    setList(data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e: any) {
        Alert.alert("Lỗi", e?.message || "Không lấy được danh sách máy giặt.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openCreate = () => { setEditing(null); setModalVisible(true); };
  const openEdit = (w: Washer) => { setEditing(w); setModalVisible(true); };

  const onDelete = (w: Washer) => {
    Alert.alert("Xoá máy giặt", `Bạn chắc chắn xoá "${w.name}"?`, [
      { text: "Huỷ" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await WasherController.remove(w.id);
            setList(prev => prev.filter(x => x.id !== w.id));
          } catch {
            Alert.alert("Lỗi", "Xoá thất bại");
          }
        }
      }
    ]);
  };

  const onSubmit = async (payload: any) => {
    try {
      setSaving(true);
  
      if (editing) {
        // ✅ SỬA
        const updated = await WasherController.update({
          id: editing.id,
          name: payload.name,
          location: payload.location,
          price: payload.price,
          status: payload.status,
        });
        setList(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      } else {
        // ✅ THÊM (kể cả có/không có id)
        const created = await WasherController.create(payload);
        setList(prev => [created, ...prev]);
      }
  
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || (editing ? "Failed to update washer" : "Failed to create washer"));
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Washer }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSub}>{item.location || "-"}</Text>
        <Text style={styles.rowSub}>Giá: {item.price.toLocaleString()} đ</Text>
        <Text style={styles.rowSub}>ID: {item.id} · Cân nặng: {item.weight}kg</Text>
        <Text style={styles.rowSub}>IP: {item.ip_address || "-"}</Text>
        <Text style={styles.rowSub}>Lần dùng gần nhất: {item.last_used || "-"}</Text>
        <Text style={[styles.badge, styles[`badge_${item.status}` as const]]}>
          {item.status === "available" ? "Sẵn sàng"
           : item.status === "running" ? "Đang chạy"
           : "Lỗi"}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={20} color="#b91c1c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#eaf0ff" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "hsl(218, 50%, 91%)" }}>
      {/* Header thấp (nút back không dính tai thỏ) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1f2a44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Máy giặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ padding: 16 }}>Chưa có máy giặt.</Text>}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.9}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <WasherForm
          initial={editing ?? undefined}
          saving={saving}
          onCancel={() => setModalVisible(false)}
          onSubmit={onSubmit}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12, paddingBottom: 10, paddingTop: 6,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "hsl(213, 85%, 97%)", borderBottomColor: "hsl(231,62%,94%)", borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1f2a44" },
  backBtn: {
    width: 40, height: 36, alignItems: "center", justifyContent: "center",
    borderRadius: 10, backgroundColor: "rgba(0,0,0,0.04)"
  },

  row: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12,
    borderColor: "hsl(231,62%,94%)", borderWidth: 1,
  },
  rowTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  rowSub: { marginTop: 4, color: "#4b5563" },
  rowActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
    backgroundColor: "#f2f4ff"
  },

  badge: { marginTop: 8, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontWeight: "700" },
  badge_available: { backgroundColor: "#e8f7ee", color: "#0f766e" },
  badge_running: { backgroundColor: "#e0e7ff", color: "#3730a3" },
  badge_error: { backgroundColor: "#ffe8e8", color: "#b91c1c" },

  fab: {
    position: "absolute", right: 18, bottom: 24,
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    backgroundColor: "#1f2a44", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
});
