// Video domain: event names, room helpers, and payload builders

export const EVENTS = Object.freeze({
  READY: 'ready',
  FAILED: 'failed'
});

export const ROOMS = Object.freeze({
  user: (id) => `user:${String(id)}`
});

export const PAYLOADS = Object.freeze({
  ready: ({ videoId, m3u8, thumbnail }) => ({
    type: 'video.ready',
    title: 'Video đã sẵn sàng',
    message: 'Video đã được xử lý xong.',
    videoId: String(videoId),
    m3u8,
    thumbnail: thumbnail || null,
    status: 'ready',
    at: new Date().toISOString()
  }),
  failed: ({ videoId, error }) => ({
    type: 'video.failed',
    title: 'Xử lý video thất bại',
    message: error || 'Có lỗi xảy ra khi xử lý video.',
    videoId: String(videoId),
    error: error || 'UNKNOWN',
    status: 'failed',
    at: new Date().toISOString()
  })
});
