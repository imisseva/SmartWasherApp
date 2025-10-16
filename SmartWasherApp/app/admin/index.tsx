import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../hooks/auth";
import { useRouter } from "expo-router";
import AdminHeader from "../../components/AdminHeader";
import { Ionicons } from "@expo/vector-icons";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      // Không phải admin -> quay về Home thường
      router.replace("/(tabs)/HomeScreen");
    }
  }, [user]);

  const goUsers   = () => router.push("../users");
  const goWashers = () => router.push("../washers");
  const goRevenue = () => router.push("../revenue");

  const logout = async () => {
    await signOut();
    router.replace("/Login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "hsl(218, 50%, 91%)" }}>
      <AdminHeader
        title="Quản lý"
        right={
          <TouchableOpacity onPress={logout}>
            <Text style={{ color: "#b00", fontWeight: "700" }}>Đăng xuất</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <Text style={styles.welcome}>Xin chào, {user?.username}</Text>

        <View style={styles.grid}>
          <DashButton
            icon="people-outline"
            label="Người dùng"
            onPress={goUsers}
          />
          <DashButton
            icon="hardware-chip-outline"
            label="Máy giặt"
            onPress={goWashers}
          />
          <DashButton
            icon="bar-chart-outline"
            label="Doanh thu"
            onPress={goRevenue}
          />
        </View>
      </View>
    </View>
  );
}

function DashButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Ionicons name={icon} size={28} color="#243b6b" />
      <Text style={styles.cardText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" style={{ position: "absolute", right: 16, top: 16 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  welcome: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 14,
    fontWeight: "600",
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: "hsl(213, 85%, 97%)",
    borderRadius: 18,
    padding: 18,
    shadowColor: "hsl(231, 62%, 94%)",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "hsl(231, 62%, 94%)",
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2a44",
  },
});
