import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';
import { DeviceEventEmitter } from 'react-native';

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
});

socket.on('connect_error', (error) => {
  console.error('❌ Lỗi kết nối socket:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket đã ngắt kết nối:', reason);
});

// Lắng nghe sự kiện refund
socket.on('washerRefunded', ({ washerId, userId }) => {
  console.log('📢 Nhận sự kiện washerRefunded:', { washerId, userId });
  // Emit sự kiện local để UI cập nhật
  DeviceEventEmitter.emit('historyUpdated');
  DeviceEventEmitter.emit('userUpdated');
});

export default socket;