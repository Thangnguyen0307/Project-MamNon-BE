import express from 'express';
import * as classroomController from '../controllers/classroom.controller.js';
import { createClassroomSchema, updateClassroomSchema } from '../validations/classroom.validation.js';
import validate from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tạo lớp học
router.post(
  '/',
  authMiddleware,
  validate(createClassroomSchema),
  classroomController.createClassroom
);

// Lấy tất cả lớp học
router.get('/', authMiddleware, classroomController.getAllClassrooms);

// Lấy chi tiết lớp học
router.get('/:id', authMiddleware, classroomController.getClassroomById);

// Cập nhật lớp học
router.put(
  '/:id',
  authMiddleware,
  validate(updateClassroomSchema),
  classroomController.updateClassroom
);

// Xoá lớp học
router.delete('/:id', authMiddleware, classroomController.deleteClassroom);

export default router;
