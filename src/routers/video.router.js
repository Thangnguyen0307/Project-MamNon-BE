import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import multer from 'multer';
import { initVideoUpload, uploadVideoChunkGeneric } from '../controllers/video.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { initVideoSchema, chunkParamsSchema, uploadVideoChunkSchema } from '../validations/video.validation.js';

const router = express.Router();
const chunkUpload = multer({ storage: multer.memoryStorage() }).any();

router.post('/init', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), validate(initVideoSchema), initVideoUpload);
router.post('/:id/chunk',
	authenticate,
	authorize([ROLE.ADMIN, ROLE.TEACHER]),
	chunkUpload, // parse multipart -> req.body
	validate(chunkParamsSchema, 'params'),
	validate(uploadVideoChunkSchema),
	(req, res, next) => {
		if (!req.files || !req.files[0]) return res.status(400).json({ success:false, message:'Missing file chunk' });
		next();
	},
	uploadVideoChunkGeneric
);

export default router;
