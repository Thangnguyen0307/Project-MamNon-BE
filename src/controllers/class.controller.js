import { Class } from '../models/class.model.js';
import { classService } from '../services/class.service.js';
import mongoose from 'mongoose';

export const createClass = async (req, res, next) => {
  try {
    const classInstance = await classService.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (req, res, next) => {
  try {
    const result = await classService.getAll(req.query);
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách lớp học thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const classInstance = await classService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Lấy thông tin lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const classInstance = await classService.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const result = await classService.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};
