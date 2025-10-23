import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type WasherInfoCardProps = {
  name: string;
  location: string;
  price: number;
  status: 'available' | 'running' | 'error';
  weight: number;
};

const WasherInfoCard = ({
  name,
  location,
  price,
  status,
  weight,
}: WasherInfoCardProps) => {
  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Sẵn sàng';
      case 'running':
        return 'Đang chạy';
      case 'error':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return styles.statusAvailable;
      case 'running':
        return styles.statusRunning;
      case 'error':
        return styles.statusError;
      default:
        return {};
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{name}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Vị trí:</Text>
        <Text style={styles.value}>{location || '-'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Giá:</Text>
        <Text style={styles.value}>{price.toLocaleString()}đ</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Trọng lượng:</Text>
        <Text style={styles.value}>{weight}kg</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Trạng thái:</Text>
        <Text style={[styles.statusBadge, getStatusStyle()]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusRunning: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
});

export default WasherInfoCard;