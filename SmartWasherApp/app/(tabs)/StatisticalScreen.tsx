import React, { useEffect, useState, useCallback, useRef } from 'react'; // ✅ Import useRef
import { View, Alert, StyleSheet, ActivityIndicator, DeviceEventEmitter, Dimensions, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/auth';
import client from '../../constants/api';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const WASH_THRESHOLD = 4;

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
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [totalWashes, setTotalWashes] = useState(sampleData.total);
  const [weekInfo, setWeekInfo] = useState<{ start?: string; end?: string }>(sampleData.weekInfo || {});
  const [successCount, setSuccessCount] = useState<number>(sampleData.success || 0);
  const [failedCount, setFailedCount] = useState<number>(sampleData.failed || 0);
  
  // ✅ DÙNG REF: Lưu trữ trạng thái cảnh báo để tránh loop render
  const hasAlertedRef = useRef(false);

  // ✅ CHỈNH SỬA LOGIC CẢNH BÁO: Loại bỏ hasAlerted khỏi dependencies
  const fetchWeeklyData = useCallback(async () => {
    if (!user?.id) return;
    setDataLoading(true);
    setError(null);
    
    try {
      const res = await client.get(`/api/wash-history/${user.id}`);
      const { success, data, message } = res.data;

      if (success && Array.isArray(data)) {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
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
          const raw = row.date || row.requested_at;
          const dateStr = typeof raw === 'string' ? raw.replace(' ', 'T') : null;
          const d = dateStr ? new Date(dateStr) : null;
          if (!d) continue;
          if (d >= monday && d <= sunday) {
            total += 1;
            const status = (row.status || '').toString();
            if (status === 'Miễn phí' || status === 'Hoàn thành') success += 1; else failed += 1;
          }
        }

        setTotalWashes(total);
        setSuccessCount(success);
        setFailedCount(failed);

        const format = (dt: Date) => `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
        setWeekInfo({ start: format(monday), end: format(sunday) });

        // ✅ LOGIC CẢNH BÁO VỚI REF
        if (total > WASH_THRESHOLD && hasAlertedRef.current === false) {
          Alert.alert(
            '🚨 Cảnh báo sử dụng',
            'Tuần này bạn đã giặt hơn 4 lần. Hãy cân nhắc giảm lượt sử dụng vào tuần sau nhé!',
            [{ text: 'Đã hiểu', style: 'default' }],
            { cancelable: true }
          );
          // Set giá trị ref = true
          hasAlertedRef.current = true; 
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
  }, [user?.id]); // hasAlertedRef không cần trong dependency array

  // ✅ CHỈNH SỬA useEffect: Reset ref khi user thay đổi
  useEffect(() => {
    // RESET REF: Khi user ID thay đổi (đăng nhập mới), reset ref
    hasAlertedRef.current = false;
    
    if (user?.id) {
      fetchWeeklyData();
      const interval = setInterval(() => fetchWeeklyData(), 5 * 60 * 1000); 
      return () => clearInterval(interval);
    }
    // Chỉ cần fetchWeeklyData và user?.id trong dependency array
  }, [user?.id, fetchWeeklyData]); 

  // Giữ nguyên logic DeviceEventEmitter
  useEffect(() => {
    const onUserUpdated = () => fetchWeeklyData();
    const onHistoryUpdated = () => fetchWeeklyData();

    const sub1 = DeviceEventEmitter.addListener('userUpdated', onUserUpdated);
    const sub2 = DeviceEventEmitter.addListener('historyUpdated', onHistoryUpdated);

    return () => {
      try { sub1.remove(); } catch {}
      try { sub2.remove(); } catch {}
    };
  }, [fetchWeeklyData]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.containerInner}>
          <Text style={styles.message}>
            Vui lòng đăng nhập để xem thống kê
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(68,68,68, ${opacity})`,
  };

  const pieData = [
    { name: 'Giặt OK', population: successCount || 0, color: '#4CAF50', legendFontColor: '#444', legendFontSize: 14 },
    { name: 'Giặt lỗi', population: failedCount || 0, color: '#F44336', legendFontColor: '#444', legendFontSize: 14 },
  ];
  
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.containerInner}>
          
          <Text style={styles.title}>
            <Ionicons name="bar-chart-outline" size={26} color="#2c3e50" /> Thống kê lượt giặt
          </Text>
          {(weekInfo?.start && weekInfo?.end) && (
            <Text style={styles.subtitlePeriod}>
              ({weekInfo?.start} - {weekInfo?.end})
            </Text>
          )}

          <View style={[styles.statsContainer, dataLoading && styles.loading]}>
            {dataLoading && <ActivityIndicator style={styles.loader} size="small" color="#0066cc" />}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                <Text style={styles.summaryLabel}>
                  Tổng số lượt giặt trong tuần này:
                </Text>
                
                <View style={[
                    styles.totalHighlightContainer,
                    totalWashes > WASH_THRESHOLD && {borderColor: styles.warningText.color}
                ]}>
                    <Text style={[
                      styles.totalCount,
                      totalWashes > WASH_THRESHOLD && styles.warningText
                    ]}>
                        {totalWashes}
                    </Text>
                    <Text style={[
                        styles.totalUnit,
                        totalWashes > WASH_THRESHOLD && styles.warningText
                    ]}>
                        lượt
                    </Text>
                </View>
                
                {totalWashes > WASH_THRESHOLD && (
                  <Text style={styles.warning}>
                    🚨 Cảnh báo: Bạn đã vượt ngưỡng {WASH_THRESHOLD} lần.
                    Hãy cân nhắc sử dụng hiệu quả hơn!
                  </Text>
                )}
                
                <View style={styles.detailRow}>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailCountSuccess}>{successCount}</Text>
                        <Text style={styles.detailLabel}>Lượt OK</Text>
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailCountFailed}>{failedCount}</Text>
                        <Text style={styles.detailLabel}>Lượt lỗi/hoàn</Text>
                    </View>
                </View>
              </>
            )}
          </View>

          <Text style={styles.note}>* Số liệu được cập nhật tự động mỗi 5 phút</Text>

          {/* Pie chart */}
          <View style={styles.pieContainer}>
            <Text style={styles.chartTitle}>Tỷ lệ thành công/thất bại</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', 
  },
  scrollViewContent: { 
    flexGrow: 1,
    paddingBottom: 20,
  },
  containerInner: {
    flex: 1,
    padding: 16,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#000',
  },
  errorText: {
    color: '#c0392b',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#fdebeb',
    borderRadius: 8,
    fontWeight: '600',
  },
  title: {
    marginBottom: 5, 
    fontSize: 24, 
    fontWeight: '800', 
    textAlign: 'center',
    color: '#2c3e50', 
  },
  subtitlePeriod: { 
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
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
    borderRadius: 16,
    padding: 24,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 16, 
    textAlign: 'center',
    fontWeight: '500',
    color: '#555',
    marginBottom: 10,
  },
  
  totalHighlightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', 
    justifyContent: 'center',
    marginVertical: 5,
  },
  totalCount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4B8BF5',
    lineHeight: 48, 
  },
  totalUnit: {
    fontSize: 24, 
    fontWeight: '600', 
    color: '#4B8BF5',
    marginBottom: 5, 
    marginLeft: 5,
    lineHeight: 24, 
  },

  warningText: {
    color: '#e74c3c', 
  },
  warning: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c0392b50',
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 25, 
      borderTopWidth: 1,
      borderTopColor: '#ecf0f1', 
      paddingTop: 15,
  },
  detailBox: {
      alignItems: 'center',
      paddingHorizontal: 10,
      flex: 1, 
  },
  detailCountSuccess: {
      fontSize: 28, 
      fontWeight: '800',
      color: '#28a745', 
  },
  detailCountFailed: {
      fontSize: 28,
      fontWeight: '800',
      color: '#dc3545', 
  },
  detailLabel: {
      fontSize: 15, 
      color: '#555',
      marginTop: 5,
      fontWeight: '600',
  },
  note: {
    fontSize: 13, 
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  chartTitle: {
      fontSize: 18, 
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
      marginBottom: 15, 
  },
  pieContainer: {
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  }
});

export default StatisticalScreen;