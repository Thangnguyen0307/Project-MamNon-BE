// Video queue consumer: RabbitMQ-only consumer
// ESM module
import dotenv from 'dotenv';
dotenv.config();

let processor = null; // async (job) => void

const useRabbit = process.env.QUEUE_BACKEND === 'rabbitmq' && !!process.env.RABBITMQ_URL;
let amqplib = null;
let rabbitConn = null;
let rabbitChannel = null;

async function ensureRabbit() {
  if (!useRabbit) return null;
  if (!amqplib) {
    try {
      amqplib = (await import('amqplib')).default || (await import('amqplib'));
    } catch (e) {
  throw new Error('amqplib is required for RabbitMQ consumer. Install dependency.');
    }
  }
  return amqplib;
}

export function registerProcessor(fn) {
  processor = fn;
  // Optionally start RabbitMQ consumer in this process when explicitly enabled
  if (process.env.START_QUEUE_CONSUMER === 'true') {
    startRabbitConsumer().catch(err => console.error('Rabbit consumer failed to start:', err.message));
  }
}

export async function startRabbitConsumer(options = {}) {
  const rabbit = await ensureRabbit();
  if (!useRabbit || !rabbit) {
    throw new Error('RabbitMQ is required. Set QUEUE_BACKEND=rabbitmq and RABBITMQ_URL.');
  }

  const RABBITMQ_URL = process.env.RABBITMQ_URL;
  const ENV_PREFIX = process.env.NODE_ENV ? `${process.env.NODE_ENV}_` : '';
  const defaultQueues = [
    `${ENV_PREFIX}video.ensure.h264aac`,
    `${ENV_PREFIX}video.upload.s3.hls`,
  ];
  const queueNames = options.queueNames && options.queueNames.length ? options.queueNames : defaultQueues;

  if (!processor) {
    console.warn('registerProcessor has not been set; Rabbit consumer will buffer in broker until processor is ready.');
  }

  // Reuse single connection/channel
  rabbitConn = await rabbit.connect(RABBITMQ_URL);
  rabbitChannel = await rabbitConn.createChannel();
  await rabbitChannel.prefetch(1);

  for (const qName of queueNames) {
    await rabbitChannel.assertQueue(qName, { durable: true });
    await rabbitChannel.consume(qName, async (msg) => {
      if (!msg) return;
      let job = null;
      try {
        job = JSON.parse(msg.content.toString());
      } catch (e) {
        console.error('Invalid job JSON, acking to drop:', e.message);
        rabbitChannel.ack(msg);
        return;
      }
      try {
        if (processor) {
          await processor(job);
        } else {
          // If no processor registered yet, requeue once to avoid tight loop
          rabbitChannel.nack(msg, false, true);
          return;
        }
        rabbitChannel.ack(msg);
      } catch (e) {
        const em = (e && e.message) ? e.message : String(e);
        // Transient: status not ready yet -> requeue
        if (em.includes('NOT_READY')) {
          try { console.warn('Transient error (NOT_READY). Requeue job'); } catch {}
          rabbitChannel.nack(msg, false, true);
          return;
        }
        // Fatal: drop or send to DLQ (ack here)
        console.error('Processor error, ack to avoid infinite retry:', em);
        rabbitChannel.ack(msg);
      }
    }, { noAck: false });
  }

  // Handle process termination
  const cleanup = async () => {
    try { if (rabbitChannel) await rabbitChannel.close(); } catch {}
    try { if (rabbitConn) await rabbitConn.close(); } catch {}
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
