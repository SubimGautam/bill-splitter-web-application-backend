import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profileImage: { type: String },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);