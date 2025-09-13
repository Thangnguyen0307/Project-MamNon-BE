import { Level } from '../models/level.model.js';
import { levelService } from '../services/level.service.js';

export const createLevel = async (req, res, next) => {
  try {
    const level = await levelService.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Tạo cấp độ thành công",
      data: level
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLevels = async (req, res, next) => {
  try {
    const result = await levelService.getAll(req.query);
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách cấp độ thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getLevelById = async (req, res, next) => {
  try {
    const level = await levelService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Lấy thông tin cấp độ thành công",
      data: level
    });
  } catch (error) {
    next(error);
  }
};

export const updateLevel = async (req, res, next) => {
  try {
    const level = await levelService.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Cập nhật cấp độ thành công",
      data: level
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLevel = async (req, res, next) => {
  try {
    const result = await levelService.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};