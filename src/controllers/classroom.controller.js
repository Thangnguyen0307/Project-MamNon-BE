import Classroom from '../models/classroom.model.js';
import mongoose from 'mongoose';

export const createClassroom = async (req, res) => {
  try {
    // Convert empty string or invalid teacherId to null
    if (req.body.teacherId === '' || req.body.teacherId === null || req.body.teacherId === undefined) {
      req.body.teacherId = null;
    } else if (req.body.teacherId && !mongoose.Types.ObjectId.isValid(req.body.teacherId)) {
      req.body.teacherId = null;
    }

    // Check if classroom name already exists in the same school year
    const existingClassroom = await Classroom.findOne({
      name: req.body.name,
      schoolYear: req.body.schoolYear
    });

    if (existingClassroom) {
      return res.status(400).json({ 
        error: `Lớp "${req.body.name}" đã tồn tại trong năm học ${req.body.schoolYear}` 
      });
    }

    const classroom = await Classroom.create(req.body);
    res.status(201).json(classroom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find().populate('teacherId').populate('levelId');
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id).populate('teacherId').populate('levelId');
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json(classroom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClassroom = async (req, res) => {
  try {
    // Convert empty string or invalid teacherId to null
    if (req.body.teacherId === '' || req.body.teacherId === null || req.body.teacherId === undefined) {
      req.body.teacherId = null;
    } else if (req.body.teacherId && !mongoose.Types.ObjectId.isValid(req.body.teacherId)) {
      req.body.teacherId = null;
    }

    // Check if classroom name already exists in the same school year (excluding current classroom)
    if (req.body.name && req.body.schoolYear) {
      const existingClassroom = await Classroom.findOne({
        name: req.body.name,
        schoolYear: req.body.schoolYear,
        _id: { $ne: req.params.id }  // Exclude current classroom
      });

      if (existingClassroom) {
        return res.status(400).json({ 
          error: `Lớp "${req.body.name}" đã tồn tại trong năm học ${req.body.schoolYear}` 
        });
      }
    }

    const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json(classroom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json({ message: 'Classroom deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
