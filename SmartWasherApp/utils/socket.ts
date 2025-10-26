import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';
import { DeviceEventEmitter, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kết nối tới server WebSocket
const socket = io(API_BASE_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Lắng nghe các sự kiện kết nối
socket.on('connect', () => {
  console.log('✅ Đã kết nối tới server socket:', socket.id);
  // Khi kết nối, nếu đã có user trong AsyncStorage thì identify để join phòng user
  (async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const user = JSON.parse(data);
        if (user?.id) {
          socket.emit('identify', user.id);
          console.log('🔐 Gửi identify cho socket với userId=', user.id);
        }
      }
    } catch (e) {
      console.warn('Lỗi khi gửi identify:', e);
    }
  })();
});

// Nếu app khôi phục phiên hoặc đăng nhập xong, có thể emit sự kiện 'userIdentified'
// để đảm bảo socket được thông báo (trường hợp socket đã connect trước khi AsyncStorage có user)
DeviceEventEmitter.addListener('userIdentified', (payload) => {
  try {
    const user = payload?.user;
    if (user && user.id && socket && socket.connected) {
      socket.emit('identify', user.id);
      console.log('🔐 Gửi identify (userIdentified) cho socket với userId=', user.id);
    }
  } catch (e) {
    console.warn('Lỗi khi xử lý userIdentified:', e);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Lỗi kết nối socket:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket đã ngắt kết nối:', reason);
});

// Lắng nghe sự kiện refund
socket.on('washerRefunded', async ({ washerId, userId, user, history, message }) => {
  console.log('📢 Nhận sự kiện washerRefunded:', { washerId, userId, message });
  
  // Cập nhật user data trong AsyncStorage nếu có
  if (user) {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('💾 Đã lưu user mới từ socket vào AsyncStorage:', { id: user.id, free_washes_left: user.free_washes_left });
      // Emit với payload để HomeScreen cập nhật ngay
      DeviceEventEmitter.emit('userUpdated', { user, isRefund: true });
    } catch (e) {
      console.warn('Lỗi khi lưu user data:', e);
    }
  }

  // Thông báo cho người dùng
  // Alert.alert('❌ Máy giặt lỗi', 'Đã hoàn lại 1 lượt giặt miễn phí');
  
  // Báo các màn hình cập nhật
  DeviceEventEmitter.emit('historyUpdated', history);
});



export default socket;