import Level from '../models/level.model.js';

export const createLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find();
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json({ message: 'Level deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};