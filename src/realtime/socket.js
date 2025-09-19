import { Server } from 'socket.io';
import { env } from '../config/environment.js';
import messageEvents from './events/message.event.js';

let ioInstance = null;

export function initSocket(httpServer) {
  const origins = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN : ['*'];
  ioInstance = new Server(httpServer, {
    cors: {
      origin: origins.includes('*') ? '*' : origins,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    // Client can join a room per video to receive events
    socket.on('subscribeVideo', ({ videoId }) => {
      if (!videoId) return;
      socket.join(`video:${String(videoId)}`);
      socket.emit('subscribed', { room: `video:${String(videoId)}` });
    });

    socket.on('unsubscribeVideo', ({ videoId }) => {
      if (!videoId) return;
      socket.leave(`video:${String(videoId)}`);
    });

    messageEvents(socket, ioInstance);
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitVideoEvent(videoId, event, data) {
  if (!ioInstance) return;
  const room = `video:${String(videoId)}`;
  ioInstance.to(room).emit(event, data);
}
