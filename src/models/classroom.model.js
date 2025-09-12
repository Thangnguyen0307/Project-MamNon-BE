import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  schoolYear: { type: String, required: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để có id ngoài _id
classroomSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Classroom', classroomSchema);
