import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  profileImage? : string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"]
    },
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
    type: String,
    default: null,
    },

  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Destructure to remove properties and keep the rest
        const { password, __v, ...rest } = ret;
        return rest;
      }
    }
  }
);

userSchema.index({ email: 1 }, { unique: true });

export default model<IUser>("User", userSchema);