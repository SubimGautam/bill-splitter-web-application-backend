import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";

const router = Router();
const authController = new AuthController();

// Add this test route BEFORE other routes
router.get("/debug-user-repo", async (req, res) => {
  try {
    console.log("🧪 Testing UserRepository...");
    
    const userRepo = new UserRepository();
    
    // Test 1: Check if methods exist
    console.log("🔍 Checking method existence:");
    console.log("   - findByEmail exists:", typeof userRepo.findByEmail === 'function' ? '✅ YES' : '❌ NO');
    console.log("   - create exists:", typeof userRepo.create === 'function' ? '✅ YES' : '❌ NO');
    
    // Test 2: Try to call findByEmail
    console.log("🔍 Testing findByEmail with test@test.com...");
    try {
      const testResult = await userRepo.findByEmail("test@test.com");
      console.log("   - Result:", testResult ? `User found: ${testResult.email}` : "No user found");
    } catch (error: any) { // ✅ Fix: Add type annotation
      console.log("   - Error:", error.message);
    }
    
    // Test 3: List all users in database
    console.log("🔍 Listing all users in database...");
    const UserModel = require("../models/user.model").default;
    const allUsers = await UserModel.find({});
    console.log(`   - Total users: ${allUsers.length}`);
    allUsers.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ${user.email} (${user.username})`);
    });
    
    res.json({
      success: true,
      message: "Debug test completed",
      repoMethods: {
        findByEmailExists: typeof userRepo.findByEmail === 'function',
        createExists: typeof userRepo.create === 'function'
      },
      totalUsers: allUsers.length,
      users: allUsers.map((u: any) => ({
        id: u._id,
        email: u.email,
        username: u.username
      }))
    });
    
  } catch (error: any) { // ✅ Fix: Add type annotation
    console.error("🔥 Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Your existing routes
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;