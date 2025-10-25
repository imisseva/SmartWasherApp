import { Server } from 'socket.io';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('🔌 Có client kết nối:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌 Client ngắt kết nối:', socket.id);
    });
  });

  return io;
};

export const emitRefundEvent = (io, userId, washerId) => {
  if (!io) return;
  try {
    io.emit('washerRefunded', { userId, washerId });
    console.log('✅ Đã gửi sự kiện washerRefunded:', { userId, washerId });
  } catch (err) {
    console.error('❌ Lỗi khi gửi sự kiện washerRefunded:', err);
  }
};