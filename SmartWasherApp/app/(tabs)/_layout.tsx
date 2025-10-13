import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="HomeScreen" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="HistoryScreen" options={{ title: "Lịch sử giặt" }} />
    </Tabs>
  );
}
