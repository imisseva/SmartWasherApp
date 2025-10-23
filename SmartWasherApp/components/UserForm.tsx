import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AdminUserVM, CreateUserDto, UpdateUserDto } from "../controllers/UserController";
// client removed; reset moved to Users screen

export default function UserForm({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial?: AdminUserVM;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateUserDto | UpdateUserDto) => void;
}) {
  const isEdit = !!initial;
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">(initial?.role ?? "user");
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [freeLeft, setFreeLeft] = useState<number>(initial?.free_washes_left ?? 0);

  const submit = () => {
    if (!username.trim()) {
      alert("Vui lòng nhập username.");
      return;
    }
    if (!isEdit && !password.trim()) {
      alert("Tạo mới cần mật khẩu.");
      return;
    }

    if (isEdit) {
      const payload: UpdateUserDto = {
        id: initial!.id,
        username: username.trim(),
        role,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        password: password.trim() || undefined,
      };
      onSubmit(payload);
    } else {
      const payload: CreateUserDto = {
        username: username.trim(),
        password: password.trim(),
        role,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        // New users will start with default free washes handled by server; we don't send freeLeft here
      };
      onSubmit(payload);
    }
  };

  // reset button moved to Users screen

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f5ff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
  <View style={[styles.header, { paddingTop: insets.top || 12 }]}> 
          <TouchableOpacity onPress={onCancel} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#1f2a44" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{isEdit ? "Sửa người dùng" : "Thêm người dùng"}</Text>

          <TouchableOpacity onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator /> : <Text style={styles.saveText}>Lưu</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Field label="Username">
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
          </Field>

          {!isEdit && (
            <Field label="Password">
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            </Field>
          )}

          {isEdit && (
            <Field label="Password (đổi nếu cần)">
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Để trống nếu không đổi" secureTextEntry />
            </Field>
          )}

          <Field label="Họ tên">
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          </Field>

          <Field label="Email">
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </Field>

          <Field label="SĐT">
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </Field>

          {isEdit && (
            <Field label="Lượt miễn phí còn lại">
              <TextInput
                style={styles.input}
                value={String(freeLeft ?? 0)}
                onChangeText={(v) => setFreeLeft(Number(v.replace(/[^0-9]/g, '')))}
                keyboardType="numeric"
              />
            </Field>
          )}

          <Field label="Quyền">
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Chip label="user" active={role === "user"} onPress={() => setRole("user")} />
              <Chip label="admin" active={role === "admin"} onPress={() => setRole("admin")} />
            </View>
          </Field>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? { borderColor: "#1f2a44", backgroundColor: "#e8edff" } : null]}
    >
      <Text style={[styles.chipText, active ? { color: "#1f2a44", fontWeight: "700" } : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "hsl(213, 85%, 97%)", borderBottomWidth: 1, borderBottomColor: "hsl(231, 62%, 94%)",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1f2a44" },
  backBtn: {
    width: 40, height: 36, alignItems: "center", justifyContent: "center",
    borderRadius: 10, backgroundColor: "rgba(0,0,0,0.04)"
  },
  saveText: { color: "#1f2a44", fontWeight: "800" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderColor: "hsl(231, 62%, 94%)",
    borderWidth: 1,
  },
  label: { fontSize: 13, color: "#4b5563", marginBottom: 8 },
  input: { backgroundColor: "#f8f9ff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },

  // Place reset button inline with header so it respects safe area
  resetBtn: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,134,80,0.06)'
  },

  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#fff" },
  chipText: { color: "#6b7280" },
});
