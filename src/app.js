import express from 'express';
import http from 'http';
import cors from 'cors';
import { env } from './config/environment.js';
import { connectToMongo } from './config/mongodb.js';
import swaggerDocument from './swagger/index.js';
import swaggerUi from 'swagger-ui-express';
import { seedAdminUser } from './seeds/seedAdmin.js';
import { seedLevels } from './seeds/seedLevel.js';
import rootRouter from './routers/rootRouter.js';
import userRouter from './routers/userRouter.js';
import path from "path";
import fs from 'fs';
import { initSocket } from './realtime/sockets/index.js';
import { startRabbitConsumer } from './queues/videoqueue.consumer.js';


const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Nếu không có origin (VD: Postman) thì cho phép
        if (!origin) return callback(null, true);

        // Nếu set là * thì cho phép hết
        if (env.CORS_ORIGIN.includes('*')) {
            return callback(null, true);
        }

        // Check trong whitelist
        if (env.CORS_ORIGIN.includes(origin)) {
            return callback(null, true);
        }

        // Nếu không match -> block
        return callback(new Error(`❌ Not allowed by CORS: ${origin}`));
    },
    credentials: true // nếu cần cookie, token
}));
app.use(express.static('.'))
app.use('/api/user', userRouter);

// Removed legacy /videos static route; HLS is served from /uploadeds/**

// Serve new storage root 'uploadeds' with correct MIME and caching
app.get(/^\/uploadeds\/(.*)/, (req, res) => {
    const relative = req.params[0];
    if (!relative) return res.status(400).json({ success: false, message: 'Missing path' });
    const filePath = path.join(process.cwd(), 'uploadeds', relative);
    if (!fs.existsSync(filePath)) return res.status(404).end();

    if (filePath.endsWith('.m3u8')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (filePath.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t');
    } else if (/(\.jpe?g)$/i.test(filePath)) {
        res.setHeader('Content-Type', 'image/jpeg');
    } else if (/\.png$/i.test(filePath)) {
        res.setHeader('Content-Type', 'image/png');
    }
    if (/\.(ts|m3u8)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=60');
    }
    fs.createReadStream(filePath).pipe(res);
});

// Simple health endpoint for Docker HEALTHCHECK
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = Number(env.PORT) || 8080;
const HOST = process.env.HOST || 'http://localhost';
const base = `${HOST}:${PORT}`;
const apiBase = `${base}/api`;

server.listen(PORT, () => {
    const healthUrl = `${base}/health`;
    const rabbitUrl = env.RABBITMQ_URL || '(not set)';

    console.log(`\n🚀 Server is running on port: ${PORT}`);
    console.log('========================================================');
    console.log(`API Base    : ${apiBase}`);
    console.log(`Health      : ${healthUrl}`);
    console.log(`RabbitMQ    : ${rabbitUrl}`);
    console.log('RabbitMQ UI : http://localhost:15672');
    console.log(`WebSocket   : ${base} (namespace /, event subscribeVideo)`);
    console.log('========================================================\n');
});

// Kết nối tới MongoDB
await connectToMongo();

// Khởi động RabbitMQ consumer (tương tự như trong worker)
await startRabbitConsumer();

seedAdminUser();
seedLevels();

app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

app.use('/api', rootRouter);

/*npm run mq:ensure
--> npm run dev:rabbit:all || 
OR
npm run dev:api:rabbit
--> mở teminal khác
npm run dev:worker:rabbit
*/