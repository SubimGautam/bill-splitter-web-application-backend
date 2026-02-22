import express from 'express';
import { UserController } from '../controllers/user.controller';
import auth from '../middleware/auth';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();
const userController = new UserController();

// Get current user
router.get('/me', auth, userController.getMe.bind(userController));

// Upload profile image
router.post('/upload-profile-image', auth, upload.single('image'), userController.uploadProfileImage.bind(userController));

export default router;