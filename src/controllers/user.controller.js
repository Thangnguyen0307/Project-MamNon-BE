import { userService } from '../services/user.service.js';

export async function getUsers(req, res) {
    const users = await userService.getUsers(req.query);
    res.json(users);
}

export async function getUserDetail(req, res) {
    
    const user = await userService.getUserDetail(req.payload.userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function updateUser(req, res) {
    const user = await userService.updateUser(req.payload.userId, req.body);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function updateUserStatus(req, res) {
    const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function deleteUser(req, res) {
    const user = await userService.deleteUser(req.payload.userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json({ message: 'Đã xóa user thành công' });
}

export async function updateUserRole(req, res) {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function getAllTeachers(req, res) {
  try {
    const result = await userService.getAllTeachers(req.query);
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách giáo viên thành công',
      data: result // { users, pagination }
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
}