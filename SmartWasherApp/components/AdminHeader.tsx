import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function AdminHeader({ title = "Quản lý", onBack, right }: Props) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: "hsl(213, 85%, 97%)",
      borderBottomWidth: 1,
      borderBottomColor: "hsl(231, 62%, 94%)"
    }}>
      <View style={{ minWidth: 40 }}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={{ fontSize: 18, fontWeight: "800", color: "#233" }}>{title}</Text>

      <View style={{ minWidth: 40, alignItems: "flex-end" }}>
        {right}
      </View>
    </View>
  );
}
