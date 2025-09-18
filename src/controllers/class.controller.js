import { classService } from '../services/class.service.js';


export const createClass = async (req, res) => {
  try {
    const classInstance = await classService.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    return res.status(error.status || 500).json({ 
      success: false,
      message: error.message || "Lỗi server" 
    });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const result = await classService.getAll(req.query);
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách lớp học thành công",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({ 
      success: false,
      message: error.message || "Lỗi server" 
    });
  }
};

export const getClassById = async (req, res) => {
  try {
    const classInstance = await classService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Lấy thông tin lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || "L?i server" });
  }
};

export const updateClass = async (req, res) => {
  try {
    const classInstance = await classService.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: classInstance
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || "L?i server" });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const result = await classService.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || "L?i server" });
  }
};

export const getMyClasses  = async (req, res) => {
  try{
    const teacherId = req.payload.userId;
     
    const result = await classService.getByUserId(teacherId, req.query);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách lớp của giáo viên thành công",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Lỗi server"
    });
  }
};
