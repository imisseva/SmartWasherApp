import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useAuth } from "../../hooks/auth";

export default function TabsLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Nếu đã load và không có user thì trả về màn Login
    if (!loading && !user) {
      router.replace("/Login");
    }
  }, [loading, user, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4B8BF5",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#eee",
          paddingBottom: 4,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="HistoryScreen"
        options={{
          title: "Lịch sử giặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      {/* ✅ Tab thống kê mới */}
      <Tabs.Screen
        name="StatisticalScreen"
        options={{
          title: "Thống kê",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
