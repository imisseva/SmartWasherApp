import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function UsersScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "hsl(218, 50%, 91%)" }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Người dùng</Text>
      <Text onPress={() => router.back()} style={{ color: "#2563eb" }}>
        ← Quay lại
      </Text>
    </View>
  );
}
