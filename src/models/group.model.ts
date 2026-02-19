// models/group.model.ts
import mongoose, { Schema } from 'mongoose';

const groupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }], // plain names
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Group', groupSchema);