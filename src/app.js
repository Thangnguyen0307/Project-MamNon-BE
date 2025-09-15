import express from 'express';
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

const app = express();

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
app.use("/zalo_verifier", express.static(path.join(process.cwd(), "zalo_verifier")));

app.listen(env.PORT, () => {
    console.log(`🚀 Server is running on port: ${env.PORT}`);
});

seedAdminUser();
seedLevels();
connectToMongo();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', rootRouter);