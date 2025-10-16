import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../hooks/auth";
import { Href, useRouter } from "expo-router";
import AdminHeader from "../../components/AdminHeader";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ import SafeAreaView

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/(tabs)/HomeScreen");
    }
  }, [user]);

  const goUsers = () => router.push("/admin/users" as Href);
  const goWashers = () => router.push("/admin/washers" as Href);
  const goRevenue = () => router.push("/admin/revenue" as Href);

  const logout = async () => {
    await signOut();
    router.replace("/Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AdminHeader
          title="Quản lý"
          right={
            <TouchableOpacity onPress={logout}>
              <Text style={{ color: "#b00", fontWeight: "700" }}>Đăng xuất</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.welcome}>Xin chào, {user?.username}</Text>

          <View style={styles.grid}>
            <DashButton icon="people-outline" label="Người dùng" onPress={goUsers} />
            <DashButton icon="hardware-chip-outline" label="Máy giặt" onPress={goWashers} />
            <DashButton icon="bar-chart-outline" label="Doanh thu" onPress={goRevenue} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#6b7280"
        style={{ position: "absolute", right: 16, top: 16 }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "hsl(218, 50%, 91%)",
  },
  container: {
    flex: 1,
    backgroundColor: "hsl(218, 50%, 91%)",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 50 : 30, // tránh bị đè tab
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
