import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useAuth } from "../../hooks/auth";
// Không cần Platform nữa vì chúng ta không dùng position: 'absolute'

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
          borderTopWidth: 0, 
          borderTopColor: "transparent",
          
          // ✅ Xóa position: 'absolute' và left/right để kéo dài toàn màn hình
          
          // Chiều cao và padding tối ưu để tránh Safe Zone
          height: 80, 
          paddingBottom: 15, 
          paddingTop: 10,
          
          // Giữ bo tròn góc trên mềm mại
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20,
          
          // Shadow nhẹ để tách biệt khỏi nền
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
        }
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
      {/* Tab thống kê mới */}
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