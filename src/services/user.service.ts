import { UserRepository } from "../repositories/user.repository";

const userRepo = new UserRepository();

export class UserService {
  async uploadProfileImage(userId: string, imagePath: string) {
    console.log("🔄 UserService.uploadProfileImage called");
    console.log("   - User ID:", userId);
    console.log("   - Image Path:", imagePath);
    
    // Validate inputs
    if (!userId || !imagePath) {
      console.log("❌ Invalid inputs to uploadProfileImage");
      throw new Error("User ID and image path are required");
    }
    
    console.log("📞 Calling userRepo.updateProfileImage...");
    const user = await userRepo.updateProfileImage(userId, imagePath);

    if (!user) {
      console.log("❌ User not found or update failed");
      throw new Error("User not found");
    }

    console.log("✅ UserService update successful");
    console.log("   - Updated profileImage:", user.profileImage);
    
    return {
      _id: user._id,
      profileImage: user.profileImage,
      username: user.username,
      email: user.email
    };
  }
}