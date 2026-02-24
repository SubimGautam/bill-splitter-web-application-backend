import express from 'express';
import User from '../models/user.model';
import Group from '../models/group.model';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// All admin routes require auth + admin check
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get('/users', async (req: any, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:userId', async (req: any, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all groups
router.get('/groups', async (req: any, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'username email');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a group
router.delete('/groups/:groupId', async (req: any, res) => {
  try {
    await Group.findByIdAndDelete(req.params.groupId);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;