// Worker process to consume video jobs from RabbitMQ
import 'dotenv/config';
import { startRabbitConsumer } from '../queues/videoqueue.consumer.js';
import { connectToMongo } from '../config/mongodb.js';

// Importing video.service registers the processor via registerProcessor()
// It also wires the processing logic used by the consumer
import '../services/video.service.js';

// Connect to MongoDB first to avoid buffering timeouts
await connectToMongo();
// Start the RabbitMQ consumer
await startRabbitConsumer();
console.log('Video queue worker started and consuming from RabbitMQ...');
