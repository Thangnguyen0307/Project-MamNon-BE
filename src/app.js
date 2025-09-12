import express from 'express';
import cors from 'cors';
import { env } from './config/environment.js';
import { connectToMongo } from './config/mongodb.js';
import swaggerDocument from './swagger/index.js';
import swaggerUi from 'swagger-ui-express';
import { seedAdminUser } from './seeds/seedAdmin.js';
import rootRouter from './routers/rootRouter.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('.'))

app.listen(env.PORT, () => {
    console.log(`🚀 Server is running on port: ${env.PORT}`);
});

seedAdminUser();
connectToMongo();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', rootRouter);