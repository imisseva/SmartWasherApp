import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, StyleSheet, ActivityIndicator, DeviceEventEmitter, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/auth';
import client from '../../constants/api';
// ThemedView not used here because SafeAreaView enforces background/safe area
import { ThemedText } from '../../components/themed-text';
import { PieChart } from 'react-native-chart-kit';

const WASH_THRESHOLD = 7; // Ngưỡng cảnh báo số lần giặt trong tuần

// Dữ liệu mẫu để hiển thị ngay
const sampleData = {
  total: 8,
  success: 7,
  failed: 1,
  weekInfo: {
    start: '23/10/2025',
    end: '29/10/2025'
  }
};

const StatisticalScreen = () => {
  const { user } = useAuth();
    console.log('Current user:', user);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [totalWashes, setTotalWashes] = useState(sampleData.total);
  const [weekInfo, setWeekInfo] = useState<{ start?: string; end?: string }>(sampleData.weekInfo || {});
  const [successCount, setSuccessCount] = useState<number>(sampleData.success || 0);
  const [failedCount, setFailedCount] = useState<number>(sampleData.failed || 0);

  const fetchWeeklyData = useCallback(async () => {
    if (!user?.id) return;
    setDataLoading(true);
    setError(null);
    
    try {
      // The server exposes GET /api/wash-history/:userId which returns user's history rows
      const res = await client.get(`/api/wash-history/${user.id}`);
      const { success, data, message } = res.data;

      if (success && Array.isArray(data)) {
        // Compute counts for current week (Mon-Sun)
        const now = new Date();
        const day = now.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = (day + 6) % 7; // days since Monday
        const monday = new Date(now);
        monday.setHours(0,0,0,0);
        monday.setDate(now.getDate() - diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);

        let total = 0;
        let success = 0;
        let failed = 0;

        for (const row of data) {
          // row.date is like 'YYYY-MM-DD HH:mm'
          const raw = row.date || row.requested_at || row.requested_at;
          const dateStr = typeof raw === 'string' ? raw.replace(' ', 'T') : null;
          const d = dateStr ? new Date(dateStr) : null;
          if (!d) continue;
          if (d >= monday && d <= sunday) {
            total += 1;
            const status = (row.status || '').toString();
            // The server returns localized displayStatus like 'Miễn phí','Hoàn thành','Lỗi','Hoàn tiền'
            if (status === 'Miễn phí' || status === 'Hoàn thành') success += 1; else failed += 1;
          }
        }

        setTotalWashes(total);
        setSuccessCount(success);
        setFailedCount(failed);

        // Derive weekInfo strings
        const format = (dt: Date) => `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
        setWeekInfo({ start: format(monday), end: format(sunday) });

        // Hiển thị cảnh báo nếu vượt ngưỡng
        if (total > WASH_THRESHOLD) {
          Alert.alert(
            '🚨 Cảnh báo sử dụng',
            'Tuần này bạn đã giặt hơn 7 lần. Hãy cân nhắc giảm lượt sử dụng vào tuần sau nhé!',
            [{ text: 'Đã hiểu', style: 'default' }],
            { cancelable: true }
          );
        }
      } else {
        setError(message || 'Không thể tải dữ liệu');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setDataLoading(false);
    }
  }, [user?.id]);

  // Tải dữ liệu khi có user
  useEffect(() => {
      console.log('useEffect user?.id:', user?.id);
    if (user?.id) {
      fetchWeeklyData();
      // Tự động cập nhật mỗi 5 phút
      const interval = setInterval(fetchWeeklyData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchWeeklyData]);

  // Lắng nghe event từ socket (qua DeviceEventEmitter) để cập nhật ngay khi có sự kiện lịch sử/user mới
  useEffect(() => {
    const onUserUpdated = (payload: any) => {
      console.log('DeviceEventEmitter userUpdated payload:', payload);
      // Khi user được cập nhật (ví dụ sau khi tạo wash), fetch lại số liệu
      fetchWeeklyData();
    };

    const onHistoryUpdated = (payload: any) => {
      console.log('DeviceEventEmitter historyUpdated payload:', payload);
      fetchWeeklyData();
    };

    const sub1 = DeviceEventEmitter.addListener('userUpdated', onUserUpdated);
    const sub2 = DeviceEventEmitter.addListener('historyUpdated', onHistoryUpdated);

    return () => {
      try { sub1.remove(); } catch {}
      try { sub2.remove(); } catch {}
    };
  }, [fetchWeeklyData]);

  // Loading state đã được bỏ để hiện dữ liệu mẫu ngay

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top","bottom"]}>
        <View style={styles.containerInner}>
          <ThemedText style={styles.message}>
            Vui lòng đăng nhập để xem thống kê
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top","bottom"]}>
      <View style={styles.containerInner}>
      <ThemedText style={styles.title}>
        Thống kê lượt giặt trong tuần
        {(weekInfo?.start && weekInfo?.end) && (
          <ThemedText style={styles.subtitle}>
            {'\n'}({weekInfo?.start} - {weekInfo?.end})
          </ThemedText>
        )}
      </ThemedText>

      <View style={[styles.statsContainer, dataLoading && styles.loading]}>
        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : (
          <>
            {dataLoading && <ActivityIndicator style={styles.loader} color="#0066cc" />}
            <ThemedText style={styles.summary}>
              Số lượt giặt của bạn trong tuần này:{' '}
              <ThemedText style={[
                styles.highlightText,
                totalWashes > WASH_THRESHOLD && styles.warningText
              ]}>
                {totalWashes} lượt
              </ThemedText>
            </ThemedText>
            
            {totalWashes > WASH_THRESHOLD && (
              <ThemedText style={styles.warning}>
                🚨 Tuần này bạn đã giặt hơn {WASH_THRESHOLD} lần.{'\n'}
                Hãy cân nhắc giảm lượt sử dụng vào tuần sau nhé!
              </ThemedText>
            )}
          </>
        )}
      </View>

      <ThemedText style={styles.note}>* Số liệu được cập nhật mỗi 5 phút</ThemedText>

      {/* Pie chart */}
      <View style={styles.pieContainer}>
        <PieChart
          data={[
            { name: 'Giặt OK', population: successCount || 0, color: '#4CAF50', legendFontColor: '#444', legendFontSize: 14 },
            { name: 'Giặt lỗi', population: failedCount || 0, color: '#F44336', legendFontColor: '#444', legendFontSize: 14 },
          ]}
          width={Dimensions.get('window').width - 32}
          height={180}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(68,68,68, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerInner: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    marginBottom: 24,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    fontWeight: 'normal',
  },
  loading: {
    opacity: 0.7,
  },
  loader: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningText: {
    color: '#ff6b6b',
  },
  summary: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    color: '#000',
  },
  highlightText: {
    color: '#000',
    fontWeight: '600',
  },
  warning: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  note: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  pieContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#ffffff',
  }
});

export default StatisticalScreen;