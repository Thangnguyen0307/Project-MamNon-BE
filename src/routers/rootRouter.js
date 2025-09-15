
import express from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';
import classRouter from './class.router.js';
import levelRouter from './level.router.js';
import adminRouter from './adminRouter.js';
import blogRouter from './blog.router.js';

const rootRouter = express.Router();

rootRouter.get('/', (req, res) => {
    res.send('Welcome to the API root!');
});

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/classes', classRouter);
rootRouter.use('/levels', levelRouter);
rootRouter.use('/admins', adminRouter);
rootRouter.use('/blogs', blogRouter);
export default rootRouter;