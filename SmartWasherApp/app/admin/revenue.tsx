import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AdminHeader from "../../components/AdminHeader";

export default function RevenueScreen() {
  const router = useRouter();
  return (
    <View style={{ flex:1, backgroundColor: "hsl(218, 50%, 91%)" }}>
      <AdminHeader title="Doanh thu" onBack={() => router.back()} />
      <View style={{ padding:16 }}>
        <Text>Báo cáo doanh thu / lọc theo ngày / tuần… (WIP)</Text>
      </View>
    </View>
  );
}
