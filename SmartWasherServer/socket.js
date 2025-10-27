import { Server } from 'socket.io';

// Biến toàn cục để lưu instance io
let _io = null;

export const setupSocket = (server) => {
  _io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  _io.on('connection', (socket) => {
    console.log('🔌 Có client kết nối:', socket.id);
    // Client can identify itself (join a user-specific room)
    socket.on('identify', (userId) => {
      try {
        if (userId) {
          const room = `user_${userId}`;
          socket.join(room);
          console.log(`🔐 Socket ${socket.id} joined room ${room}`);
        }
      } catch (e) {
        console.warn('identify handler error', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client ngắt kết nối:', socket.id);
    });
  });

  return _io;
};

// Export io instance để các module khác có thể sử dụng
export const io = () => _io;

export const emitRefundEvent = (userId, washerId, user, history) => {
  if (!_io) return;
  try {
    const payload = {
      userId,
      washerId,
      user,
      history,
      message: '✅ Đã hoàn lại lượt giặt miễn phí do máy gặp lỗi'
    };
    console.log('📡 [Socket] Gửi sự kiện washerRefunded với payload:', {
      userId,
      washerId,
      hasUser: !!user,
      hasHistory: !!history,
    });
    // If userId provided, emit only to that user's room; otherwise broadcast
    if (userId) {
      const room = `user_${userId}`;
      _io.to(room).emit('washerRefunded', payload);
      console.log(`✅ Đã emit washerRefunded to room ${room}`);
    } else {
      _io.emit('washerRefunded', payload);
      console.log('✅ Đã emit washerRefunded (broadcast)');
    }
  } catch (err) {
    console.error('❌ Lỗi khi gửi sự kiện washerRefunded:', err);
  }
};

export const emitWashCreated = (userId, washerId, user, history) => {
  if (!_io) return;
  try {
    const payload = {
      userId,
      washerId,
      user,
      history,
      message: '✅ Có lượt giặt mới'
    };
    if (userId) {
      const room = `user_${userId}`;
      _io.to(room).emit('washCreated', payload);
      console.log(`✅ Đã emit washCreated to room ${room}`);
    } else {
      _io.emit('washCreated', payload);
      console.log('✅ Đã emit washCreated (broadcast)');
    }
  } catch (err) {
    console.error('❌ Lỗi khi gửi sự kiện washCreated:', err);
  }
};