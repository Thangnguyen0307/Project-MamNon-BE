
// Video socket events constants
const VIDEO_EVENTS = {
  READY: 'video.ready',
  FAILED: 'video.failed'
};

// Helper functions để emit video events
export function emitVideoReady(io, userId, { videoId, m3u8, thumbnail }) {
  if (!io || !userId) return;
  try {
    const payload = {
      type: VIDEO_EVENTS.READY,
      title: 'Video đã sẵn sàng',
      message: 'Video đã được xử lý xong.',
      videoId: String(videoId),
      m3u8,
      thumbnail: thumbnail || null,
      status: 'ready',
      at: new Date().toISOString()
    };
    io.to(`user:${userId}`).emit(VIDEO_EVENTS.READY, payload);
    console.log('[Socket] Video ready sent to user:', userId);
  } catch (e) {
    console.error('[Socket][Video] emit READY lỗi', e.message);
  }
}

export function emitVideoFailed(io, userId, { videoId, error }) {
  if (!io || !userId) return;
  try {
    const payload = {
      type: VIDEO_EVENTS.FAILED,
      title: 'Xử lý video thất bại',
      message: error || 'Có lỗi xảy ra khi xử lý video.',
      videoId: String(videoId),
      error: error || 'UNKNOWN',
      status: 'failed',
      at: new Date().toISOString()
    };
    io.to(`user:${userId}`).emit(VIDEO_EVENTS.FAILED, payload);
    console.log('[Socket] Video failed sent to user:', userId);
  } catch (e) {
    console.error('[Socket][Video] emit FAILED lỗi', e.message);
  }
}

// Register video socket handlers
export function registerVideoHandlers(socket, io) {
  // FE phải identify để join room user:${userId}
  socket.on('identify', ({ userId }) => {
    if (!userId) return;
    const id = String(userId);
    socket.join(`user:${id}`);
    socket.emit('identified', { userId: id });
    console.log('[Socket] User joined room:', `user:${id}`);
  });
}
