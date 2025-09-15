import { userService } from '../services/user.service.js';

export async function getUsers(req, res) {
    const users = await userService.getUsers(req.query);
    res.json(users);
}

export async function getUserDetail(req, res) {
    console.log(req.payload);
    
    // const user = await userService.getUserDetail(req.params.id);
    return res.json(req.payload);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function updateUser(req, res) {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function updateUserStatus(req, res) {
    const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}

export async function deleteUser(req, res) {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json({ message: 'Đã xóa user thành công' });
}

export async function updateUserRole(req, res) {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
}
