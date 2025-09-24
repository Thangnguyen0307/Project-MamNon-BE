import { Server } from 'socket.io';
import { env } from '../../config/environment.js';
import { registerVideoHandlers } from './events/video.events.js';

let io = null; 

export function initSocket(httpServer) {
  if (io) return io; // tránh khởi tạo lại
  const origins = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN : ['*'];
  io = new Server(httpServer, {
    cors: {
      origin: origins.includes('*') ? '*' : origins,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Register video domain handlers (include identify event)
    registerVideoHandlers(socket, io);

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', socket.id, reason);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO chưa được init');
  return io;
}