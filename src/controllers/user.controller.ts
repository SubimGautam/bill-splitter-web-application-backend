import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import User from "../models/user.model";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const userService = new UserService();

export class UserController {
  async uploadProfileImage(req: Request, res: Response) {
    console.log("=".repeat(50));
    console.log("📤 UPLOAD PROFILE IMAGE REQUEST RECEIVED");
    console.log("=".repeat(50));

    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        console.log("❌ No user ID found in request");
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please select an image."
        });
      }

      console.log("✅ File uploaded successfully:");
      console.log("   - Original Name:", req.file.originalname);
      console.log("   - Saved Filename:", req.file.filename);
      console.log("   - Path:", req.file.path);
      console.log("   - Mimetype:", req.file.mimetype);
      console.log("   - Size:", req.file.size, "bytes");

      // Convert image to JPEG for better compatibility
      const inputPath = req.file.path;
      const outputFilename = `profile-${Date.now()}.jpg`;
      const outputPath = path.join('uploads', outputFilename);

      console.log("🔄 Converting image to JPEG...");
      
      await sharp(inputPath)
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outputPath);

      console.log("✅ Image converted to JPEG successfully");

      // Remove the original uploaded file
      fs.unlinkSync(inputPath);
      console.log("🗑️ Original file removed");

      const imagePath = `/uploads/${outputFilename}`;
      console.log("🖼️ Image path to save:", imagePath);

      console.log("🔄 Calling userService.uploadProfileImage...");
      const updatedUser = await userService.uploadProfileImage(userId, imagePath);

      if (!updatedUser) {
        console.log("❌ Failed to update user in database");
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      console.log("✅ Profile image updated successfully in database");
      console.log("📊 Updated user profileImage:", updatedUser.profileImage);

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          profileImage: updatedUser.profileImage,
          userId: updatedUser._id,
          fullUrl: `http://localhost:5000${imagePath}`
        }
      });
    } catch (error: any) {
      console.error("🔥 ERROR in uploadProfileImage:");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);

      // Clean up the uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload profile image",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } finally {
      console.log("=".repeat(50));
      console.log("📤 UPLOAD REQUEST PROCESSING COMPLETED");
      console.log("=".repeat(50));
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

      const user = await User.findById(userId).select("-password -__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Construct full URL for profile image
      let profileImageUrl = user.profileImage;
      if (profileImageUrl && !profileImageUrl.startsWith('http')) {
        profileImageUrl = `http://localhost:5000${profileImageUrl}`;
      }

      const userData = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: profileImageUrl
      };

      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error: any) {
      console.error("getMe error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching user data"
      });
    }
  }
}