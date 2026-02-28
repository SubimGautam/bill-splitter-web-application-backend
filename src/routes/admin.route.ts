import express from 'express';
import User from '../models/user.model';
import Group from '../models/group.model';
import Expense from '../models/expense.model'; // Add this import
import Settlement from '../models/settlement.model'; // Add this import
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:userId', async (req: any, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all groups
router.get('/groups', async (req: any, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'username email');
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a group
router.delete('/groups/:groupId', async (req: any, res) => {
  try {
    await Group.findByIdAndDelete(req.params.groupId);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all expenses (admin only)
router.get('/expenses', async (req: any, res) => {
  try {
    const expenses = await Expense.find()
      .populate('group', 'name')
      .sort({ date: -1 });
    
    // Transform to ensure consistent format
    const transformedExpenses = expenses.map(exp => {
      const expObj = exp.toObject();
      return {
        ...expObj,
        // Ensure totalAmount exists (use amount as fallback)
        totalAmount: expObj.totalAmount || expObj.totalAmount || 0,
      };
    });
    
    res.json({ success: true, data: transformedExpenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all settlements (admin only)
router.get('/settlements', async (req: any, res) => {
  try {
    const settlements = await Settlement.find()
      .populate('group', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: settlements });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;