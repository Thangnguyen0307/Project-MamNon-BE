
import express from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';
import classroomRouter from './classroom.router.js';
import levelRouter from './level.router.js';

const rootRouter = express.Router();

rootRouter.get('/', (req, res) => {
    res.send('Welcome to the API root!');
});

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/classrooms', classroomRouter);
rootRouter.use('/levels', levelRouter);
export default rootRouter;