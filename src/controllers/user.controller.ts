import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async uploadProfileImage(req: Request, res: Response) {
    console.log("=".repeat(50));
    console.log("📤 UPLOAD PROFILE IMAGE REQUEST RECEIVED");
    console.log("=".repeat(50));
    
    try {
      // Extract user ID from auth middleware
      const userId = req.user?.id;
      
      if (!userId) {
        console.log("❌ No user ID found in request");
        return res.status(401).json({ 
          success: false,
          message: "User not authenticated" 
        });
      }
      
      // Check if file exists
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
      
      // Save relative path
      const imagePath = `/uploads/${req.file.filename}`;
      console.log("🖼️ Image path to save:", imagePath);
      
      // Update user with image path
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
      
      // Return success response
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
      
      // Return JSON error, not HTML
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
}