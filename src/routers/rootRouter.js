import express from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';

const rootRouter = express.Router();

rootRouter.get('/', (req, res) => {
    res.send('Welcome to the API root!');
});

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);
export default rootRouter;