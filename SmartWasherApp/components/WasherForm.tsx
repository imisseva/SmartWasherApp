import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Washer } from "../models/Washer";
import WasherInfoCard from "./WasherInfoCard";
import { WasherController, CreateWasherDto, UpdateWasherDto, WasherStatus, WasherInfo } from "../controllers/WasherController";

type Props = {
  initial?: Washer;           // có => đang SỬA, không => đang THÊM
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateWasherDto | UpdateWasherDto) => void;
};

const StatusChip = ({
  value, selected, onPress, label,
}: { value: WasherStatus; selected: boolean; onPress: () => void; label: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      selected && styles.chipSelected,
      value === "available" && { borderColor: "#0f766e" },
      value === "running" && { borderColor: "#3730a3" },
      value === "error" && { borderColor: "#b91c1c" },
    ]}
  >
    <Text style={[
      styles.chipText,
      selected && styles.chipTextSelected,
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function WasherForm({ initial, saving, onCancel, onSubmit }: Props) {
  // ✨ nếu có initial => chế độ sửa (chỉ sửa 4 field)
  const isEdit = !!initial;

  // Các field cho cả 2 mode
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? 15000));
  const [status, setStatus] = useState<WasherStatus>(initial?.status ?? "available");

  // Chỉ hiển thị/cho nhập khi THÊM mới
  const [id, setId] = useState<string>("");
  const [weight, setWeight] = useState<string>("7");
  const [ip, setIp] = useState<string>("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setLocation(initial.location ?? "");
      setPrice(String(initial.price ?? 0));
      setStatus(initial.status);
    }
  }, [initial, isEdit]);

  // Nếu là sửa, lấy thông tin đầy đủ từ server để hiển thị (bao gồm weight)
  const [info, setInfo] = useState<WasherInfo | null>(null);
  useEffect(() => {
    let mounted = true;
    const loadInfo = async () => {
      if (!isEdit) return;
      try {
        const id = initial!.id;
        const res = await WasherController.getWasherInfo(id);
        if (mounted && res) {
          setInfo(res);
          // Prefill weight from fetched info
          setWeight(String(res.weight ?? 0));
          setName(res.name ?? initial!.name ?? "");
          setLocation(res.location ?? initial!.location ?? "");
          setPrice(String(res.price ?? initial!.price ?? 0));
          setStatus((res.status ?? initial!.status) as WasherStatus);
        }
      } catch (err: any) {
        console.error("Lỗi khi lấy info máy giặt:", err);
        // show soft alert but don't block
      }
    };
    loadInfo();
    return () => { mounted = false; };
  }, [initial]);

  const submit = () => {
    if (!name.trim()) return Alert.alert("Thiếu tên máy giặt");
    const base = {
      name: name.trim(),
      location: location.trim() || null,
      price: Number(price || 0),
      status,
    };

    if (isEdit) {
      const payload: UpdateWasherDto = { id: initial!.id, ...base };
      onSubmit(payload);
      return;
    }

    // Tạo mới: nhận thêm id (tùy chọn), weight, ip_address
    const payload: CreateWasherDto = {
      ...(id.trim() ? { id: Number(id) } : {}),
      ...base,
      weight: Number(weight || 0),
      ip_address: ip.trim() || null,
    };
    onSubmit(payload);
  };

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 12) }]}> 
      <Text style={styles.title}>{isEdit ? "Sửa máy giặt" : "Thêm máy giặt"}</Text>

      {!isEdit && (
        <>
          <Text style={styles.label}>ID (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            value={id}
            onChangeText={setId}
            keyboardType="number-pad"
            placeholder="Để trống nếu để AUTO_INCREMENT"
          />

          <Text style={styles.label}>Trọng lượng (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="7"
          />
        </>
      )}

      {info && (
        <WasherInfoCard
          name={info.name}
          location={info.location}
          price={info.price}
          status={info.status}
          weight={info.weight}
        />
      )}

      <Text style={styles.label}>Tên máy giặt</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Máy giặt 1" />

      <Text style={styles.label}>Vị trí</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ký túc xá A" />

      <Text style={styles.label}>Giá (đ)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="15000"
      />

      {/* Trạng thái = chip chọn (không còn picker bị kẹt) */}
      <Text style={styles.label}>Trạng thái</Text>
      <View style={styles.chipsRow}>
        <StatusChip value="available" label="Sẵn sàng" selected={status === "available"} onPress={() => setStatus("available")} />
        <StatusChip value="running"   label="Đang chạy" selected={status === "running"}   onPress={() => setStatus("running")} />
        <StatusChip value="error"     label="Lỗi"       selected={status === "error"}     onPress={() => setStatus("error")} />
      </View>

      {!isEdit && (
        <>
          <Text style={styles.label}>IP Address</Text>
          <TextInput
            style={styles.input}
            value={ip}
            onChangeText={setIp}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            placeholder="192.168.1.31"
          />
        </>
      )}

      <View style={{ height: 14 }} />

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel} disabled={!!saving}>
          <Text style={[styles.btnText, { color: "#1f2a44" }]}>Huỷ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={submit} disabled={!!saving}>
          <Text style={styles.btnText}>{saving ? "Đang lưu..." : "Lưu"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "hsl(218, 50%, 91%)", padding: 16 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 12, color: "#1f2a44" },
  label: { fontWeight: "700", marginTop: 10, marginBottom: 6, color: "#374151" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "hsl(231, 62%, 94%)"
  },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 2, backgroundColor: "#f3f4f6",
  },
  chipSelected: { backgroundColor: "#111827" },
  chipText: { fontWeight: "700", color: "#111827" },
  chipTextSelected: { color: "#fff" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  btn: { flex: 1, backgroundColor: "#1f2a44", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnGhost: { backgroundColor: "#e5e7eb" },
  btnText: { color: "#fff", fontWeight: "800" },
});
