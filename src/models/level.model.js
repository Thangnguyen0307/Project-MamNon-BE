import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

levelSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Level', levelSchema);