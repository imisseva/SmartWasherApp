import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; // ✅
import { Ionicons } from "@expo/vector-icons";
import {
  UserController,
  AdminUserVM,
  CreateUserDto,
  UpdateUserDto,
} from "../../controllers/UserController";
import UserForm from "../../components/UserForm";
import client from "../../constants/api";

export default function UsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ✅ Lấy giá trị safe area
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<AdminUserVM[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<AdminUserVM | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await UserController.list();
    setList(data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch {
        Alert.alert("Lỗi", "Không lấy được danh sách người dùng.");
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

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (u: AdminUserVM) => {
    setEditing(u);
    setModalVisible(true);
  };

  const onDelete = (u: AdminUserVM) => {
    Alert.alert("Xoá người dùng", `Bạn chắc chắn xoá "${u.username}"?`, [
      { text: "Huỷ" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await UserController.remove(u.id);
            setList((prev) => prev.filter((x) => x.id !== u.id));
          } catch {
            Alert.alert("Lỗi", "Xoá thất bại.");
          }
        },
      },
    ]);
  };

  const onSubmit = async (payload: CreateUserDto | UpdateUserDto) => {
    try {
      setSaving(true);
      if ("id" in payload) {
        const updated = await UserController.update(payload);
        setList((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      } else {
        const created = await UserController.create(payload);
        setList((prev) => [created, ...prev]);
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: AdminUserVM }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.username}</Text>
        <Text style={styles.rowSub}>
          {item.name || "-"} · {item.email || "-"} · {item.phone || "-"}
        </Text>
        <Text
          style={[
            styles.role,
            item.role === "admin" ? styles.badgeAdmin : styles.badgeUser,
          ]}
        >
          {item.role}
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
      {/* ✅ Header nằm trong vùng safe area */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 6 }, // chừa tai thỏ
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2a44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Người dùng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Danh sách người dùng */}
      <FlatList
        data={list}
        keyExtractor={(it) => String(it.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ padding: 16, textAlign: "center", color: "#555" }}>
            Chưa có người dùng.
          </Text>
        }
      />

      {/* Nút thêm mới (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreate}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Floating reset button (bottom-left) */}
      <TouchableOpacity
        style={styles.resetFab}
        onPress={() => {
          Alert.alert("Xác nhận", "Reset lượt giặt miễn phí cho tất cả user về 7?", [
            { text: "Huỷ", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: async () => {
              try {
                const res = await client.post('/api/test/reset-washes');
                if (res.data?.success) {
                  Alert.alert('✅ Thành công', res.data.message || 'Đã reset');
                  await load();
                } else {
                  Alert.alert('❌ Lỗi', res.data?.message || 'Reset thất bại');
                }
              } catch (err: any) {
                Alert.alert('❌ Lỗi', err?.message || 'Không thể kết nối');
              }
            }}
          ]);
        }}
        activeOpacity={0.9}
      >
        <Ionicons name="refresh" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Form thêm/sửa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <UserForm
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
  safe: {
    flex: 1,
    backgroundColor: "hsl(218, 50%, 91%)",
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
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
  role: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAdmin: { backgroundColor: "#ffe8e8", color: "#b91c1c" },
  badgeUser: { backgroundColor: "#e8f7ee", color: "#0f766e" },
  rowActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f4ff",
  },

  fab: {
    position: "absolute",
    right: 18,
    bottom: Platform.OS === "ios" ? 40 : 24, // ✅ tránh che tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2a44",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  resetFab: {
    position: "absolute",
    left: 18,
    bottom: Platform.OS === "ios" ? 40 : 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b8650",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
