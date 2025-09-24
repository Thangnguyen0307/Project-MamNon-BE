// Video queue producer: publish jobs to RabbitMQ (RabbitMQ-only)
import dotenv from 'dotenv';
dotenv.config();

const useRabbit = process.env.QUEUE_BACKEND === 'rabbitmq' && !!process.env.RABBITMQ_URL;
let amqplib = null;

async function ensureRabbit() {
  if (!useRabbit) {
    throw new Error('Queue is RabbitMQ-only: set QUEUE_BACKEND=rabbitmq and RABBITMQ_URL in environment');
  }
  if (!amqplib) {
    try {
      amqplib = (await import('amqplib')).default || (await import('amqplib'));
    } catch (e) {
      throw new Error('amqplib is required for RabbitMQ. Install dependency and set RABBITMQ_URL.');
    }
  }
  return amqplib;
}

export async function addJob(job) {
  const rabbit = await ensureRabbit();
  const RABBITMQ_URL = process.env.RABBITMQ_URL;
  const ENV_PREFIX = process.env.NODE_ENV ? `${process.env.NODE_ENV}_` : '';
  const queueName = `${ENV_PREFIX}${job.type || 'video.ensure.h264aac'}`;
  const conn = await rabbit.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(queueName, { durable: true });
  try {
    console.log('[Queue] Enqueue job ->', queueName, job);
  } catch {}
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(job)), { persistent: true });
  setTimeout(async () => { try { await ch.close(); await conn.close(); } catch {} }, 100);
}

export async function addVideoEnsureJob(payload) {
  // Backward compatibility: allow calling with just videoId
  if (typeof payload === 'string') {
    return addJob({ type: 'video.ensure.h264aac', videoId: String(payload) });
  }
  const { videoId, notifyUserId } = payload || {};
  return addJob({ type: 'video.ensure.h264aac', videoId: String(videoId), ...(notifyUserId ? { notifyUserId: String(notifyUserId) } : {}) });
}

export async function addVideoUploadS3Job(payload) {
  return addJob({ type: 'video.upload.s3.hls', ...payload });
}
