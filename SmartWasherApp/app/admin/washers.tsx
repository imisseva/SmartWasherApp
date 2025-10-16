import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AdminHeader from "../../components/AdminHeader";

export default function WashersScreen() {
  const router = useRouter();
  return (
    <View style={{ flex:1, backgroundColor: "hsl(218, 50%, 91%)" }}>
      <AdminHeader title="Máy giặt" onBack={() => router.back()} />
      <View style={{ padding:16 }}>
        <Text>Quản lý máy giặt: thêm/sửa/xóa, đổi trạng thái… (WIP)</Text>
      </View>
    </View>
  );
}
