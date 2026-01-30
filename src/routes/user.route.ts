import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// Add a test route first
router.get("/upload-test", authMiddleware, (req, res) => {
  console.log("🧪 Upload test endpoint reached");
  res.json({
    success: true,
    message: "Upload endpoint is reachable",
    userId: req.user?.id
  });
});

// Then the actual upload route
router.put(
  "/profile/image",
  authMiddleware,
  upload.single("image"),
  userController.uploadProfileImage
);

export default router;